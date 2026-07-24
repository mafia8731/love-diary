import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotos, addPhoto, deletePhoto, getPhoto } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 单张照片（含数据）
  if (id) {
    const p = getPhoto ? await getPhoto(id) : (await getPhotos()).find(p => p.id === id);
    if (!p) return NextResponse.json({ error: "不存在" }, { status: 404 });
    return NextResponse.json({ id: p.id, caption: p.caption, createdAt: p.createdAt, userId: p.userId, public_url: p.data });
  }

  // 列表（不含数据，只含缩略图标记）
  return NextResponse.json((await getPhotos()).map(p => ({
    id: p.id, caption: p.caption, createdAt: p.createdAt, userId: p.userId,
    hasData: !!p.data,
  })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const diaryId = (formData.get("diaryId") as string) || null;
  const dataUrl = (formData.get("dataUrl") as string) || "";

  if (!dataUrl && file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = Buffer.from(bytes).toString("base64");
    const photo = await addPhoto({ userId: session.username!, diaryId, data: `data:${file.type};base64,${base64}`, caption });
    return NextResponse.json({ ...photo, public_url: photo.data });
  }

  const photo = await addPhoto({ userId: session.username!, diaryId, data: dataUrl, caption });
  return NextResponse.json({ ...photo, public_url: photo.data });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
