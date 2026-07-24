import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readTable<T>(name: string): T[] {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); } catch { return []; }
}

function writeTable<T>(name: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2), "utf-8");
}

// ===== 类型 =====
export interface Diary {
  id: string; userId: string; title: string; content: string;
  mood: string; weather: string; location: string;
  createdAt: string; updatedAt: string;
}
export interface Photo {
  id: string; userId: string; diaryId: string | null;
  filename: string; caption: string; createdAt: string;
}
export interface Anniversary {
  id: string; userId: string; title: string; date: string;
  description: string; icon: string; isRecurring: boolean; createdAt: string;
}
export interface Profile {
  id: string; displayName: string;
}

// ===== Diaries =====
export function getDiaries(): Diary[] {
  return readTable<Diary>("diaries").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export function getDiary(id: string): Diary | undefined {
  return readTable<Diary>("diaries").find(d => d.id === id);
}
export function createDiary(d: Omit<Diary, "id" | "createdAt" | "updatedAt">): Diary {
  const list = readTable<Diary>("diaries");
  const now = new Date().toISOString();
  const item: Diary = { ...d, id: genId(), createdAt: now, updatedAt: now };
  list.push(item); writeTable("diaries", list); return item;
}
export function deleteDiary(id: string): boolean {
  const list = readTable<Diary>("diaries");
  const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); writeTable("diaries", list); return true;
}

// ===== Photos =====
export function getPhotos(): Photo[] {
  return readTable<Photo>("photos").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export function addPhoto(p: Omit<Photo, "id" | "createdAt">): Photo {
  const list = readTable<Photo>("photos");
  const item: Photo = { ...p, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); writeTable("photos", list); return item;
}

// ===== Anniversaries =====
export function getAnniversaries(): Anniversary[] {
  return readTable<Anniversary>("anniversaries").sort((a, b) => +new Date(a.date) - +new Date(b.date));
}
export function createAnniversary(d: Omit<Anniversary, "id" | "createdAt">): Anniversary {
  const list = readTable<Anniversary>("anniversaries");
  const item: Anniversary = { ...d, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); writeTable("anniversaries", list); return item;
}
export function deleteAnniversary(id: string): boolean {
  const list = readTable<Anniversary>("anniversaries");
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1); writeTable("anniversaries", list); return true;
}

// ===== Profile =====
export function getProfile(id: string): Profile | undefined {
  return readTable<Profile>("profiles").find(p => p.id === id);
}
export function saveProfile(profile: Profile): void {
  const list = readTable<Profile>("profiles");
  const idx = list.findIndex(p => p.id === profile.id);
  if (idx >= 0) list[idx] = profile; else list.push(profile);
  writeTable("profiles", list);
}

// ===== Uploads =====
export function getUploadDir(): string {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
