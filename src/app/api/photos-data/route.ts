import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotos, addPhoto, deletePhoto, getUploadDir } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json(getPhotos().map(p => ({
    ...p,
    public_url: `/uploads/${p.filename}`,
  })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const diaryId = (formData.get("diaryId") as string) || null;

  let filename = "";
  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    filename = `${Date.now()}-${file.name}`;
    const uploadDir = getUploadDir();
    await writeFile(path.join(uploadDir, filename), buffer);
  }

  const photo = addPhoto({ userId: session.username!, diaryId, filename, caption });
  return NextResponse.json({ ...photo, public_url: `/uploads/${filename}` });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  const photo = getPhotos().find(p => p.id === id);
  if (photo) {
    // 删除文件
    try { await unlink(path.join(getUploadDir(), photo.filename)); } catch {}
    deletePhoto(id);
  }
  return NextResponse.json({ ok: true });
}
