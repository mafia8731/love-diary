-- ============================================
-- 情侣日记 · 数据库 Schema
-- 请在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 用户资料表 (profiles)
-- 扩展 Supabase auth.users，存储显示名等信息
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. 日记表 (diaries)
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT,              -- 心情标签: happy, love, grateful, calm, miss, excited
  weather TEXT,           -- 天气: sunny, cloudy, rainy, snowy
  location TEXT,          -- 位置名称
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 照片表 (photos)
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diary_id UUID REFERENCES diaries(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,      -- Supabase Storage 路径
  public_url TEXT,                 -- 公开访问 URL
  caption TEXT,                    -- 照片说明
  taken_at TIMESTAMPTZ,           -- 拍摄时间
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 纪念日表 (anniversaries)
CREATE TABLE IF NOT EXISTS anniversaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,             -- 纪念日名称
  date DATE NOT NULL,              -- 日期
  description TEXT,                -- 描述
  icon TEXT DEFAULT 'heart',       -- 图标
  is_recurring BOOLEAN DEFAULT true, -- 是否每年重复
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anniversaries ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户可读所有profile（显示作者名），只能更新自己的
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Diaries: 已登录用户可读所有日记，只能操作自己的
CREATE POLICY "diaries_select" ON diaries
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "diaries_insert" ON diaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diaries_update" ON diaries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diaries_delete" ON diaries
  FOR DELETE USING (auth.uid() = user_id);

-- Photos: 已登录用户可读所有照片，只能操作自己的
CREATE POLICY "photos_select" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "photos_insert" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_update" ON photos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "photos_delete" ON photos
  FOR DELETE USING (auth.uid() = user_id);

-- Anniversaries: 已登录用户可读所有纪念日，只能操作自己的
CREATE POLICY "anniversaries_select" ON anniversaries
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "anniversaries_insert" ON anniversaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "anniversaries_update" ON anniversaries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "anniversaries_delete" ON anniversaries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Storage Buckets
-- ============================================

-- 请在 Supabase Dashboard → Storage 中手动创建以下 bucket：
-- 1. "diary-photos" - 公开访问，存放照片

-- Storage RLS (创建 bucket 后在 SQL Editor 执行):
-- CREATE POLICY "photos_select_policy" ON storage.objects
--   FOR SELECT USING (bucket_id = 'diary-photos');
-- CREATE POLICY "photos_insert_policy" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'diary-photos' AND auth.role() = 'authenticated');
-- CREATE POLICY "photos_delete_policy" ON storage.objects
--   FOR DELETE USING (bucket_id = 'diary-photos' AND auth.uid() = owner);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_diary_id ON photos(diary_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_anniversaries_user_id ON anniversaries(user_id);
CREATE INDEX IF NOT EXISTS idx_anniversaries_date ON anniversaries(date);
