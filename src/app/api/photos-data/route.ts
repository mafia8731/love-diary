import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotos, addPhoto, deletePhoto } from "@/lib/db";
import { encrypt, bytesToBmp } from "@/lib/crypto";

const IMGBB_KEY = "76975197dc3afa38ab09b4dad6b09df3";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json((await getPhotos()).map(p => ({
    id: p.id, caption: p.caption, createdAt: p.createdAt, userId: p.userId,
    imgbbUrl: p.data, // imgbb 直链，客户端自行解密
  })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const diaryId = (formData.get("diaryId") as string) || null;

  if (!file) return NextResponse.json({ error: "无图片" }, { status: 400 });

  // 1. 读取图片 → XOR 加密 → 打包 BMP
  const bytes = new Uint8Array(await file.arrayBuffer());
  const encrypted = encrypt(bytes);
  const bmp = bytesToBmp(encrypted);

  // 2. 上传到 imgbb
  const upForm = new FormData();
  upForm.append("image", bmp, "encrypted.bmp");
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST", body: upForm,
  });
  const result = await res.json();
  if (!result.success) return NextResponse.json({ error: "上传失败" }, { status: 500 });

  const url = result.data.url; // imgbb 直链
  const photo = await addPhoto({ userId: session.username!, diaryId, data: url, caption });
  return NextResponse.json({ id: photo.id, caption: photo.caption, createdAt: photo.createdAt, userId: photo.userId, imgbbUrl: url });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
