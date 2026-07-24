import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotos, addPhoto, deletePhoto } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json((await getPhotos()).map(p => ({
    id: p.id, caption: p.caption, createdAt: p.createdAt, userId: p.userId,
    public_url: p.data, // 加密 base64
  })));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  const diaryId = (formData.get("diaryId") as string) || null;
  const dataUrl = (formData.get("dataUrl") as string) || ""; // 前端压缩+加密后的 base64

  if (!dataUrl && file) {
    // 兜底：服务端简单处理
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
