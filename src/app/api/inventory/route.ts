import { requireUser } from "@/lib/api";
import { createInventoryItem, listInventoryItems } from "@/lib/services/inventory";
import { createInventorySchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  const items = await listInventoryItems();
  return NextResponse.json({ data: items });
}

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const parsed = createInventorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const item = await createInventoryItem(parsed.data);
  return NextResponse.json({ data: item }, { status: 201 });
}
