"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setDisplayName(user.email || "");
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (data?.display_name) setDisplayName(data.display_name);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });
    if (error) {
      setMessage("保存失败：" + error.message);
    } else {
      setMessage("保存成功！");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/home" className="text-choco/40 hover:text-choco transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display text-choco">⚙️ 设置</h1>
          <div className="w-5" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-choco/40 mb-2 flex items-center gap-1">
                <User className="w-4 h-4" /> 显示名称
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="你的名字"
                className="w-full px-4 py-3 bg-white/50 border border-rose/20 rounded-xl text-choco outline-none focus:border-rose transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose to-coral text-white rounded-full font-display shadow-md shadow-rose/20 hover:shadow-lg disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "保存中..." : "保存设置"}
            </button>

            {message && (
              <p className={`text-sm ${message.includes("失败") ? "text-red-500" : "text-green-600"}`}>
                {message}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
