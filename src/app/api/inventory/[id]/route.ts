import { requireUser } from "@/lib/api";
import { getInventoryItem, updateInventoryItem } from "@/lib/services/inventory";
import { updateInventorySchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const item = await getInventoryItem(id);
  if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Item not found." } }, { status: 404 });
  return NextResponse.json({ data: item });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;

  const parsed = updateInventorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const item = await updateInventoryItem(id, parsed.data);
  return NextResponse.json({ data: item });
}
