import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotos, addPhoto, deletePhoto, getPhoto } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 单张：返回大图
  if (id) {
    const p = await getPhoto(id);
    if (!p) return NextResponse.json({ error: "不存在" }, { status: 404 });
    return NextResponse.json({ id: p.id, public_url: p.fullData || p.data });
  }

  // 列表：返回缩略图
  return NextResponse.json((await getPhotos()).map(p => ({
    id: p.id, caption: p.caption, createdAt: p.createdAt, userId: p.userId,
    public_url: p.data,
  })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const fd = await request.formData();
  const dataUrl = (fd.get("dataUrl") as string) || "";
  const fullDataUrl = (fd.get("fullDataUrl") as string) || "";
  const caption = (fd.get("caption") as string) || "";

  if (!dataUrl) return NextResponse.json({ error: "无图片" }, { status: 400 });

  const photo = await addPhoto({
    userId: session.username!,
    diaryId: (fd.get("diaryId") as string) || null,
    data: dataUrl,
    fullData: fullDataUrl || undefined,
    caption,
  });
  return NextResponse.json({ ...photo, public_url: photo.data });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await deletePhoto(id);
  return NextResponse.json({ ok: true });
}
