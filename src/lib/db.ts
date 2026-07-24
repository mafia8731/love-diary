import { createClient } from "redis";

let clientPromise: Promise<ReturnType<typeof createClient>> | null = null;

async function getClient() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => {});
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

async function readTable<T>(name: string): Promise<T[]> {
  try {
    const client = await getClient();
    const data = await client.get(name);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

async function writeTable<T>(name: string, data: T[]): Promise<void> {
  const client = await getClient();
  await client.set(name, JSON.stringify(data));
}

export interface Diary { id: string; userId: string; date: string; title: string; content: string; mood: string; weather: string; location: string; createdAt: string; updatedAt: string; }
export interface Photo { id: string; userId: string; diaryId: string | null; filename: string; caption: string; createdAt: string; }
export interface Anniversary { id: string; userId: string; title: string; date: string; description: string; icon: string; isRecurring: boolean; createdAt: string; }
export interface Profile { id: string; displayName: string; }
export interface Note { id: string; fromUser: string; toUser: string; content: string; createdAt: string; read: boolean; }
export interface Wish { id: string; userId: string; content: string; done: boolean; date: string; createdAt: string; }

export async function getDiaries(): Promise<Diary[]> {
  const d = await readTable<Diary>("diaries"); return d.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function getDiariesByMonth(year: number, month: number): Promise<Diary[]> {
  const p = `${year}-${String(month).padStart(2, "0")}`;
  const d = await readTable<Diary>("diaries"); return d.filter(d => d.date?.startsWith(p));
}
export async function getDiary(id: string): Promise<Diary | undefined> {
  return (await readTable<Diary>("diaries")).find(d => d.id === id);
}
export async function upsertDiary(d: Omit<Diary, "id" | "createdAt" | "updatedAt">): Promise<Diary> {
  const list = await readTable<Diary>("diaries"); const now = new Date().toISOString();
  const idx = list.findIndex(x => x.date === d.date && x.userId === d.userId);
  if (idx >= 0) { list[idx] = { ...list[idx], ...d, updatedAt: now }; await writeTable("diaries", list); return list[idx]; }
  const item: Diary = { ...d, id: genId(), createdAt: now, updatedAt: now };
  list.push(item); await writeTable("diaries", list); return item;
}
export async function updateDiary(id: string, u: Partial<Omit<Diary, "id" | "createdAt">>): Promise<Diary | null> {
  const list = await readTable<Diary>("diaries"); const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...u, updatedAt: new Date().toISOString() }; await writeTable("diaries", list); return list[idx];
}
export async function deleteDiary(id: string): Promise<boolean> {
  const list = await readTable<Diary>("diaries"); const idx = list.findIndex(d => d.id === id);
  if (idx === -1) return false; list.splice(idx, 1); await writeTable("diaries", list); return true;
}

export async function getPhotos(): Promise<Photo[]> {
  return (await readTable<Photo>("photos")).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function addPhoto(p: Omit<Photo, "id" | "createdAt">): Promise<Photo> {
  const list = await readTable<Photo>("photos"); const item: Photo = { ...p, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); await writeTable("photos", list); return item;
}
export async function deletePhoto(id: string): Promise<boolean> {
  const list = await readTable<Photo>("photos"); const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return false; list.splice(idx, 1); await writeTable("photos", list); return true;
}

export async function getPrivatePhotos(): Promise<Photo[]> {
  return (await readTable<Photo>("private-photos")).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function addPrivatePhoto(p: Omit<Photo, "id" | "createdAt">): Promise<Photo> {
  const list = await readTable<Photo>("private-photos"); const item: Photo = { ...p, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); await writeTable("private-photos", list); return item;
}
export async function deletePrivatePhoto(id: string): Promise<boolean> {
  const list = await readTable<Photo>("private-photos"); const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return false; list.splice(idx, 1); await writeTable("private-photos", list); return true;
}

export async function getAnniversaries(): Promise<Anniversary[]> {
  return (await readTable<Anniversary>("anniversaries")).sort((a, b) => +new Date(a.date) - +new Date(b.date));
}
export async function createAnniversary(d: Omit<Anniversary, "id" | "createdAt">): Promise<Anniversary> {
  const list = await readTable<Anniversary>("anniversaries"); const item: Anniversary = { ...d, id: genId(), createdAt: new Date().toISOString() };
  list.push(item); await writeTable("anniversaries", list); return item;
}
export async function deleteAnniversary(id: string): Promise<boolean> {
  const list = await readTable<Anniversary>("anniversaries"); const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return false; list.splice(idx, 1); await writeTable("anniversaries", list); return true;
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  return (await readTable<Profile>("profiles")).find(p => p.id === id);
}
export async function saveProfile(profile: Profile): Promise<void> {
  const list = await readTable<Profile>("profiles"); const idx = list.findIndex(p => p.id === profile.id);
  if (idx >= 0) list[idx] = profile; else list.push(profile);
  await writeTable("profiles", list);
}

export async function getNotes(): Promise<Note[]> {
  return (await readTable<Note>("notes")).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function createNote(d: Omit<Note, "id" | "createdAt" | "read">): Promise<Note> {
  const list = await readTable<Note>("notes"); const item: Note = { ...d, id: genId(), createdAt: new Date().toISOString(), read: false };
  list.push(item); await writeTable("notes", list); return item;
}
export async function markNoteRead(id: string): Promise<void> {
  const list = await readTable<Note>("notes"); const n = list.find(x => x.id === id);
  if (n) { n.read = true; await writeTable("notes", list); }
}

export async function getWishes(): Promise<Wish[]> {
  return (await readTable<Wish>("wishes")).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export async function createWish(d: Omit<Wish, "id" | "createdAt" | "done">): Promise<Wish> {
  const list = await readTable<Wish>("wishes"); const item: Wish = { ...d, id: genId(), createdAt: new Date().toISOString(), done: false };
  list.push(item); await writeTable("wishes", list); return item;
}
export async function toggleWish(id: string): Promise<Wish | null> {
  const list = await readTable<Wish>("wishes"); const w = list.find(x => x.id === id);
  if (!w) return null; w.done = !w.done; await writeTable("wishes", list); return w;
}
export async function deleteWish(id: string): Promise<boolean> {
  const list = await readTable<Wish>("wishes"); const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return false; list.splice(idx, 1); await writeTable("wishes", list); return true;
}

import fs from "fs";
export function getUploadDir(): string {
  const dir = "/tmp/uploads"; if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); return dir;
}
export function getPrivateUploadDir(): string {
  const dir = "/tmp/uploads/private"; if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); return dir;
}
