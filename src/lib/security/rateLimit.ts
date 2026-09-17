import { NextRequest } from "next/server";

type LimitEntry = { count: number; resetAt: number };

// This is a best-effort guard for a single Node.js instance. Use a shared store
// (for example Upstash/Redis) if the app is deployed across multiple instances.
const entries = new Map<string, LimitEntry>();

function clientIp(request: NextRequest | Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function isRateLimited(
  request: NextRequest | Request,
  namespace: string,
  maxRequests: number,
  windowMs = 60_000,
) {
  const now = Date.now();
  const key = `${namespace}:${clientIp(request)}`;
  const current = entries.get(key);

  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxRequests;
}
