"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Sparkles, MessageCircle, ListTodo, Camera, CalendarDays, LogOut, CircleUser, X, Save, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Diary { id: string; date: string; mood: string; content: string; title: string; userId: string; }
interface Anniversary { id: string; title: string; date: string; icon: string; }

const ALL_MOODS = [
  { value: "happy", emoji: "😊", label: "开心" }, { value: "love", emoji: "💕", label: "甜蜜" },
  { value: "grateful", emoji: "🙏", label: "感恩" }, { value: "calm", emoji: "😌", label: "平静" },
  { value: "miss", emoji: "🥺", label: "想念" }, { value: "excited", emoji: "🎉", label: "兴奋" },
  { value: "angry", emoji: "😡", label: "生气" }, { value: "sad", emoji: "😢", label: "难过" },
  { value: "tired", emoji: "😫", label: "疲惫" }, { value: "anxious", emoji: "😰", label: "焦虑" },
  { value: "expect", emoji: "🤩", label: "期待" }, { value: "bored", emoji: "😐", label: "无聊" },
  { value: "proud", emoji: "😎", label: "得意" }, { value: "shy", emoji: "😳", label: "害羞" },
];
const MOOD_MAP: Record<string, string> = Object.fromEntries(ALL_MOODS.map(m => [m.value, m.emoji]));

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const ANNIVERSARY_DATE = new Date("2023-01-01");

export default function CalendarHome() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [username, setUsername] = useState<string | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [photos, setPhotos] = useState<{ date: string }[]>([]);
  const [daysCount, setDaysCount] = useState(0);

  // 弹窗
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUsername(d.username));
    fetch(`/api/diaries?year=${year}&month=${month}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setDiaries(d); });
    fetch("/api/anniversaries-data").then(r => r.json()).then(d => { if (Array.isArray(d)) setAnniversaries(d); });
    fetch("/api/photos-data").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setPhotos(d.map((p: any) => ({ date: p.createdAt?.slice(0, 10) || "" })));
    });
    setDaysCount(Math.floor((Date.now() - ANNIVERSARY_DATE.getTime()) / 86400000));
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const openDate = (dateStr: string) => {
    const existing = diaries.find(d => d.date === dateStr);
    setEditingDiary(existing || null);
    setEditContent(existing?.content || "");
    setEditMood(existing?.mood || "");
    setEditFiles([]); setEditPreviews([]);
    setSelectedDate(dateStr);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditFiles(prev => [...prev, ...files]);
    setEditPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const saveDiary = async () => {
    setSaving(true);
    if (editingDiary) {
      // 更新已有日记
      await fetch(`/api/diaries/${editingDiary.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim(), mood: editMood }),
      });
    } else if (editContent.trim()) {
      // 创建新日记
      await fetch("/api/diaries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, content: editContent.trim(), mood: editMood }),
      });
    }
    // 上传图片
    for (const f of editFiles) {
      const fd = new FormData(); fd.append("file", f);
      await fetch("/api/photos-data", { method: "POST", body: fd });
    }
    setSaving(false); setSelectedDate(null); load();
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const prevMonth = () => { if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1); };

  const cells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    date: `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  }));

  const handleSignOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };

  // 用户颜色区分
  const userColor = (uid: string) => uid === "guohanxi" ? "text-blue-400" : "text-rose";

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose" fill="currentColor" />
            <span className="text-sm font-display text-choco/60">在一起 {daysCount} 天</span>
          </div>
          <div className="flex items-center gap-3">
            {username && <span className="text-xs text-choco/40 flex items-center gap-1"><CircleUser className="w-3 h-3" />{username}</span>}
            <button onClick={handleSignOut} className="text-choco/20 hover:text-coral"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* 月份切换 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 text-choco/40 hover:text-choco"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-display text-choco">{year}年{month}月</h2>
          <button onClick={nextMonth} className="p-2 text-choco/40 hover:text-choco"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* 星期 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(w => <div key={w} className="text-center text-xs text-choco/30 py-1">{w}</div>)}
        </div>

        {/* 日历 */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {cells.map(({ day, date }) => {
            const d = diaries.find(x => x.date === date);
            const mood = d?.mood || "";
            const anni = anniversaries.find(a => a.date === date);
            const photo = photos.some(p => p.date === date);
            const isToday = date === today;
            return (
              <motion.button key={date} whileTap={{ scale: 0.9 }} onClick={() => openDate(date)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all text-sm
                  ${isToday ? "bg-rose text-white shadow-md shadow-rose/20" : "hover:bg-rose/10 text-choco/70"}`}>
                <span className="text-xs">{day}</span>
                {mood && <span className="text-lg leading-none">{MOOD_MAP[mood] || mood}</span>}
                {!mood && anni && <span className="text-lg leading-none">{anni.icon}</span>}
                {photo && !mood && !anni && <Camera className="w-3 h-3 text-choco/20 mt-0.5" />}
                {/* 多用户标记：显示小圆点 */}
                {mood && d && <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${d.userId === "guohanxi" ? "bg-blue-400" : "bg-rose"}`} />}
              </motion.button>
            );
          })}
        </div>

        {/* 底部快捷入口 */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { href: "/notes", icon: MessageCircle, label: "小纸条", color: "from-rose to-coral" },
            { href: "/wishes", icon: ListTodo, label: "愿望", color: "from-coral to-gold" },
            { href: "/gallery", icon: Camera, label: "照片墙", color: "from-rose-dark to-rose" },
            { href: "/anniversary", icon: CalendarDays, label: "纪念日", color: "from-choco/40 to-choco/30" },
          ].map(c => (
            <Link key={c.href} href={c.href} className="flex flex-col items-center gap-1.5">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] text-choco/40">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 日记弹窗 */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedDate(null)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-choco">
                    {selectedDate}
                    {editingDiary && <span className={`text-xs ml-2 ${userColor(editingDiary.userId)}`}>· {editingDiary.userId}</span>}
                  </h3>
                  <button onClick={() => setSelectedDate(null)} className="text-choco/30 hover:text-choco"><X className="w-5 h-5" /></button>
                </div>

                {/* 心情选择 — 更多选项 */}
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {ALL_MOODS.map(m => (
                    <button key={m.value} onClick={() => setEditMood(editMood === m.value ? "" : m.value)}
                      className={`px-2.5 py-1.5 rounded-full text-xs transition-all ${editMood === m.value ? "bg-rose/20 text-rose-dark border border-rose" : "bg-gray-50 text-choco/50 border border-transparent hover:border-rose/30"}`}>
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>

                <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                  placeholder="今天发生了什么..." rows={6}
                  className="w-full bg-gray-50 rounded-xl p-4 text-choco/80 placeholder:text-choco/25 outline-none resize-none text-sm leading-relaxed" />

                {/* 照片上传 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {editPreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => { setEditFiles(prev => prev.filter((_, j) => j !== i)); setEditPreviews(prev => prev.filter((_, j) => j !== i)); }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/40 text-white flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose">
                    <ImagePlus className="w-5 h-5" />
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

                <div className="flex gap-3 mt-4">
                  <button onClick={() => setSelectedDate(null)} className="flex-1 py-2.5 border border-rose/20 rounded-xl text-choco/50 text-sm">取消</button>
                  <button onClick={saveDiary} disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-rose to-coral text-white rounded-xl text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save className="w-4 h-4" />{saving ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
