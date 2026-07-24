import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

function createRedis(): Redis {
  const rawUrl = process.env.REDIS_URL;
  if (!rawUrl) return new Redis({ url: "http://localhost", token: "no-url" });
  const match = rawUrl.match(/redis:\/\/default:([^@]+)@([^:]+):(\d+)/);
  if (match) {
    return new Redis({ url: `https://${match[2]}`, token: match[1] });
  }
  return new Redis({ url: rawUrl, token: "fallback" });
}

export async function GET() {
  const results: Record<string, any> = {};

  // 真实 URL（隐藏密码）
  const raw = process.env.REDIS_URL || "";
  results.rawUrl = raw.replace(/\/\/default:[^@]+@/, "//default:***@");

  // 解析结果
  const match = raw.match(/redis:\/\/default:([^@]+)@([^:]+):(\d+)/);
  results.parsed = match
    ? { host: match[2], port: match[3], tokenLen: match[1].length, restUrl: `https://${match[2]}` }
    : "无法解析";

  // 测试 Redis
  try {
    const redis = createRedis();
    await redis.set("debug-test", { time: Date.now() });
    const val = await redis.get("debug-test");
    await redis.del("debug-test");
    results.redis = { status: "成功", value: val };
  } catch (e: any) {
    results.redis = { status: "失败", error: e.message };
  }

  return NextResponse.json(results);
}
