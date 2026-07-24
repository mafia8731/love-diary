import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.REDIS_URL || "";
  const m = raw.match(/redis:\/\/default:([^@]+)@([^:]+):/);

  if (!m) {
    return NextResponse.json({ error: "无法解析 REDIS_URL" });
  }

  const token = m[1];
  const host = m[2];

  try {
    const res = await fetch(`https://${host}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", "debug-test", JSON.stringify({ time: Date.now() })]),
    });

    if (!res.ok) {
      return NextResponse.json({ status: "失败", httpStatus: res.status, body: await res.text() });
    }

    const data = await res.json();

    // 清理
    await fetch(`https://${host}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["DEL", "debug-test"]),
    });

    return NextResponse.json({
      status: "成功",
      host,
      tokenLen: token.length,
      restResult: data,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "失败", error: e.message });
  }
}
