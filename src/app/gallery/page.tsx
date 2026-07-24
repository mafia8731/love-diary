"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

interface Photo { id: string; public_url: string; caption: string; createdAt: string; }

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/photos-data").then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPhotos(d); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">🖼️ 照片墙</h1>
          <div className="w-5" />
        </div>
        {loading ? <div className="text-center py-20 text-choco/30">加载中...</div>
          : photos.length === 0 ? <div className="text-center py-20"><div className="text-5xl mb-4">📷</div><p className="text-choco/40">还没有照片</p></div>
            : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(p)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
                  <img src={p.public_url} alt={p.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </motion.div>}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <button className="absolute top-6 right-6 text-white/80 hover:text-white" onClick={() => setSelected(null)}><X className="w-8 h-8" /></button>
          <img src={selected.public_url} alt={selected.caption || ""} className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
          {selected.caption && <p className="absolute bottom-8 text-white/80 text-sm">{selected.caption}</p>}
        </div>
      )}
    </div>
  );
}
