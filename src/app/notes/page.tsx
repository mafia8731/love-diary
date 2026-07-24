"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CircleUser, Check } from "lucide-react";
import Link from "next/link";

interface Note { id: string; fromUser: string; toUser: string; content: string; createdAt: string; read: boolean; }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [toUser, setToUser] = useState("guohanxi");
  const [sending, setSending] = useState(false);
  const [username, setUsername] = useState("");

  const load = () => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUsername(d.username || ""));
    fetch("/api/notes").then(r => r.json()).then(d => { if (Array.isArray(d)) setNotes(d); });
  };
  useEffect(() => { load(); }, []);

  // 自动设置对方为收件人
  useEffect(() => {
    if (username === "guohanxi") setToUser("liumengqi");
    else if (username === "liumengqi") setToUser("guohanxi");
  }, [username]);

  const send = async () => {
    if (!content.trim()) return;
    setSending(true);
    await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), toUser }),
    });
    setContent(""); setSending(false); load();
  };

  // 标记已读
  useEffect(() => {
    notes.filter(n => !n.read && n.toUser === username).forEach(n => {
      fetch("/api/notes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
    });
  }, [notes, username]);

  const unreadCount = notes.filter(n => !n.read && n.toUser === username).length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/home" className="text-choco/40 hover:text-choco"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-display text-choco">💌 小纸条 {unreadCount > 0 && <span className="text-xs bg-rose text-white rounded-full px-2 py-0.5 ml-1">{unreadCount}新</span>}</h1>
          <div className="w-5" />
        </div>

        {/* 消息列表 */}
        <div className="space-y-3 mb-6 max-h-[55vh] overflow-y-auto">
          {notes.length === 0 && <p className="text-center text-choco/30 py-10">还没有小纸条，写一张吧~</p>}
          {notes.map(n => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl ${n.fromUser === username ? "bg-rose/5 ml-8" : "bg-white/60 mr-8 border border-rose/10"}`}>
              <div className="flex items-center gap-2 mb-1">
                <CircleUser className="w-3.5 h-3.5 text-choco/30" />
                <span className="text-xs text-choco/40">{n.fromUser}</span>
                <span className="text-[10px] text-choco/20 ml-auto">{new Date(n.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                {n.read && <Check className="w-3 h-3 text-rose/40" />}
              </div>
              <p className="text-sm text-choco/70 whitespace-pre-wrap">{n.content}</p>
            </motion.div>
          ))}
        </div>

        {/* 输入框 */}
        <div className="flex gap-2">
          <input value={content} onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`给 ${toUser} 写张小纸条...`}
            className="flex-1 px-4 py-3 bg-white/60 border border-rose/20 rounded-2xl text-sm text-choco placeholder:text-choco/25 outline-none focus:border-rose" />
          <button onClick={send} disabled={sending}
            className="px-4 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-2xl shadow-md disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
