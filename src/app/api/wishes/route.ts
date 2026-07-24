import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getWishes, createWish, toggleWish, deleteWish } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json(getWishes());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { content } = await request.json();
  const wish = createWish({ userId: session.username!, content });
  return NextResponse.json(wish);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  toggleWish(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  deleteWish(id);
  return NextResponse.json({ ok: true });
}
