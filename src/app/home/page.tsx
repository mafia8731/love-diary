"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Sparkles, MessageCircle, ListTodo, Camera, CalendarDays, LogOut, CircleUser, X, Save, ImagePlus, CheckCircle, Plus, Edit3 } from "lucide-react";
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
const ANNIVERSARY_DATE = new Date("2025-09-18");

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } };

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
  const [monthKey, setMonthKey] = useState(0);

  // 弹窗状态
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // view vs edit mode
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    const [meRes, diaryRes, anniRes, photoRes] = await Promise.all([
      fetch("/api/auth/me"), fetch(`/api/diaries?year=${year}&month=${month}`),
      fetch("/api/anniversaries-data"), fetch("/api/photos-data"),
    ]);
    const me = await meRes.json(); const d = await diaryRes.json();
    const a = await anniRes.json(); const p = await photoRes.json();
    setUsername(me.username);
    if (Array.isArray(d)) setDiaries(d);
    if (Array.isArray(a)) setAnniversaries(a);
    if (Array.isArray(p)) setPhotos(p.map((x: any) => ({ date: x.createdAt?.slice(0, 10) || "" })));
  }, [year, month]);

  useEffect(() => { fetchData(); setDaysCount(Math.floor((Date.now() - ANNIVERSARY_DATE.getTime()) / 86400000)); }, [fetchData]);

  // 获取某天的所有日记
  const getDateDiaries = (date: string) => diaries.filter(d => d.date === date);

  // 点击日期 → 查看模式
  const openDate = (dateStr: string) => {
    const dateDiaries = diaries.filter(d => d.date === dateStr);
    const myDiary = dateDiaries.find(d => d.userId === username);
    setEditContent(myDiary?.content || "");
    setEditMood(myDiary?.mood || "");
    setEditFiles([]); setEditPreviews([]);
    setSaved(false); setIsEditing(false);
    setSelectedDate(dateStr);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditFiles(prev => [...prev, ...files]);
    setEditPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const saveDiary = async () => {
    setSaving(true);
    await fetch("/api/diaries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, content: editContent.trim(), mood: editMood, userId: username }),
    });
    for (const f of editFiles) {
      const fd = new FormData(); fd.append("file", f);
      await fetch("/api/photos-data", { method: "POST", body: fd });
    }
    setSaving(false); setSaved(true);
    await fetchData();
    setTimeout(() => { setSelectedDate(null); setIsEditing(false); }, 600);
  };

  const prevMonth = () => { setMonthKey(k => k + 1); if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1); };
  const nextMonth = () => { setMonthKey(k => k + 1); if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1); };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const cells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1, date: `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  }));

  const handleSignOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };
  const userBadgeCls = (u: string) => u === "guohanxi" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600";

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* 顶部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Heart className="w-4 h-4 text-rose" fill="currentColor" />
            </motion.div>
            <span className="text-sm font-display text-choco/60">在一起 {daysCount} 天</span>
          </div>
          <div className="flex items-center gap-3">
            {username && <span className="text-xs text-choco/40 flex items-center gap-1"><CircleUser className="w-3 h-3" />{username}</span>}
            <button onClick={handleSignOut} className="text-choco/20 hover:text-coral transition-colors"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* 月份切换 */}
        <div className="flex items-center justify-between mb-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth} className="p-2 text-choco/40 hover:text-choco"><ChevronLeft className="w-5 h-5" /></motion.button>
          <motion.h2 key={monthKey} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-display text-choco">{year}年{month}月</motion.h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth} className="p-2 text-choco/40 hover:text-choco"><ChevronRight className="w-5 h-5" /></motion.button>
        </div>

        {/* 星期 */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w, i) => <div key={w} className={`text-center text-xs py-1 ${i === 0 || i === 6 ? "text-rose/40" : "text-choco/30"}`}>{w}</div>)}
        </div>

        {/* 日历格子 */}
        <motion.div key={monthKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {cells.map(({ day, date }) => {
            const dateDiaries = diaries.filter(x => x.date === date);
            const moods = dateDiaries.map(x => x.mood).filter(Boolean);
            const anni = anniversaries.find(a => a.date === date);
            const hasPhoto = photos.some(p => p.date === date);
            const isToday = date === today;
            return (
              <motion.button key={date} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.88 }}
                onClick={() => openDate(date)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors text-sm
                  ${isToday ? "bg-rose text-white shadow-lg shadow-rose/25" : "hover:bg-rose/8 text-choco/70"}`}>
                {isToday && <motion.div className="absolute inset-0 rounded-xl" animate={{ boxShadow: ["0 0 0 0 rgba(248,165,194,0.4)", "0 0 0 6px rgba(248,165,194,0)", "0 0 0 0 rgba(248,165,194,0.4)"] }} transition={{ duration: 2, repeat: Infinity }} />}
                <span className="text-xs relative z-10">{day}</span>
                {moods.length > 0 ? (
                  <div className="flex gap-0.5 relative z-10">
                    {moods.slice(0, 2).map((m, i) => (
                      <motion.span key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 12, delay: i * 0.1 }}
                        className="text-sm leading-none">{MOOD_MAP[m] || m}</motion.span>
                    ))}
                  </div>
                ) : anni ? (
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-lg leading-none relative z-10">{anni.icon}</motion.span>
                ) : hasPhoto ? (
                  <Camera className="w-3 h-3 text-choco/20 mt-0.5 relative z-10" />
                ) : null}
                {/* 用户标记 */}
                {dateDiaries.length > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {dateDiaries.map((d, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${d.userId === "guohanxi" ? "bg-blue-400" : "bg-rose"}`} />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { href: "/notes", icon: MessageCircle, label: "小纸条", color: "from-rose to-coral" },
            { href: "/wishes", icon: ListTodo, label: "愿望", color: "from-coral to-gold" },
            { href: "/gallery", icon: Camera, label: "照片墙", color: "from-rose-dark to-rose" },
            { href: "/anniversary", icon: CalendarDays, label: "纪念日", color: "from-choco/40 to-choco/30" },
          ].map(c => (
            <Link key={c.href} href={c.href} className="flex flex-col items-center gap-1.5 group">
              <motion.div whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.9 }}
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                <c.icon className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-[11px] text-choco/40">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 日期弹窗 */}
      <AnimatePresence>
        {selectedDate && (() => {
          const dateDiaries = diaries.filter(d => d.date === selectedDate);
          const myDiary = dateDiaries.find(d => d.userId === username);
          const otherDiary = dateDiaries.find(d => d.userId !== username);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
              onClick={() => { setSelectedDate(null); setIsEditing(false); }}>
              <motion.div initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-choco">{selectedDate}</h3>
                    <button onClick={() => { setSelectedDate(null); setIsEditing(false); }} className="text-choco/30 hover:text-choco"><X className="w-5 h-5" /></button>
                  </div>

                  {/* 成功反馈 */}
                  <AnimatePresence>
                    {saved && (
                      <motion.div {...fade} className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> 已保存！
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ===== 查看模式：显示双方心情 ===== */}
                  {!isEditing && (
                    <div className="space-y-3">
                      {dateDiaries.length === 0 && (
                        <p className="text-center text-choco/30 py-4 text-sm">这一天还没有记录</p>
                      )}
                      {dateDiaries.map(d => (
                        <motion.div key={d.id} {...fade} className={`p-4 rounded-xl border ${d.userId === "guohanxi" ? "bg-blue-50/50 border-blue-100" : "bg-rose-50/50 border-rose-100"}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${userBadgeCls(d.userId)}`}>{d.userId}</span>
                            {d.mood && <span className="text-2xl">{MOOD_MAP[d.mood] || d.mood}</span>}
                          </div>
                          {d.content && <p className="text-sm text-choco/70 whitespace-pre-wrap">{d.content}</p>}
                        </motion.div>
                      ))}
                      {/* 添加按钮 */}
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditContent(myDiary?.content || "");
                          setEditMood(myDiary?.mood || "");
                          setEditFiles([]); setEditPreviews([]);
                          setIsEditing(true);
                        }}
                        className="w-full py-3 border-2 border-dashed border-rose/20 rounded-xl text-rose/50 hover:border-rose hover:text-rose transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        {myDiary ? "编辑我的记录" : "添加我的心情"}
                      </motion.button>
                    </div>
                  )}

                  {/* ===== 编辑模式 ===== */}
                  {isEditing && (
                    <>
                      {/* 心情选择 */}
                      <div className="flex gap-1.5 mb-4 flex-wrap">
                        {ALL_MOODS.map(m => (
                          <motion.button key={m.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setEditMood(editMood === m.value ? "" : m.value)}
                            className={`px-2.5 py-1.5 rounded-full text-xs transition-all ${editMood === m.value ? "bg-rose/20 text-rose-dark border border-rose shadow-sm" : "bg-gray-50 text-choco/50 border border-transparent hover:border-rose/30"}`}>
                            {m.emoji} {m.label}
                          </motion.button>
                        ))}
                      </div>

                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                        placeholder="今天发生了什么...（可选）" rows={5}
                        className="w-full bg-gray-50 rounded-xl p-4 text-choco/80 placeholder:text-choco/25 outline-none resize-none text-sm leading-relaxed focus:ring-2 focus:ring-rose/20 transition-all" />

                      {/* 照片 */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editPreviews.map((src, i) => (
                          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => { setEditFiles(prev => prev.filter((_, j) => j !== i)); setEditPreviews(prev => prev.filter((_, j) => j !== i)); }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/40 text-white flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                          </motion.div>
                        ))}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                          onClick={() => fileRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-rose/30 flex items-center justify-center text-rose/40 hover:border-rose transition-colors">
                          <ImagePlus className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

                      <div className="flex gap-3 mt-4">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(false)}
                          className="flex-1 py-2.5 border border-rose/20 rounded-xl text-choco/50 text-sm">返回</motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                          onClick={saveDiary} disabled={saving}
                          className="flex-1 py-2.5 bg-gradient-to-r from-rose to-coral text-white rounded-xl text-sm font-display flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-rose/20">
                          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                          {saving ? "保存中..." : saved ? "已保存" : "保存"}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
