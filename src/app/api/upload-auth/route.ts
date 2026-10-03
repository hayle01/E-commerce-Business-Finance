import { requireUser } from "@/lib/api";
import { imagekitStorage } from "@/lib/storage/imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

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
