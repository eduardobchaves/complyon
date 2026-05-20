import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start; sufficient for single-instance deployment)
// For multi-instance/production, replace with Redis-backed store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

// Periodically prune expired entries to prevent memory leaks
let lastPrune = Date.now();
function maybePrune() {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, val] of rateLimitStore) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}

export function middleware(req: NextRequest) {
  maybePrune();

  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // Public survey token validation: 30 req/min per IP
  if (pathname.startsWith("/api/s/")) {
    if (!rateLimit(`s:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // Survey response submission: 10 req/min per IP
  if (pathname === "/api/responses") {
    if (!rateLimit(`resp:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // Complaint submission: 5 req/min per IP
  if (pathname === "/api/complaints" && req.method === "POST") {
    if (!rateLimit(`complaint:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // Complaint status lookup: 20 req/min per IP
  if (pathname === "/api/complaints/status") {
    if (!rateLimit(`cstatus:${ip}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // Auth login: 10 attempts/min per IP
  if (pathname === "/api/auth/callback/credentials" || pathname === "/api/auth/signin") {
    if (!rateLimit(`auth:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/s/:path*",
    "/api/responses",
    "/api/complaints",
    "/api/complaints/status",
    "/api/auth/callback/credentials",
    "/api/auth/signin",
  ],
};
