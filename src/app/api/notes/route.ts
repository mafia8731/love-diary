import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getNotes, createNote, markNoteRead, deleteNote } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const notes = await getNotes();
  return NextResponse.json(notes.filter(n => n.fromUser === session.username || n.toUser === session.username));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { content, toUser } = await request.json();
  const note = await createNote({ fromUser: session.username!, toUser, content });
  return NextResponse.json(note);
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await markNoteRead(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await deleteNote(id);
  return NextResponse.json({ ok: true });
}
