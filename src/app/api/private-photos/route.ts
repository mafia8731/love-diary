import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrivatePhotos, addPrivatePhoto, deletePrivatePhoto } from "@/lib/db";

const PRIVATE_PASSWORD = "050825";
function checkAuth(request: Request) { return request.headers.get("x-private-password") === PRIVATE_PASSWORD; }

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  return NextResponse.json((await getPrivatePhotos()).map(p => ({ ...p, public_url: p.data })));
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  const session = await getSession();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || "";
  let data = "";
  if (file) {
    const bytes = await file.arrayBuffer();
    data = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
  }
  const photo = await addPrivatePhoto({ userId: session.username || "unknown", diaryId: null, data, caption });
  return NextResponse.json({ ...photo, public_url: photo.data });
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "密码错误" }, { status: 403 });
  const { id } = await request.json();
  await deletePrivatePhoto(id);
  return NextResponse.json({ ok: true });
}
