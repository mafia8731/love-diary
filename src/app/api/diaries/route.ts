import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDiaries, createDiary, getDiariesByMonth } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  if (year && month) return NextResponse.json(getDiariesByMonth(+year, +month));
  return NextResponse.json(getDiaries());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const body = await request.json();
  const diary = createDiary({
    userId: session.username!, date: body.date || new Date().toISOString().slice(0, 10),
    title: body.title || "", content: body.content || "",
    mood: body.mood || "", weather: body.weather || "", location: body.location || "",
  });
  return NextResponse.json(diary);
}
