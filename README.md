# 💝 Love Diary — 情侣日记

属于两个人的私密记录空间。

## 功能

- 🗓️ **日历** — 核心页面，点击日期记录心情和日记
- 📝 **日记** — 双方各自记录，不互相覆盖
- 💌 **小纸条** — 两人互发私密消息
- ✨ **愿望清单** — 共同心愿，完成勾选
- 🖼️ **照片墙** — 支持上传、删除、自定义布局
- 🔒 **隐私相册** — 密码保护的私密照片（密码：050825）
- 📅 **纪念日** — 重要日期管理和倒计时

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + Framer Motion
- Upstash Redis（Vercel 集成）
- Three.js 3D 粒子首页

## 部署

### Vercel
1. Fork 本仓库
2. Vercel → Import → 选仓库
3. Settings → Environment Variables：
   - `SESSION_SECRET`：自定义密钥（至少 32 字符）
4. Storage → 创建 Upstash Redis
5. Deploy

### 纪念日设置
编辑 `src/app/page.tsx` 和 `src/app/home/page.tsx` 中的 `ANNIVERSARY_DATE`。

## 预置账号
- guohanxi / liumengqi
- liumengqi / guohanxi

## 本地开发
```bash
npm install
npm run dev
```
