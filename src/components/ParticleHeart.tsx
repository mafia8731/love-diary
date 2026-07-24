"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ===== 心形参数方程 =====
function heartPosition(t: number, scale: number = 1): [number, number, number] {
  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return [(x / 16) * scale, (y / 16) * scale, 0];
}

// ===== 生成3D心形粒子 =====
function generateHeartParticles(count: number, scale: number): {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const palette = [
    new THREE.Color("#f8a5c2"),
    new THREE.Color("#ffb7c5"),
    new THREE.Color("#ff7f7f"),
    new THREE.Color("#fcd5ce"),
    new THREE.Color("#ffdab9"),
    new THREE.Color("#f0c27a"),
    new THREE.Color("#e8d5f5"),
  ];

  const surfaceCount = Math.floor(count * 0.4);
  const innerCount = Math.floor(count * 0.4);
  const haloCount = count - surfaceCount - innerCount;

  let idx = 0;

  // 表面粒子
  for (let i = 0; i < surfaceCount; i++) {
    const t = (i / surfaceCount) * Math.PI * 2;
    const [hx, hy] = heartPosition(t, scale);
    const angle = Math.random() * Math.PI * 2;
    const depthRadius = Math.abs(hx) * 0.5 + 0.3;
    const z = Math.cos(angle) * depthRadius;

    positions[idx * 3] = hx;
    positions[idx * 3 + 1] = hy;
    positions[idx * 3 + 2] = z;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[idx * 3] = color.r;
    colors[idx * 3 + 1] = color.g;
    colors[idx * 3 + 2] = color.b;

    sizes[idx] = Math.random() * 2 + 1.5;
    idx++;
  }

  // 内部填充
  for (let i = 0; i < innerCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.7;
    const [hx, hy] = heartPosition(t, scale * r);
    const z = (Math.random() - 0.5) * (Math.abs(hx) * 0.8 + 0.5);

    positions[idx * 3] = hx;
    positions[idx * 3 + 1] = hy;
    positions[idx * 3 + 2] = z;

    const color = palette[Math.floor(Math.random() * palette.length)];
    const dim = 0.5 + r * 0.5;
    colors[idx * 3] = color.r * dim;
    colors[idx * 3 + 1] = color.g * dim;
    colors[idx * 3 + 2] = color.b * dim;

    sizes[idx] = Math.random() * 1.5 + 0.8;
    idx++;
  }

  // 光晕漂浮粒子
  for (let i = 0; i < haloCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const [hx, hy] = heartPosition(t, scale * 1.25);
    const z = (Math.random() - 0.5) * 4;

    positions[idx * 3] = hx + (Math.random() - 0.5) * 3;
    positions[idx * 3 + 1] = hy + (Math.random() - 0.5) * 3;
    positions[idx * 3 + 2] = z;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[idx * 3] = color.r * 0.4;
    colors[idx * 3 + 1] = color.g * 0.4;
    colors[idx * 3 + 2] = color.b * 0.4;

    sizes[idx] = Math.random() * 1 + 0.3;
    idx++;
  }

  return { positions, colors, sizes };
}

// ===== 粒子着色器材质 =====
const vertexShader = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uTime;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vColor = color;
    vAlpha = 1.0 - abs(mvPosition.z) / 15.0;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * 0.7 * vAlpha;
    alpha += smoothstep(0.2, 0.0, d) * 0.3;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ===== 粒子心形 =====
function ParticleHeart() {
  const pointsRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const PARTICLE_COUNT = 3500;

  const geoRef = useRef<THREE.BufferGeometry>(null!);

  const { positions, colors, sizes } = useMemo(
    () => generateHeartParticles(PARTICLE_COUNT, 3.5),
    []
  );

  // 使用 useEffect 设置 geometry attributes
  const setGeometry = useCallback(
    (geo: THREE.BufferGeometry) => {
      if (!geo) return;
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    },
    [positions, colors, sizes]
  );

  const handlePointerMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    []
  );

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.3;
    pointsRef.current.rotation.x += delta * 0.1;

    const targetRotY = mouseRef.current.x * 0.5;
    const targetRotX = mouseRef.current.y * 0.3;
    const currentRotY = pointsRef.current.rotation.y;
    const currentRotX = pointsRef.current.rotation.x;
    pointsRef.current.rotation.y += (targetRotY - (currentRotY % (Math.PI * 2))) * 0.02;
    pointsRef.current.rotation.x += (targetRotX - (currentRotX % (Math.PI * 2))) * 0.02;
  });

  return (
    <>
      <mesh onPointerMove={handlePointerMove} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry ref={setGeometry} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// ===== 背景星空 =====
function StarField() {
  const starsRef = useRef<THREE.Points>(null!);
  const STAR_COUNT = 500;

  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const setGeometry = useCallback(
    (geo: THREE.BufferGeometry) => {
      if (!geo) return;
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    },
    [positions]
  );

  useFrame((_, delta) => {
    if (!starsRef.current) return;
    starsRef.current.rotation.y += delta * 0.05;
    starsRef.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry ref={setGeometry} />
      <pointsMaterial
        size={0.03}
        color="#ffb7c5"
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ===== 导出 =====
export default function ParticleHeartCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <StarField />
        <ParticleHeart />
      </Canvas>
    </div>
  );
}
