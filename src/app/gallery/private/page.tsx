"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Plus, Upload, ImagePlus, CheckCircle, Trash2, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface Photo { id: string; public_url: string; caption: string; createdAt: string; }

export default function PrivateGalleryPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { "x-private-password": "050825" };

  const load = () => {
    fetch("/api/private-photos", { headers }).then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPhotos(d); }).finally(() => setLoading(false));
  };

  // 检查 sessionStorage 中是否已解锁
  useEffect(() => {
    if (sessionStorage.getItem("private-unlocked") === "1") {
      setUnlocked(true); load();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPassword = () => {
    if (password === "050825") {
      setUnlocked(true); setPwError(false);
      sessionStorage.setItem("private-unlocked", "1");
      load();
    } else {
      setPwError(true);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...fs]);
    setPreviews(prev => [...prev, ...fs.map(f => URL.createObjectURL(f))]);
  };

  const upload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const f of files) {
      const fd = new FormData(); fd.append("file", f);
      await fetch("/api/private-photos", { method: "POST", headers, body: fd });
    }
    setFiles([]); setPreviews([]);
    setUploading(false); setUploadDone(true); load();
    setTimeout(() => setUploadDone(false), 2000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`删除 ${selectedIds.size} 张照片？`)) return;
    for (const id of selectedIds) {
      await fetch("/api/private-photos", { method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    }
    setSelectedIds(new Set()); setDeleteMode(false); load();
  };

  // ===== 密码门 =====
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-choco/40 hover:text-choco text-sm mb-8"><ArrowLeft className="w-4 h-4" />返回照片墙</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-choco/20 to-choco/10 mb-6">
              <Lock className="w-8 h-8 text-choco/50" />
            </motion.div>
            <h2 className="text-xl font-display text-choco mb-2">隐私相册</h2>
            <p className="text-sm text-choco/40 mb-6">输入密码查看</p>
            <AnimatePresence>
              {pwError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> 密码错误
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && verifyPassword()}
                  placeholder="密码" className="w-full px-4 py-3 bg-white/60 border border-rose/20 rounded-xl text-choco outline-none text-center text-lg tracking-widest" />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-choco/30">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={verifyPassword}
                className="px-6 py-3 bg-gradient-to-r from-choco/60 to-choco/40 text-white rounded-xl font-display">
                解锁
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== 相册内容（与公开相册相同UI） =====
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/gallery" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-display text-choco flex items-center gap-2"><Lock className="w-4 h-4" /> 隐私相册</h1>
          <div className="flex items-center gap-1.5">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { setDeleteMode(!deleteMode); setSelectedIds(new Set()); }}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${deleteMode ? "bg-red-100 text-red-500" : "bg-gray-100 text-choco/40 hover:bg-gray-200"}`}>
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md">
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {deleteMode && selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
              <span className="text-sm text-red-600">已选 {selectedIds.size} 张</span>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={deleteSelected}
                className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm">删除</motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(files.length > 0 || uploadDone) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              {uploadDone ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" />上传成功！</div>
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
                    <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose"><ImagePlus className="w-6 h-6" /></button>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={upload} disabled={uploading}
                    className="w-full py-2.5 bg-gradient-to-r from-rose to-coral text-white rounded-xl text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50">
                    <Upload className="w-4 h-4" /> {uploading ? "上传中..." : `上传 ${files.length} 张`}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleSelect} className="hidden" />

        {loading ? <div className="text-center py-20 text-choco/30">加载中...</div>
          : photos.length === 0 ? <div className="text-center py-20"><Lock className="w-10 h-10 text-choco/20 mx-auto mb-4" /><p className="text-choco/40">隐私相册为空</p></div>
            : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 md:gap-3">
              {photos.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all ${deleteMode ? "hover:scale-100" : "hover:scale-[1.02]"}`}
                  onClick={() => deleteMode ? toggleSelect(p.id) : setSelected(p)}>
                  <img src={p.public_url} alt="" className="w-full h-full object-cover" loading="lazy" />
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
          <button className="absolute top-6 right-6 text-white/80 hover:text-white" onClick={() => setSelected(null)}><X className="w-8 h-8" /></button>
          <img src={selected.public_url} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
