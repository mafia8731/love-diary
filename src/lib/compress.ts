"use client";

// 简单混淆（NOT 强加密，只是让 Redis 里存的不是明文）
const KEY = [103, 117, 111, 104, 97, 110, 120, 105, 108, 105, 117, 109, 101, 110, 103, 113, 105, 50, 48, 50, 53];

export function obfuscate(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ KEY[i % KEY.length];
  return out;
}
export const deobfuscate = obfuscate;

// 前端压缩：Canvas resize + JPEG quality
export async function compressImage(file: File, maxW = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(img.width, maxW);
      const h = Math.round(img.height * (w / img.width));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// 加密 data URL → 可存储的 base64
export async function encryptDataUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const enc = obfuscate(bytes);
  const base64 = btoa(String.fromCharCode(...enc));
  return `enc:${blob.type}:${base64}`;
}

// 解密存储的 base64 → data URL
export async function decryptToUrl(stored: string): Promise<string> {
  if (!stored.startsWith("enc:")) return stored; // 旧格式直接返回
  const parts = stored.split(":");
  const mime = parts[1];
  const base64 = parts.slice(2).join(":");
  const enc = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const dec = deobfuscate(enc);
  const blob = new Blob([new Uint8Array(dec)], { type: mime });
  return URL.createObjectURL(blob);
}
