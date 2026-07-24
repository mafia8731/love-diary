"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vert = /* glsl */ `
  attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
  varying vec3 vColor; varying float vAlpha;
  void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*(26.0/-mv.z);gl_Position=projectionMatrix*mv;vColor=aColor;vAlpha=aAlpha;}
`;
const frag = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main(){float d=length(gl_PointCoord-0.5);float c=exp(-d*d*5.0);float g=exp(-d*d*1.8)*0.35;float a=(c+g)*vAlpha;if(a<0.005)discard;gl_FragColor=vec4(vColor*(1.0+c*0.5),a);}
`;

// ===== SVG path → Canvas → 粒子采样 =====
const SVG_PATH = `M352.3 84.7 Q345.6 84.7 336.1 87.4 Q326.7 90.2 321.9 92.9 Q317.2 95.7 312.5 100.4 Q307.7 105.2 305.0 113.9 Q302.2 122.6 299.8 124.9 Q297.5 127.3 294.7 128.5 Q291.9 129.7 290.7 131.2 Q289.6 132.8 291.1 135.6 Q292.7 138.3 292.7 141.1 Q292.7 143.9 290.7 154.1 Q288.8 164.4 290.3 165.6 Q291.9 166.8 297.5 167.6 Q303.0 168.4 307.3 171.9 Q311.7 175.5 314.8 182.6 Q318.0 189.7 320.4 198.8 Q322.7 207.8 321.9 212.6 Q321.1 217.3 317.2 222.4 Q313.2 227.6 308.1 236.3 Q303.0 244.9 289.2 258.0 Q275.3 271.0 273.4 274.6 Q271.4 278.1 270.6 281.7 Q269.8 285.2 271.0 291.9 Q272.2 298.6 277.7 309.7 Q283.2 320.7 284.8 326.7 Q286.4 332.6 285.2 367.3 Q284.0 402.1 288.8 423.8 Q293.5 445.5 293.9 454.2 Q294.3 462.9 293.1 481.0 Q291.9 499.2 322.7 485.4 Q353.5 471.6 355.1 472.0 Q356.7 472.4 357.9 478.3 Q359.0 484.2 359.8 484.2 Q360.6 484.2 363.8 475.9 Q366.9 467.6 372.1 464.1 Q377.2 460.5 378.8 450.6 Q380.4 440.8 385.9 427.3 Q391.4 413.9 392.6 407.2 Q393.8 400.5 392.6 394.6 Q391.4 388.7 387.1 379.6 Q382.7 370.5 380.0 361.8 Q377.2 353.1 376.0 343.6 Q374.8 334.2 375.6 331.8 Q376.4 329.4 380.0 327.5 Q383.5 325.5 390.6 323.1 Q397.7 320.7 398.1 322.3 Q398.5 323.9 393.4 331.4 Q388.3 338.9 391.0 338.5 Q393.8 338.1 394.2 339.3 Q394.6 340.5 396.2 340.1 Q397.7 339.7 398.1 340.9 Q398.5 342.1 396.9 344.0 Q395.4 346.0 400.1 344.8 Q404.8 343.6 406.8 345.6 Q408.8 347.6 408.8 344.8 Q408.8 342.1 410.0 341.7 Q411.2 341.3 418.3 346.0 Q425.4 350.8 428.9 350.8 Q432.5 350.8 434.5 349.2 Q436.4 347.6 432.5 345.6 Q428.5 343.6 428.9 340.5 Q429.3 337.3 434.1 337.7 Q438.8 338.1 440.8 337.3 Q442.7 336.5 444.3 334.6 Q445.9 332.6 440.0 333.4 Q434.1 334.2 431.7 332.6 Q429.3 331.0 429.7 329.8 Q430.1 328.6 433.7 329.8 Q437.2 331.0 432.9 325.1 Q428.5 319.2 428.5 316.0 Q428.5 312.9 434.1 315.2 Q439.6 317.6 442.3 317.2 Q445.1 316.8 442.0 315.6 Q438.8 314.4 436.4 311.3 Q434.1 308.1 435.6 299.8 Q437.2 291.5 436.8 282.8 Q436.4 274.2 437.6 273.8 Q438.8 273.4 440.4 276.5 Q442.0 279.7 441.6 284.4 Q441.2 289.2 442.3 287.6 Q443.5 286.0 443.9 282.1 Q444.3 278.1 442.7 273.0 Q441.2 267.8 438.8 263.9 Q436.4 259.9 436.4 258.8 Q436.4 257.6 438.0 257.2 Q439.6 256.8 436.4 242.2 Q433.3 227.6 434.8 227.2 Q436.4 226.8 431.7 217.3 Q427.0 207.8 423.4 196.4 Q419.8 184.9 418.7 177.0 Q417.5 169.1 416.7 153.0 Q415.9 136.8 414.7 130.8 Q413.5 124.9 411.9 121.8 Q410.4 118.6 407.2 115.4 Q404.1 112.3 400.1 110.3 Q396.2 108.3 394.2 106.4 Q392.2 104.4 389.8 100.1 Q387.5 95.7 385.1 94.1 Q382.7 92.6 378.0 91.8 Q373.3 91.0 366.2 87.8 Z M192.0 16.4 Q188.5 17.5 184.5 21.5 Q180.6 25.4 179.0 24.6 Q177.4 23.9 176.2 27.0 Q175.1 30.2 173.1 32.1 Q171.1 34.1 169.1 34.9 Q167.2 35.7 167.2 38.1 Q167.2 40.4 165.6 42.0 Q164.0 43.6 164.0 44.4 Q164.0 45.2 165.2 45.6 Q166.4 46.0 166.4 47.5 Q166.4 49.1 164.0 57.8 Q161.6 66.5 161.6 73.2 Q161.6 79.9 166.0 96.1 Q170.3 112.3 170.3 118.2 Q170.3 124.1 167.6 130.8 Q164.8 137.6 161.6 141.1 Q158.5 144.7 153.7 145.8 Q149.0 147.0 147.8 148.2 Q146.6 149.4 145.8 155.3 Q145.1 161.2 134.0 169.5 Q123.0 177.8 113.9 186.5 Q104.8 195.2 100.8 200.3 Q96.9 205.5 92.9 213.0 Q89.0 220.5 87.0 228.4 Q85.0 236.3 84.7 244.2 Q84.3 252.1 75.6 293.9 Q66.9 335.8 66.5 345.6 Q66.1 355.5 66.9 359.0 Q67.7 362.6 70.0 367.3 Q72.4 372.1 77.2 378.8 Q81.9 385.5 86.2 393.8 Q90.6 402.1 97.7 411.6 Q104.8 421.0 113.1 429.7 Q121.4 438.4 121.4 442.0 Q121.4 445.5 122.6 447.5 Q123.7 449.5 128.1 451.0 Q132.4 452.6 135.2 452.2 Q138.0 451.8 147.0 439.2 Q156.1 426.6 157.3 426.2 Q158.5 425.8 162.0 428.9 Q165.6 432.1 173.9 436.8 Q182.2 441.6 210.6 451.4 Q239.0 461.3 242.2 464.1 Q245.3 466.8 246.5 469.2 Q247.7 471.6 248.1 475.1 Q248.5 478.7 249.3 479.5 Q250.1 480.2 250.9 477.5 Q251.7 474.7 250.9 460.5 Q250.1 446.3 251.3 442.0 Q252.4 437.6 252.8 431.7 Q253.2 425.8 250.1 414.3 Q246.9 402.9 246.9 387.1 Q246.9 371.3 243.4 361.8 Q239.8 352.3 238.2 343.6 Q236.7 335.0 236.3 318.0 Q235.9 301.0 236.7 292.7 Q237.4 284.4 237.4 270.2 Q237.4 256.0 232.7 236.7 Q228.0 217.3 229.5 207.0 Q231.1 196.8 224.4 188.1 Q217.7 179.4 217.3 175.5 Q216.9 171.5 220.5 166.0 Q224.0 160.5 227.2 157.7 Q230.3 154.9 233.1 154.9 Q235.9 154.9 245.7 158.1 Q255.6 161.2 258.8 161.2 Q261.9 161.2 263.5 160.1 Q265.1 158.9 269.8 147.0 Q274.6 135.2 278.9 132.0 Q283.2 128.9 283.2 127.3 Q283.2 125.7 280.9 119.8 Q278.5 113.9 278.5 110.7 Q278.5 107.6 282.5 101.2 Q286.4 94.9 287.2 90.6 Q288.0 86.2 289.6 86.2 Q291.1 86.2 291.5 90.2 Q291.9 94.1 293.5 93.3 Q295.1 92.6 296.3 93.7 Q297.5 94.9 299.0 89.8 Q300.6 84.7 300.6 81.5 Q300.6 78.3 305.4 81.1 Q310.1 83.9 310.5 83.5 Q310.9 83.1 308.5 77.9 Q306.1 72.8 307.7 72.0 Q309.3 71.2 309.3 68.5 Q309.3 65.7 307.7 64.5 Q306.1 63.3 306.1 61.4 Q306.1 59.4 305.0 59.4 Q303.8 59.4 303.0 57.8 Q302.2 56.2 297.8 55.4 Q293.5 54.6 293.5 53.9 Q293.5 53.1 295.9 51.1 Q298.2 49.1 297.8 48.3 Q297.5 47.5 295.1 48.7 Q292.7 49.9 291.5 49.5 Q290.3 49.1 291.1 42.4 Q291.9 35.7 290.7 31.8 Q289.6 27.8 286.0 32.1 Q282.5 36.5 280.1 36.9 Q277.7 37.3 276.1 36.5 Q274.6 35.7 274.6 33.3 Q274.6 31.0 266.3 28.6 Q258.0 26.2 256.8 23.9 Q255.6 21.5 247.7 21.1 Q239.8 20.7 239.4 19.5 Q239.0 18.3 239.8 17.1 Q240.6 16.0 238.2 14.4 Q235.9 12.8 229.5 15.2 Q223.2 17.5 222.0 17.1 Q220.9 16.7 220.9 15.2 Q220.9 13.6 215.7 16.4 Q210.6 19.1 207.8 19.1 Q205.1 19.1 204.7 17.5 Q204.3 16.0 199.9 15.6 Z`;

function pathToParticles(): number[] {
  if (typeof document === "undefined") return [];
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S; cv.height = S;
  const ctx = cv.getContext("2d")!;
  const p = new Path2D(SVG_PATH);
  ctx.fillStyle = "#ffffff";
  ctx.fill(p);
  const img = ctx.getImageData(0, 0, S, S);
  const out: number[] = [];
  const sc = 10 / S;
  const step = 4;
  for (let y = 0; y < S; y += step)
    for (let x = 0; x < S; x += step)
      if (img.data[(y * S + x) * 4 + 3] > 80)
        out.push((x - S / 2) * sc, -(y - S / 2) * sc, (Math.random() - 0.5) * 0.35);
  return out;
}

function Stars() {
  const ref = useRef<THREE.Points>(null!);
  const { pos, col } = useMemo(() => {
    const N = 500, p = new Float32Array(N * 3), c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20; p[i * 3 + 1] = (Math.random() - 0.5) * 20; p[i * 3 + 2] = (Math.random() - 0.5) * 12;
      c[i * 3] = 0.4 + Math.random() * 0.5; c[i * 3 + 1] = 0.35 + Math.random() * 0.4; c[i * 3 + 2] = 0.45 + Math.random() * 0.5;
    }
    return { pos: p, col: c };
  }, []);
  const g = useCallback((geo: THREE.BufferGeometry) => {
    if (!geo) return;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(500).fill(0.25), 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(500).fill(0.35), 1));
  }, [pos, col]);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.005; });
  return <points ref={ref}><bufferGeometry ref={g} /><shaderMaterial vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function CoupleParticles() {
  const ref = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const { size } = useThree();
  const [pix, setPix] = useState<number[]>([]);
  useEffect(() => { setPix(pathToParticles()); }, []);

  const data = useMemo(() => {
    if (!pix.length) return null;
    const N = pix.length / 3;
    const p = new Float32Array(pix), c = new Float32Array(N * 3), s = new Float32Array(N), a = new Float32Array(N);
    const warm = new THREE.Color("#f8a5c2"), cool = new THREE.Color("#a0c4ff");
    for (let i = 0; i < N; i++) {
      const t = (pix[i * 3] + 5) / 10;
      const m = warm.clone().lerp(cool, Math.max(0, Math.min(1, t)));
      c[i * 3] = m.r * (0.7 + Math.random() * 0.3); c[i * 3 + 1] = m.g * (0.7 + Math.random() * 0.3); c[i * 3 + 2] = m.b * (0.7 + Math.random() * 0.3);
      s[i] = 0.3 + Math.random() * 1.6; a[i] = 0.5 + Math.random() * 0.5;
    }
    return { pos: p, col: c, siz: s, alp: a, cnt: N, home: new Float32Array(p) };
  }, [pix]);

  const setG = useCallback((g: THREE.BufferGeometry) => {
    if (!g || !data) return;
    g.setAttribute("position", new THREE.BufferAttribute(data.pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(data.col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(data.siz, 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(data.alp, 1));
  }, [data]);

  useEffect(() => {
    const mv = (e: MouseEvent) => { mouse.current.x = e.clientX / size.width; mouse.current.y = 1 - e.clientY / size.height; };
    const tc = (e: TouchEvent) => { if (e.touches[0]) { mouse.current.x = e.touches[0].clientX / size.width; mouse.current.y = 1 - e.touches[0].clientY / size.height; } };
    window.addEventListener("mousemove", mv, { passive: true }); window.addEventListener("touchmove", tc, { passive: true });
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("touchmove", tc); };
  }, [size.width, size.height]);

  useFrame((_, dt) => {
    if (!ref.current || !data) return;
    const dt2 = Math.min(dt, 0.1) * 2, mx = (mouse.current.x - 0.5) * 14, my = (mouse.current.y - 0.5) * 10, mz = 3;
    const A = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < data.cnt; i++) {
      const i3 = i * 3;
      let vx = (data.home[i3] - A[i3]) * 1.3, vy = (data.home[i3 + 1] - A[i3 + 1]) * 1.3, vz = (data.home[i3 + 2] - A[i3 + 2]) * 1.3;
      const dx = A[i3] - mx, dy = A[i3 + 1] - my, dz = A[i3 + 2] - mz, dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;
      if (dist < 5) { const f = (1 - dist / 5) ** 2 * 12; vx += (dx / dist) * f; vy += (dy / dist) * f; vz += (dz / dist) * f; }
      const sp = Math.sqrt(vx * vx + vy * vy + vz * vz), m2 = 5; if (sp > m2) { const sc = m2 / sp; vx *= sc; vy *= sc; vz *= sc; }
      A[i3] += vx * dt2; A[i3 + 1] += vy * dt2; A[i3 + 2] += vz * dt2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += dt * 0.22;
  });

  if (!data) return null;
  return <points ref={ref}><bufferGeometry ref={setG} /><shaderMaterial vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

export default function ParticleFieldCanvas() {
  return (
    <div className="fixed inset-0" style={{ background: "linear-gradient(180deg, #05051a 0%, #090e2e 50%, #0c071c 100%)" }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: false }} dpr={[1, 1.5]}>
        <Stars /><CoupleParticles />
      </Canvas>
    </div>
  );
}
