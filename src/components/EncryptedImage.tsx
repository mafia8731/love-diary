"use client";

import { useEffect, useState } from "react";
import { decryptToUrl } from "@/lib/compress";

export default function EncryptedImage({
  src: stored, alt, className, ...rest
}: {
  src: string; alt?: string; className?: string;
  [key: string]: any;
}) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (!stored) return;
    let cancelled = false;
    decryptToUrl(stored).then(u => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [stored]);

  if (!url) return <div className={`bg-gray-100 animate-pulse ${className || ""}`} />;
  return <img src={url} alt={alt || ""} className={className} loading="lazy" {...rest} />;
}
