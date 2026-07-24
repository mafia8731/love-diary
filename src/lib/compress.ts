"use client";

const KEY = [103, 117, 111, 104, 97, 110, 120, 105, 108, 105, 117, 109, 101, 110, 103, 113, 105, 50, 48, 50, 53];

export function obfuscate(bytes: Uint8Array): Uint8Array {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ KEY[i % KEY.length];
  return out;
}
export const deobfuscate = obfuscate;

// 分块转 base64，避免大数组爆栈
function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunk) {
    parts.push(String.fromCharCode(...bytes.slice(i, i + chunk)));
  }
  return btoa(parts.join(""));
}

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// 压缩图片
export async function compressImage(file: File, maxW = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(img.width, maxW);
      const h = Math.round(img.height * (w / img.width));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// 加密 → 可存储字符串
export async function encryptDataUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const enc = obfuscate(bytes);
  const base64 = bytesToBase64(enc);
  return `enc:${blob.type}:${base64}`;
}

// 解密 → data URL
export async function decryptToUrl(stored: string): Promise<string> {
  if (!stored.startsWith("enc:")) return stored;
  const parts = stored.split(":");
  const mime = parts[1];
  const base64 = parts.slice(2).join(":");
  const enc = base64ToBytes(base64);
  const dec = deobfuscate(enc);
  const blob = new Blob([new Uint8Array(dec)], { type: mime });
  return URL.createObjectURL(blob);
}
