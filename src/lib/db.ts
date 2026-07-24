import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
function ensureDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readTable<T>(name: string): T[] {
  ensureDir(); const f = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(f)) return [];
  try { return JSON.parse(fs.readFileSync(f, "utf-8")); } catch { return []; }
}
function writeTable<T>(name: string, data: T[]): void {
  ensureDir(); fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2), "utf-8");
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export interface Diary { id: string; userId: string; date: string; title: string; content: string; mood: string; weather: string; location: string; createdAt: string; updatedAt: string; }
export interface Photo { id: string; userId: string; diaryId: string | null; filename: string; caption: string; createdAt: string; }
export interface Anniversary { id: string; userId: string; title: string; date: string; description: string; icon: string; isRecurring: boolean; createdAt: string; }
export interface Profile { id: string; displayName: string; }
export interface Note { id: string; fromUser: string; toUser: string; content: string; createdAt: string; read: boolean; }
export interface Wish { id: string; userId: string; content: string; done: boolean; date: string; createdAt: string; }

// ===== Diaries =====
export function getDiaries(): Diary[] { return readTable<Diary>("diaries").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function getDiariesByMonth(year: number, month: number): Diary[] {
  const p = `${year}-${String(month).padStart(2, "0")}`;
  return readTable<Diary>("diaries").filter(d => d.date?.startsWith(p));
}
export function getDiaryByDate(date: string): Diary | undefined { return readTable<Diary>("diaries").find(d => d.date === date); }
export function getDiariesByDate(date: string): Diary[] { return readTable<Diary>("diaries").filter(d => d.date === date); }
export function getDiaryByDateAndUser(date: string, userId: string): Diary | undefined {
  return readTable<Diary>("diaries").find(d => d.date === date && d.userId === userId);
}
export function getDiary(id: string): Diary | undefined { return readTable<Diary>("diaries").find(d => d.id === id); }
export function createDiary(d: Omit<Diary, "id" | "createdAt" | "updatedAt">): Diary {
  const list = readTable<Diary>("diaries"); const now = new Date().toISOString();
  const item: Diary = { ...d, id: genId(), createdAt: now, updatedAt: now };
  list.push(item); writeTable("diaries", list); return item;
}
export function upsertDiary(d: Omit<Diary, "id" | "createdAt" | "updatedAt">): Diary {
  const list = readTable<Diary>("diaries"); const now = new Date().toISOString();
  const existing = list.findIndex(x => x.date === d.date && x.userId === d.userId);
  if (existing >= 0) {
    list[existing] = { ...list[existing], ...d, updatedAt: now };
    writeTable("diaries", list); return list[existing];
  }
  const item: Diary = { ...d, id: genId(), createdAt: now, updatedAt: now };
  list.push(item); writeTable("diaries", list); return item;
}
export function updateDiary(id: string, u: Partial<Omit<Diary, "id" | "createdAt">>): Diary | null {
  const list = readTable<Diary>("diaries"); const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...u, updatedAt: new Date().toISOString() }; writeTable("diaries", list); return list[idx];
}
export function deleteDiary(id: string): boolean {
  const list = readTable<Diary>("diaries"); const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return false; list.splice(idx, 1); writeTable("diaries", list); return true;
}

// ===== Photos =====
export function getPhotos(): Photo[] { return readTable<Photo>("photos").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function addPhoto(p: Omit<Photo, "id" | "createdAt">): Photo {
  const list = readTable<Photo>("photos"); const item: Photo = { ...p, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); writeTable("photos", list); return item;
}
export function deletePhoto(id: string): boolean {
  const list = readTable<Photo>("photos"); const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return false; list.splice(idx, 1); writeTable("photos", list); return true;
}

// ===== Private Photos =====
export function getPrivatePhotos(): Photo[] { return readTable<Photo>("private-photos").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function addPrivatePhoto(p: Omit<Photo, "id" | "createdAt">): Photo {
  const list = readTable<Photo>("private-photos"); const item: Photo = { ...p, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); writeTable("private-photos", list); return item;
}
export function deletePrivatePhoto(id: string): boolean {
  const list = readTable<Photo>("private-photos"); const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return false; list.splice(idx, 1); writeTable("private-photos", list); return true;
}
export function getPrivateUploadDir(): string {
  const dir = path.join(process.cwd(), "public", "uploads", "private");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); return dir;
}

// ===== Anniversaries =====
export function getAnniversaries(): Anniversary[] { return readTable<Anniversary>("anniversaries").sort((a, b) => +new Date(a.date) - +new Date(b.date)); }
export function createAnniversary(d: Omit<Anniversary, "id" | "createdAt">): Anniversary {
  const list = readTable<Anniversary>("anniversaries"); const item: Anniversary = { ...d, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); writeTable("anniversaries", list); return item;
}
export function deleteAnniversary(id: string): boolean {
  const list = readTable<Anniversary>("anniversaries"); const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return false; list.splice(idx, 1); writeTable("anniversaries", list); return true;
}

// ===== Profile =====
export function getProfile(id: string): Profile | undefined { return readTable<Profile>("profiles").find(p => p.id === id); }
export function saveProfile(profile: Profile): void {
  const list = readTable<Profile>("profiles"); const idx = list.findIndex(p => p.id === profile.id);
  if (idx >= 0) list[idx] = profile; else list.push(profile);
  writeTable("profiles", list);
}

// ===== Notes =====
export function getNotes(): Note[] { return readTable<Note>("notes").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function createNote(d: Omit<Note, "id" | "createdAt" | "read">): Note {
  const list = readTable<Note>("notes"); const item: Note = { ...d, id: genId(), createdAt: new Date().toISOString(), read: false };
  list.push(item); writeTable("notes", list); return item;
}
export function markNoteRead(id: string): void {
  const list = readTable<Note>("notes"); const n = list.find(x => x.id === id);
  if (n) { n.read = true; writeTable("notes", list); }
}

// ===== Wishes =====
export function getWishes(): Wish[] { return readTable<Wish>("wishes").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function createWish(d: Omit<Wish, "id" | "createdAt" | "done">): Wish {
  const list = readTable<Wish>("wishes"); const item: Wish = { ...d, id: genId(), createdAt: new Date().toISOString(), done: false };
  list.push(item); writeTable("wishes", list); return item;
}
export function toggleWish(id: string): Wish | null {
  const list = readTable<Wish>("wishes"); const w = list.find(x => x.id === id);
  if (!w) return null; w.done = !w.done; writeTable("wishes", list); return w;
}
export function deleteWish(id: string): boolean {
  const list = readTable<Wish>("wishes"); const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false; list.splice(idx, 1); writeTable("wishes", list); return true;
}

// ===== Uploads =====
export function getUploadDir(): string {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); return dir;
}
