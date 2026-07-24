const SECRET = "guohanxi-liumengqi-2025-09-18";
const seed = SECRET.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

function* keystream() {
  let s = seed;
  while (true) { s = (s * 1103515245 + 12345) & 0x7fffffff; yield s & 0xff; }
}

export function encrypt(bytes: Uint8Array): Uint8Array {
  const ks = keystream();
  return new Uint8Array([...bytes].map(b => b ^ ks.next().value!));
}
export const decrypt = encrypt; // XOR 对称

// ===== BMP 打包 =====
export function bytesToBmp(data: Uint8Array): Blob {
  const padding = (4 - (data.length % 4)) % 4;
  const paddedLen = data.length + padding;
  const w = Math.min(paddedLen, 65535);
  const h = Math.ceil(paddedLen / w);
  const rowSize = Math.ceil(w / 4) * 4;
  const pixelDataSize = rowSize * h;
  const fileSize = 54 + pixelDataSize;

  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);

  // BMP header
  view.setUint8(0, 0x42); view.setUint8(1, 0x4D); // 'BM'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // data offset
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, w, true);
  view.setInt32(22, h, true);
  view.setUint16(26, 1, true);  // planes
  view.setUint16(28, 32, true); // bpp
  view.setUint32(34, pixelDataSize, true);

  // Pixel data
  const pixels = new Uint8Array(buf, 54);
  let di = 0;
  for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const srcIdx = y * w + x;
      if (srcIdx < data.length) {
        pixels[di++] = data[srcIdx]; // B
        pixels[di++] = 0; // G
        pixels[di++] = 0; // R
        pixels[di++] = 255; // A
      } else {
        pixels[di++] = 0; pixels[di++] = 0; pixels[di++] = 0; pixels[di++] = 0;
      }
    }
  }

  return new Blob([buf], { type: "image/bmp" });
}

export function bmpToBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const view = new DataView(buf);
      const w = view.getInt32(18, true);
      const h = view.getInt32(22, true);
      const dataSize = view.getUint32(34, true);
      const pixels = new Uint8Array(buf, 54, dataSize);
      const bytes: number[] = [];
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const idx = y * (w * 4) + x * 4;
          if (idx < pixels.length) bytes.push(pixels[idx]);
        }
      }
      resolve(new Uint8Array(bytes));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
