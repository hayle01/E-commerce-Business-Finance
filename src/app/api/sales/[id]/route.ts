import { requireUser } from "@/lib/api";
import { getSale, updateSale } from "@/lib/services/sales";
import { updateSaleSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const sale = await getSale(user!.id, id);
  if (!sale) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Sale not found." } }, { status: 404 });
  return NextResponse.json({ data: sale });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;

  const parsed = updateSaleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  try {
    const sale = await updateSale(user!.id, id, parsed.data);
    return NextResponse.json({ data: sale });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not update the sale." } },
      { status: 400 }
    );
  }
}
