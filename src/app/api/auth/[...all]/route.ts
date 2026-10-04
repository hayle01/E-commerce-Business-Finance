import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGet, POST: authPost } = toNextJsHandler(auth.handler);

function limited(request: NextRequest) {
  // Mutations against auth (sign-in, sign-up, reset) throttled per client IP.
  const { ok, retryAfterSeconds } = rateLimit(`auth:${clientKey(request)}`, 20, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many attempts. Try again shortly." } },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  return authGet(request);
}

export async function POST(request: NextRequest) {
  const blocked = limited(request);
  if (blocked) return blocked;
  return authPost(request);
}
