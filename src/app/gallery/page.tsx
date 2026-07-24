"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Plus, Upload, ImagePlus, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Photo { id: string; public_url: string; caption: string; createdAt: string; }

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [caption, setCaption] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/photos-data").then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPhotos(d); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...fs]);
    setPreviews(prev => [...prev, ...fs.map(f => URL.createObjectURL(f))]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const f of files) {
      const fd = new FormData(); fd.append("file", f);
      if (caption) fd.append("caption", caption);
      await fetch("/api/photos-data", { method: "POST", body: fd });
    }
    setFiles([]); setPreviews([]); setCaption("");
    setUploading(false); setUploadDone(true);
    load();
    setTimeout(() => setUploadDone(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">🖼️ 照片墙</h1>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md shadow-rose/20">
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 上传区域 */}
        <AnimatePresence>
          {(files.length > 0 || uploadDone) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6">
              {uploadDone ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> 上传成功！
                </div>
              ) : (
                <div className="glass-card p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => { setFiles(prev => prev.filter((_, j) => j !== i)); setPreviews(prev => prev.filter((_, j) => j !== i)); }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose">
                      <ImagePlus className="w-6 h-6" />
                    </button>
                  </div>
                  <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
                    placeholder="添加描述..." className="w-full px-4 py-2 bg-white/50 border border-rose/20 rounded-xl text-sm text-choco/60 placeholder:text-choco/25 outline-none" />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                    onClick={handleUpload} disabled={uploading}
                    className="w-full py-2.5 bg-gradient-to-r from-rose to-coral text-white rounded-xl text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50">
                    <Upload className="w-4 h-4" /> {uploading ? "上传中..." : `上传 ${files.length} 张照片`}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />

        {/* 照片网格 */}
        {loading ? <div className="text-center py-20 text-choco/30">加载中...</div>
          : photos.length === 0 && files.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-choco/40 mb-4">还没有照片</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md">
                <Upload className="w-4 h-4" />上传照片
              </motion.button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(p)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
                  <img src={p.public_url} alt={p.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </motion.div>
          )}
      </div>

      {/* 灯箱预览 */}
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
