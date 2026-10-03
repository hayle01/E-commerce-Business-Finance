import { requireUser } from "@/lib/api";
import { cancelOrReturnSale } from "@/lib/services/sales";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const outcome = body?.outcome === "RETURNED" ? "RETURNED" : "CANCELLED";
  try {
    const sale = await cancelOrReturnSale(id, outcome);
    return NextResponse.json({ data: sale });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not close the sale." } },
      { status: 400 }
    );
  }
}
