"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface Diary {
  id: string; title: string; content: string; mood: string;
  weather: string; location: string; createdAt: string; userId: string;
}

const moodEmojis: Record<string, string> = {
  happy: "😊", love: "💕", grateful: "🙏", calm: "😌", miss: "🥺", excited: "🎉",
};
const weatherIcons: Record<string, string> = {
  sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️",
};

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/diaries")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDiaries(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">📝 日记</h1>
          <Link href="/diary/new" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md"><Plus className="w-5 h-5" /></Link>
        </div>
        {loading ? (
          <div className="text-center py-20 text-choco/30">加载中...</div>
        ) : diaries.length === 0 ? (
          <div className="text-center py-20"><p className="text-choco/40 mb-4">还没有日记</p>
            <Link href="/diary/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full"><Plus className="w-4 h-4" />写日记</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {diaries.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/diary/${d.id}`}>
                  <div className="glass-card p-5 hover:border-rose/30 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-choco truncate">{d.title || "无标题"}</h3>
                        <p className="text-sm text-choco/40 mt-1 line-clamp-2">{d.content}</p>
                      </div>
                      {d.mood && moodEmojis[d.mood] && <span className="text-2xl">{moodEmojis[d.mood]}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-choco/30">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(d.createdAt).toLocaleDateString("zh-CN")}</span>
                      {d.weather && weatherIcons[d.weather] && <span>{weatherIcons[d.weather]}</span>}
                      {d.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</span>}
                      <span className="ml-auto">{d.userId}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
