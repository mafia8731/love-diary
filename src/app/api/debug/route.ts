import { NextResponse } from "next/server";
import Redis from "ioredis";

export async function GET() {
  const results: Record<string, any> = {};
  const raw = process.env.REDIS_URL || "";

  results.rawUrl = raw.replace(/\/\/default:[^@]+@/, "//default:***@");

  try {
    const redis = new Redis(raw + "?family=0", {
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await redis.connect();

    const testKey = "debug-test";
    await redis.set(testKey, JSON.stringify({ time: Date.now() }));
    const val = await redis.get(testKey);
    await redis.del(testKey);
    await redis.quit();

    results.redis = { status: "成功", value: val ? JSON.parse(val) : null };
  } catch (e: any) {
    results.redis = { status: "失败", error: e.message };
  }

  return NextResponse.json(results);
}
