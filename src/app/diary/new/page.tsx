"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, ImagePlus, X, MapPin, Smile, Cloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const moods = [
  { value: "happy", emoji: "😊", label: "开心" }, { value: "love", emoji: "💕", label: "甜蜜" },
  { value: "grateful", emoji: "🙏", label: "感恩" }, { value: "calm", emoji: "😌", label: "平静" },
  { value: "miss", emoji: "🥺", label: "想念" }, { value: "excited", emoji: "🎉", label: "兴奋" },
];
const weathers = [
  { value: "sunny", emoji: "☀️", label: "晴天" }, { value: "cloudy", emoji: "☁️", label: "多云" },
  { value: "rainy", emoji: "🌧️", label: "雨天" }, { value: "snowy", emoji: "❄️", label: "雪天" },
];

export default function NewDiaryPage() {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [mood, setMood] = useState(""); const [weather, setWeather] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]); const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 9) { setError("最多9张照片"); return; }
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setError("");
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!content.trim()) { setError("写点什么吧~"); return; }
    setSaving(true); setError("");

    try {
      // 创建日记
      const res = await fetch("/api/diaries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), mood, weather, location: location.trim() }),
      });
      const diary = await res.json();
      if (!res.ok) { setError(diary.error); return; }

      // 上传图片
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img);
        fd.append("diaryId", diary.id);
        await fetch("/api/photos-data", { method: "POST", body: fd });
      }

      router.push("/diary"); router.refresh();
    } catch { setError("保存失败"); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/diary" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">写日记</h1>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? "保存中..." : "保存"}
          </button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
        <div className="glass-card p-6 space-y-5">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="今天的标题..." className="w-full text-xl font-display bg-transparent text-choco placeholder:text-choco/20 outline-none" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="记录今天的故事..." rows={8} className="w-full bg-transparent text-choco/80 placeholder:text-choco/25 outline-none resize-none leading-relaxed" />
          <div>
            <div className="flex flex-wrap gap-3 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {images.length < 9 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose">
                  <ImagePlus className="w-6 h-6" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
          </div>
          <div>
            <p className="text-sm text-choco/40 mb-2 flex items-center gap-1"><Smile className="w-4 h-4" />心情</p>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button key={m.value} onClick={() => setMood(mood === m.value ? "" : m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${mood === m.value ? "bg-rose/20 text-rose-dark border border-rose" : "bg-white/50 text-choco/50 border border-transparent hover:border-rose/30"}`}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-choco/40 mb-2 flex items-center gap-1"><Cloud className="w-4 h-4" />天气</p>
            <div className="flex flex-wrap gap-2">
              {weathers.map(w => (
                <button key={w.value} onClick={() => setWeather(weather === w.value ? "" : w.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${weather === w.value ? "bg-rose/20 text-rose-dark border border-rose" : "bg-white/50 text-choco/50 border border-transparent hover:border-rose/30"}`}>
                  {w.emoji} {w.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-choco/40 mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" />地点</p>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="在哪里..." className="w-full px-4 py-2 bg-white/50 border border-rose/20 rounded-xl text-choco placeholder:text-choco/25 outline-none focus:border-rose" />
          </div>
        </div>
      </div>
    </div>
  );
}
