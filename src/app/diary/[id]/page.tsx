"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const moodEmojis: Record<string, string> = {
  happy: "😊", love: "💕", grateful: "🙏", calm: "😌", miss: "🥺", excited: "🎉",
};
const weatherIcons: Record<string, string> = {
  sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️",
};

interface DiaryDetail {
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

export default function DiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [diary, setDiary] = useState<DiaryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("diaries")
      .select("*, profiles(display_name)")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setDiary(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("确定删除这篇日记吗？")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("diaries").delete().eq("id", params.id);
    router.push("/diary");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-choco/30">
        加载中...
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-choco/40">日记不存在</p>
        <Link href="/diary" className="text-rose hover:underline">返回列表</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/diary" className="text-choco/40 hover:text-choco transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display text-choco">日记详情</h1>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-choco/20 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          {/* 标题 */}
          {diary.title && (
            <h2 className="text-xl font-display text-choco mb-4">{diary.title}</h2>
          )}

          {/* 内容 */}
          <div className="text-choco/80 leading-relaxed whitespace-pre-wrap mb-6">
            {diary.content}
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-choco/40 border-t border-rose/10 pt-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(diary.created_at).toLocaleString("zh-CN")}
            </span>
            {diary.mood && moodEmojis[diary.mood] && (
              <span>{moodEmojis[diary.mood]}</span>
            )}
            {diary.weather && weatherIcons[diary.weather] && (
              <span>{weatherIcons[diary.weather]}</span>
            )}
            {diary.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {diary.location}
              </span>
            )}
            {diary.profiles?.display_name && (
              <span className="ml-auto">{diary.profiles.display_name}</span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
