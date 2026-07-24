"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Heart, Smile, Star, Cloud, Sun, CloudRain, CloudSnow, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

interface Diary {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  weather: string | null;
  location: string | null;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string };
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

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("diaries")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDiaries(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display text-choco">📝 日记</h1>
          <Link
            href="/diary/new"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md shadow-rose/20 hover:shadow-lg hover:shadow-rose/30 transition-all"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>

        {/* 日记列表 */}
        {loading ? (
          <div className="text-center py-20 text-choco/30">加载中...</div>
        ) : diaries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">📖</div>
            <p className="text-choco/40 mb-4">还没有日记，写下你们的第一篇吧</p>
            <Link
              href="/diary/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md shadow-rose/20 hover:shadow-lg transition-shadow"
            >
              <Plus className="w-4 h-4" />
              写日记
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {diaries.map((diary, i) => (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/diary/${diary.id}`}>
                  <div className="glass-card p-5 hover:border-rose/30 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-choco truncate">
                          {diary.title || "无标题"}
                        </h3>
                        <p className="text-sm text-choco/40 mt-1 line-clamp-2">
                          {diary.content}
                        </p>
                      </div>
                      {diary.mood && moodEmojis[diary.mood] && (
                        <span className="text-2xl flex-shrink-0">{moodEmojis[diary.mood]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-choco/30">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(diary.created_at).toLocaleDateString("zh-CN")}
                      </span>
                      {diary.weather && weatherIcons[diary.weather] && (
                        <span>{weatherIcons[diary.weather]}</span>
                      )}
                      {diary.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {diary.location}
                        </span>
                      )}
                      {diary.profiles?.display_name && (
                        <span className="ml-auto opacity-50">
                          {diary.profiles.display_name}
                        </span>
                      )}
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
