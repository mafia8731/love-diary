"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

interface Anniversary {
  id: string; title: string; date: string; description: string;
  icon: string; isRecurring: boolean;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  target.setFullYear(now.getFullYear());
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

const iconOptions = ["💝", "💕", "💍", "🎂", "🎄", "🌟", "🎉", "💌", "🌸", "🌙"];

export default function AnniversaryPage() {
  const [list, setList] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [date, setDate] = useState("");
  const [desc, setDesc] = useState(""); const [icon, setIcon] = useState("💝");

  const load = () => {
    fetch("/api/anniversaries-data").then(r => r.json())
      .then(d => { if (Array.isArray(d)) setList(d); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!title || !date) return;
    await fetch("/api/anniversaries-data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description: desc, icon }),
    });
    setTitle(""); setDate(""); setDesc(""); setIcon("💝"); setShowForm(false); load();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/anniversaries-data", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-display text-choco">💝 纪念日</h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-rose to-coral text-white shadow-md"><Plus className="w-5 h-5" /></button>
        </div>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-5 mb-6 space-y-4 overflow-hidden">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="纪念日名称" className="w-full px-4 py-2 bg-white/50 border border-rose/20 rounded-xl outline-none focus:border-rose" />
            <div><label className="text-sm text-choco/40 block mb-1">日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-rose/20 rounded-xl outline-none focus:border-rose" /></div>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="描述" className="w-full px-4 py-2 bg-white/50 border border-rose/20 rounded-xl outline-none focus:border-rose" />
            <div><label className="text-sm text-choco/40 block mb-2">图标</label><div className="flex flex-wrap gap-2">{iconOptions.map(i => <button key={i} onClick={() => setIcon(i)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === i ? "bg-rose/20 border-2 border-rose" : "bg-white/50 border border-transparent hover:border-rose/30"}`}>{i}</button>)}</div></div>
            <button onClick={handleAdd} className="w-full py-2 bg-gradient-to-r from-rose to-coral text-white rounded-xl font-display">添加纪念日</button>
          </motion.div>
        )}
        {loading ? <div className="text-center py-20 text-choco/30">加载中...</div>
          : list.length === 0 ? <div className="text-center py-20"><div className="text-5xl mb-4">📅</div><p className="text-choco/40">还没有纪念日</p></div>
            : <div className="space-y-3">{list.map((a, i) => {
              const days = getDaysUntil(a.date);
              return <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center gap-4">
                <span className="text-3xl">{a.icon}</span>
                <div className="flex-1"><h3 className="font-display text-choco">{a.title}</h3><p className="text-sm text-choco/40"><Calendar className="w-3 h-3 inline mr-1" />{new Date(a.date).toLocaleDateString("zh-CN")}</p></div>
                <div className="text-right"><div className="text-2xl font-bold text-rose-dark">{days}</div><div className="text-xs text-choco/40">天后</div></div>
                <button onClick={() => handleDelete(a.id)} className="text-choco/15 hover:text-red-400 ml-2"><Trash2 className="w-4 h-4" /></button>
              </motion.div>;
            })}</div>}
      </div>
    </div>
  );
}
