"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleFieldCanvas = dynamic(() => import("@/components/ParticleField"), { ssr: false });

// ===== 打字机效果 =====
function Typewriter({ texts, className }: { texts: string[]; className?: string }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const current = texts[textIndex];
    const speed = isDeleting ? 30 : 70;
    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setDisplayText(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (!isDeleting && charIndex >= current.length) {
        setTimeout(() => setIsDeleting(true), 2200);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[3px] h-[1em] bg-gradient-to-b from-rose to-coral ml-1.5 align-middle rounded-full"
      />
    </span>
  );
}

// ===== 数字翻滚 =====
function RollingNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (displayValue === value) return;
    const duration = 1800, steps = 40;
    const increment = (value - displayValue) / steps;
    let current = displayValue, step = 0;
    const timer = setInterval(() => {
      step++; current += increment;
      if (step >= steps) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.round(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className={`inline-block tabular-nums ${className || ""}`}>{displayValue.toLocaleString()}</span>;
}

// ===== 漂浮爱心（暗色版） =====
function FloatingHearts() {
  const [mounted, setMounted] = useState(false);
  const hearts = useRef(
    [...Array(6)].map(() => ({
      startX: Math.random() * 100,
      endX: Math.random() * 100,
      scale: 0.3 + Math.random() * 0.8,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 15,
      size: 12 + Math.random() * 20,
      opacity: 0.04 + Math.random() * 0.08,
    }))
  );
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.current.map((h, i) => (
        <motion.div key={i} style={{ opacity: h.opacity }}
          initial={{ x: `${h.startX}%`, y: "110%", scale: h.scale, rotate: h.rotateStart }}
          animate={{ y: "-10%", x: `${h.endX}%`, rotate: h.rotateEnd }}
          transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: "linear" }}>
          <Heart size={h.size} className="text-rose" fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}

// ===== 纪念日 =====
const ANNIVERSARY_DATE = new Date("2025-09-18");
function getDaysSince(date: Date) { return Math.floor((Date.now() - date.getTime()) / 86400000); }
function getNextAnniversary(date: Date) {
  const now = new Date();
  const d = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (d < now) d.setFullYear(d.getFullYear() + 1);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

// ===== 主页面 =====
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [daysCount, setDaysCount] = useState(0);
  const [daysUntil, setDaysUntil] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDaysCount(getDaysSince(ANNIVERSARY_DATE));
    setDaysUntil(getNextAnniversary(ANNIVERSARY_DATE));
  }, []);

  const loveTexts = [
    "两个粒子，在宇宙中相遇。",
    "每一次靠近，都是引力。",
    "被推开，又被拉回。",
    "因为你就是我的平衡点。",
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a1a]">
      {/* 3D 粒子场 */}
      {mounted && <ParticleFieldCanvas />}

      {/* 漂浮爱心 */}
      <FloatingHearts />

      {/* 内容 */}
      <main className="relative z-10 flex flex-col items-center gap-10 px-6 text-center w-full max-w-lg mx-auto">
        {/* 顶部 */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          <Sparkles className="w-6 h-6 text-gold/80 animate-float" />
        </motion.div>

        {/* 打字机 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
          className="text-lg md:text-xl font-display text-white/60 tracking-wider leading-relaxed min-h-[2.5rem]">
          <Typewriter texts={loveTexts} />
        </motion.div>

        {/* 纪念日卡片 — 暗色玻璃 */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-rose/8 via-coral/5 to-gold/8 blur-2xl scale-110" />
          <div className="relative px-12 py-10 md:px-20 md:py-14 rounded-[2rem] bg-black/[0.15] backdrop-blur-sm border border-white/[0.04] shadow-2xl">
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose/40" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-gold/50" />
            <p className="text-[11px] md:text-xs text-white/25 uppercase tracking-[0.3em] mb-3 font-sans">
              我们已经在一起
            </p>
            <div className="flex items-baseline gap-3 justify-center">
              <RollingNumber
                value={daysCount}
                className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-rose via-coral to-gold bg-clip-text text-transparent"
              />
              <span className="text-2xl md:text-3xl text-white/30 font-display">天</span>
            </div>
            {daysUntil > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs text-white/20">
                  距离下一个纪念日还有 <span className="text-coral/80 font-semibold">{daysUntil}</span> 天
                </p>
                <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose to-coral rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, 100 - (daysUntil / 365) * 100)}%` }}
                    transition={{ delay: 2, duration: 1.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 进入按钮 */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="group relative inline-flex items-center gap-3 px-12 py-4 text-white font-display text-lg rounded-full shadow-xl shadow-rose/20 transition-all duration-500 overflow-hidden"
          >
            <motion.div className="absolute inset-0 rounded-full"
              animate={{ background: ["linear-gradient(135deg, #f8a5c2, #ff7f7f, #f0c27a)", "linear-gradient(225deg, #f0c27a, #f8a5c2, #ff7f7f)", "linear-gradient(135deg, #f8a5c2, #ff7f7f, #f0c27a)"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 rounded-full animate-glow opacity-50" />
            <Heart className="relative z-10 w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
            <span className="relative z-10">进入我们的世界</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </motion.a>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="text-[10px] text-white/15 tracking-[0.3em]">
          两个粒子 · 一个宇宙
        </motion.p>
      </main>
    </div>
  );
}
