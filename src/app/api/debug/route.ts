import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  const results: Record<string, any> = {};

  // 1. 环境变量
  results.env = {
    REDIS_URL: process.env.REDIS_URL ? "存在" : "缺失",
    KV_URL: process.env.KV_URL ? "存在" : "缺失",
    KV_REST_API_URL: process.env.KV_REST_API_URL ? "存在" : "缺失",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "存在" : "缺失",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "存在" : "缺失",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "存在" : "缺失",
  };

  // 2. 测试 Redis 读写
  try {
    const redis = Redis.fromEnv();
    const testKey = "debug-test";
    await redis.set(testKey, { time: Date.now(), ok: true });
    const val = await redis.get(testKey);
    await redis.del(testKey);
    results.redis = { status: "成功", value: val };
  } catch (e: any) {
    results.redis = { status: "失败", error: e.message, stack: e.stack?.slice(0, 300) };
  }

  return NextResponse.json(results);
}
