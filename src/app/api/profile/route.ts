import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getProfile, saveProfile } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const profile = getProfile(session.username!);
  return NextResponse.json(profile || { id: session.username, displayName: session.username });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { displayName } = await request.json();
  saveProfile({ id: session.username!, displayName: displayName || session.username! });
  return NextResponse.json({ ok: true });
}
