"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.username) setDisplayName(d.username);
    });
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.displayName) setDisplayName(d.displayName);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage("");
    const res = await fetch("/api/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    setMessage(res.ok ? "保存成功！" : "保存失败");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">⚙️ 设置</h1>
          <div className="w-5" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-choco/40 mb-2 flex items-center gap-1"><User className="w-4 h-4" />显示名称</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-rose/20 rounded-xl text-choco outline-none focus:border-rose" />
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md disabled:opacity-50">
              <Save className="w-4 h-4" />{saving ? "保存中..." : "保存设置"}
            </button>
            {message && <p className={`text-sm ${message.includes("失败") ? "text-red-500" : "text-green-600"}`}>{message}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
