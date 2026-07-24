import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getNotes, createNote, markNoteRead } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json(getNotes().filter(n => n.fromUser === session.username || n.toUser === session.username));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { content, toUser } = await request.json();
  const note = createNote({ fromUser: session.username!, toUser, content });
  return NextResponse.json(note);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  markNoteRead(id);
  return NextResponse.json({ ok: true });
}
