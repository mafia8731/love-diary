import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const IMGBB_KEY = "76975197dc3afa38ab09b4dad6b09df3";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await request.formData();
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data);
}
