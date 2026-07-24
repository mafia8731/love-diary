"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

interface Photo {
  id: string;
  public_url: string;
  caption: string | null;
  created_at: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPhotos(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display text-choco">🖼️ 照片墙</h1>
          <div className="w-5" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-choco/30">加载中...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-choco/40">还没有照片，去日记里添加照片吧</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPhoto(photo)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer
                           hover:shadow-lg hover:shadow-rose/10 transition-all
                           hover:scale-[1.02]"
              >
                <img
                  src={photo.public_url}
                  alt={photo.caption || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 照片预览 */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedPhoto.public_url}
            alt={selectedPhoto.caption || ""}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedPhoto.caption && (
            <p className="absolute bottom-8 text-white/80 text-sm">{selectedPhoto.caption}</p>
          )}
        </div>
      )}
    </div>
  );
}
