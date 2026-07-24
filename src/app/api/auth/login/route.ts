import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { validateCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const session = await getSession();
  session.username = username;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ username });
}
