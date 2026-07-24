"use client";

import { useEffect, useState } from "react";
import { decrypt, bmpToBytes } from "@/lib/crypto";

export default function EncryptedImage({
  imgbbUrl, alt, className, ...rest
}: {
  imgbbUrl: string; alt?: string; className?: string;
  [key: string]: any;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch(imgbbUrl)
      .then(r => r.blob())
      .then(blob => bmpToBytes(blob))
      .then(bytes => {
        if (cancelled) return;
        const decrypted = decrypt(bytes);
        const blob = new Blob([new Uint8Array(decrypted)]);
        setSrc(URL.createObjectURL(blob));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [imgbbUrl]);

  if (!src) return <div className={`bg-gray-100 animate-pulse ${className || ""}`} />;
  return <img src={src} alt={alt || ""} className={className} loading="lazy" {...rest} />;
}
