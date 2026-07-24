# 🚀 部署指南

## 前置准备

### 1. Supabase 项目
1. 前往 [supabase.com](https://supabase.com) 注册/登录
2. 创建新项目，记住项目 URL 和 anon key
3. 在 SQL Editor 中执行 `schema.sql` 中的所有 SQL
4. 在 Storage 中创建 bucket：`diary-photos`（设为公开）
5. 在 Storage → Policies 中为 `diary-photos` bucket 添加读写策略

### 2. 配置环境变量
创建 `.env.local`（已自动忽略 git）：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## Railway 部署

### 方式一：CLI 部署
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 方式二：GitHub 自动部署
1. 将项目推送到 GitHub
2. 在 Railway 中连接仓库
3. 添加环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Railway 自动构建部署

### 绑定子域名
1. 在 Railway Dashboard → Settings → Domains 添加自定义域名
2. 在域名 DNS 中添加 CNAME 记录指向 Railway 提供的域名

## 本地开发
```bash
npm install
npm run dev
```

## 纪念日配置
编辑 `src/app/page.tsx` 第 148 行：
```typescript
const ANNIVERSARY_DATE = new Date("2023-01-01"); // 修改为你们的纪念日
```
