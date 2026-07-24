import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAnniversaries, createAnniversary, deleteAnniversary } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json(await getAnniversaries());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const body = await request.json();
  const item = await createAnniversary({
    userId: session.username!,
    title: body.title,
    date: body.date,
    description: body.description || "",
    icon: body.icon || "💝",
    isRecurring: body.isRecurring ?? true,
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await request.json();
  await deleteAnniversary(id);
  return NextResponse.json({ ok: true });
}
