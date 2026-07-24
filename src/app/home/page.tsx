"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Images, Heart, Settings, LogOut, Sparkles, CircleUser } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navCards = [
  { href: "/diary", icon: BookOpen, label: "日记", desc: "记录每一天", gradient: "from-rose to-coral" },
  { href: "/gallery", icon: Images, label: "照片墙", desc: "我们的瞬间", gradient: "from-coral to-gold" },
  { href: "/anniversary", icon: Heart, label: "纪念日", desc: "重要的日子", gradient: "from-rose-dark to-rose" },
  { href: "/settings", icon: Settings, label: "设置", desc: "个性化", gradient: "from-choco/60 to-choco/40" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.username))
      .catch(() => setUsername(null));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-coral/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Sparkles className="w-6 h-6 text-gold mx-auto mb-3 animate-float" />
          <h1 className="text-3xl font-display text-choco">我们的世界</h1>
          <p className="text-sm text-choco/40 mt-2">每一次点击，都是一段回忆</p>
          {username && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 rounded-full text-xs text-choco/50">
              <CircleUser className="w-3 h-3" />
              {username}
            </div>
          )}
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
          {navCards.map((card) => (
            <motion.div key={card.href} variants={item}>
              <Link href={card.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card p-6 text-center cursor-pointer hover:border-rose/30 transition-all group"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} mb-3 group-hover:shadow-lg group-hover:shadow-rose/20 transition-shadow`}
                  >
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-choco text-lg">{card.label}</h3>
                  <p className="text-xs text-choco/40 mt-1">{card.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-choco/30 hover:text-coral transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </motion.div>
      </div>
    </div>
  );
}
