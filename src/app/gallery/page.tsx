"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EncryptedImage from "@/components/EncryptedImage";
import { ArrowLeft, X, Plus, Upload, ImagePlus, CheckCircle, Trash2, LayoutGrid, LayoutList, Lock } from "lucide-react";
import Link from "next/link";
import { compressImage, encryptDataUrl } from "@/lib/compress";

interface Photo { id: string; public_url: string; caption: string; createdAt: string; }

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cols, setCols] = useState(3);
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
      // 前端压缩
      const compressed = await compressImage(f, 1200, 0.7);
      const encrypted = await encryptDataUrl(compressed);

      const fd = new FormData();
      fd.append("dataUrl", encrypted);
      await fetch("/api/photos-data", { method: "POST", body: fd });
    }
    setFiles([]); setPreviews([]);
    setUploading(false); setUploadDone(true); load();
    setTimeout(() => setUploadDone(false), 2000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`删除 ${selectedIds.size} 张照片？`)) return;
    for (const id of selectedIds) {
      await fetch("/api/photos-data", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    }
    setSelectedIds(new Set()); setDeleteMode(false); load();
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("删除这张照片？")) return;
    await fetch("/api/photos-data", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSelected(null); load();
  };

  const gridClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">🖼️ 照片墙</h1>
          <div className="flex items-center gap-1.5">
            <Link href="/gallery/private">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-choco/10 text-choco/40 hover:bg-choco/20"><Lock className="w-4 h-4" /></motion.div>
            </Link>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCols(cols === 2 ? 3 : cols === 3 ? 4 : 2)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-choco/40">
              {cols === 2 ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}{cols}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { setDeleteMode(!deleteMode); setSelectedIds(new Set()); }}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${deleteMode ? "bg-red-100 text-red-500" : "bg-gray-100 text-choco/40"}`}><Trash2 className="w-4 h-4" /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md"><Plus className="w-5 h-5" /></motion.button>
          </div>
        </div>

        <AnimatePresence>
          {deleteMode && selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
              <span className="text-sm text-red-600">已选 {selectedIds.size} 张</span>
              <button onClick={deleteSelected} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm">删除</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(files.length > 0 || uploadDone) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              {uploadDone ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" />上传成功！（已压缩）</div>
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
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose"><ImagePlus className="w-6 h-6" /></button>
                  </div>
                  <button onClick={handleUpload} disabled={uploading}
                    className="w-full py-2.5 bg-gradient-to-r from-rose to-coral text-white rounded-xl text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50">
                    <Upload className="w-4 h-4" /> {uploading ? "压缩上传中..." : `上传 ${files.length} 张`}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />

        {loading ? <div className="text-center py-20 text-choco/30">加载中...</div>
          : photos.length === 0 ? <div className="text-center py-20"><div className="text-5xl mb-4">📷</div><p className="text-choco/40 mb-4">还没有照片</p>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md"><Upload className="w-4 h-4" />上传照片</button></div>
            : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`grid ${gridClass} gap-2 md:gap-3`}>
              {photos.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all ${deleteMode ? "hover:scale-100" : "hover:scale-[1.02]"}`}
                  onClick={() => deleteMode ? toggleSelect(p.id) : setSelected(p)}>
                  <EncryptedImage src={p.public_url} alt={p.caption || ""} className="w-full h-full object-cover" />
                  {deleteMode && (
                    <div className={`absolute inset-0 flex items-center justify-center ${selectedIds.has(p.id) ? "bg-rose/30" : "bg-black/10 hover:bg-black/20"}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedIds.has(p.id) ? "bg-rose border-rose" : "border-white"}`}>
                        {selectedIds.has(p.id) && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute top-6 right-6 flex gap-3">
            <button onClick={() => deleteSingle(selected.id)} className="text-white/50 hover:text-red-400"><Trash2 className="w-6 h-6" /></button>
            <button onClick={() => setSelected(null)} className="text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
          </div>
          <EncryptedImage src={selected.public_url} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={(e: React.MouseEvent) => e.stopPropagation()} />
          {selected.caption && <p className="absolute bottom-8 text-white/80 text-sm">{selected.caption}</p>}
        </div>
      )}
    </div>
  );
}
