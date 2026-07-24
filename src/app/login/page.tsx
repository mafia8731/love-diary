"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, User, Lock, LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLogin = async (user: string, pass: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "登录失败"); return; }
      router.push("/home");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("请输入账号和密码"); return; }
    doLogin(username, password);
  };

  // 快捷登录：先填值，再自动提交
  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setTimeout(() => doLogin(user, pass), 300);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-rose/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-coral/10 rounded-full blur-3xl" />
      </div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-choco/50 hover:text-choco transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> 返回
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose to-coral mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </motion.div>
          <h1 className="text-2xl font-display text-choco">进入我们的世界</h1>
          <p className="text-sm text-choco/40 mt-2">属于两个人的私有空间</p>
        </div>

        {/* 快捷登录 — 点击直接登录 */}
        <div className="glass-card p-6 mb-4">
          <p className="text-xs text-choco/40 text-center mb-3">点击直接登录</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quickLogin("guohanxi", "liumengqi")}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-rose/20 hover:bg-rose/10 hover:border-rose transition-all text-choco/60 hover:text-choco disabled:opacity-40"
            >
              <span className="text-lg">👦</span>
              <span className="text-sm font-display">guohanxi</span>
            </button>
            <button
              onClick={() => quickLogin("liumengqi", "guohanxi")}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-rose/20 hover:bg-rose/10 hover:border-rose transition-all text-choco/60 hover:text-choco disabled:opacity-40"
            >
              <span className="text-lg">👧</span>
              <span className="text-sm font-display">liumengqi</span>
            </button>
          </div>
        </div>

        {/* 手动输入 */}
        <div className="glass-card p-6">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl text-sm flex items-start gap-2 bg-red-50 text-red-600 border border-red-200">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-choco/30" />
              <input
                name="username" type="text" value={username} autoComplete="off"
                onChange={(e) => setUsername(e.target.value)} placeholder="账号" required
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-rose/20 rounded-xl text-choco placeholder:text-choco/25 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-choco/30" />
              <input
                name="password" type="password" value={password} autoComplete="off"
                onChange={(e) => setPassword(e.target.value)} placeholder="密码" required
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-rose/20 rounded-xl text-choco placeholder:text-choco/25 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition-all"
              />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-rose to-coral text-white font-display text-lg rounded-xl shadow-md shadow-rose/20 hover:shadow-lg hover:shadow-rose/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" /> {loading ? "验证中..." : "登录"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
