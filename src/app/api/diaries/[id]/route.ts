import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDiary, deleteDiary } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const diary = getDiary(id);
  if (!diary) return NextResponse.json({ error: "不存在" }, { status: 404 });
  return NextResponse.json(diary);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  deleteDiary(id);
  return NextResponse.json({ ok: true });
}
