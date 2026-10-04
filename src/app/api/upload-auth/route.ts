import { requireUser } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { imagekitStorage } from "@/lib/storage/imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const { ok, retryAfterSeconds } = rateLimit(`upload-auth:${clientKey(request)}`, 30, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const folderId = request.nextUrl.searchParams.get("folderId");
  if (!folderId || !/^[a-zA-Z0-9-]+$/.test(folderId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "A valid folderId is required." } },
      { status: 400 }
    );
  }

  const folder = `commerce-finance/products/${folderId}`;
  const auth = imagekitStorage.getUploadAuth(folder);
  return NextResponse.json({ data: auth });
}
