import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrivatePhotos, addPrivatePhoto, deletePrivatePhoto, getPrivateUploadDir } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const PRIVATE_PASSWORD = "050825";

function checkAuth(request: Request) {
  const pw = request.headers.get("x-private-password");
  return pw === PRIVATE_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  return NextResponse.json((await getPrivatePhotos()).map(p => ({ ...p, public_url: `/uploads/private/${p.filename}` })));
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  const session = await getSession();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";

  let filename = "";
  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    filename = `${Date.now()}-${file.name}`;
    await writeFile(path.join(getPrivateUploadDir(), filename), buffer);
  }

  const photo = await addPrivatePhoto({ userId: session.username || "unknown", diaryId: null, filename, caption });
  return NextResponse.json({ ...photo, public_url: `/uploads/private/${filename}` });
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  const { id } = await request.json();
  const photo = (await getPrivatePhotos()).find(p => p.id === id);
  if (photo) {
    try { await unlink(path.join(getPrivateUploadDir(), photo.filename)); } catch {}
    await deletePrivatePhoto(id);
  }
  return NextResponse.json({ ok: true });
}
