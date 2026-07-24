import { NextResponse } from "next/server";
import { createClient } from "redis";

export async function GET() {
  try {
    const client = createClient({ url: process.env.REDIS_URL! });
    await client.connect();

    await client.set("debug-test", JSON.stringify({ time: Date.now() }));
    const val = await client.get("debug-test");
    await client.del("debug-test");
    await client.quit();

    return NextResponse.json({
      status: "成功",
      value: val ? JSON.parse(val) : null,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "失败", error: e.message });
  }
}
