"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Check, Trash2, CircleUser } from "lucide-react";
import Link from "next/link";

interface Wish { id: string; userId: string; content: string; done: boolean; date: string; createdAt: string; }

const userBadge = (u: string) => u === "guohanxi"
  ? "bg-blue-100 text-blue-600"
  : "bg-rose-100 text-rose-600";

export default function WishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [adding, setAdding] = useState(false);

  const load = () => { fetch("/api/wishes").then(r => r.json()).then(d => { if (Array.isArray(d)) setWishes(d); }); };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!content.trim()) return;
    setAdding(true);
    await fetch("/api/wishes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim(), date }) });
    setContent(""); setAdding(false); load();
  };
  const toggle = async (id: string) => {
    await fetch("/api/wishes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); load();
  };
  const remove = async (id: string) => {
    await fetch("/api/wishes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); load();
  };

  const todoList = wishes.filter(w => !w.done);
  const doneList = wishes.filter(w => w.done);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-display text-choco">✨ 愿望清单</h1>
          <div className="w-5" />
        </div>

        {/* 添加 */}
        <div className="flex gap-2 mb-4">
          <input value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="添加一个愿望..." className="flex-1 px-4 py-3 bg-white/60 border border-rose/20 rounded-2xl text-sm text-choco placeholder:text-choco/25 outline-none focus:border-rose" />
          <button onClick={add} disabled={adding} className="px-4 py-3 bg-gradient-to-r from-coral to-gold text-white rounded-2xl shadow-md"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="mb-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 bg-white/60 border border-rose/20 rounded-xl text-xs text-choco/60 outline-none" />
        </div>

        {todoList.length === 0 && doneList.length === 0 && <p className="text-center text-choco/30 py-10">还没有愿望，一起添加吧~</p>}

        {/* 待完成 */}
        {todoList.map(w => (
          <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-rose/10 mb-2">
            <button onClick={() => toggle(w.id)} className="w-5 h-5 rounded-full border-2 border-rose/30 hover:border-rose flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-choco/70">{w.content}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${userBadge(w.userId)}`}>{w.userId}</span>
                {w.date && <span className="text-[10px] text-choco/30">{w.date}</span>}
              </div>
            </div>
            <button onClick={() => remove(w.id)} className="text-choco/15 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
          </motion.div>
        ))}

        {/* 已完成 */}
        {doneList.length > 0 && (
          <>
            <p className="text-xs text-choco/30 mb-2 mt-4">已完成 {doneList.length}</p>
            {doneList.map(w => (
              <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-xl mb-2">
                <button onClick={() => toggle(w.id)} className="w-5 h-5 rounded-full bg-rose/20 border-2 border-rose flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-rose" />
                </button>
                <div className="flex-1">
                  <span className="text-sm text-choco/30 line-through">{w.content}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 ${userBadge(w.userId)}`}>{w.userId}</span>
                </div>
                <button onClick={() => remove(w.id)} className="text-choco/10 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
