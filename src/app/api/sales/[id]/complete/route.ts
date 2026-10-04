import { requireUser } from "@/lib/api";
import { markDelivered } from "@/lib/services/sales";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  try {
    const sale = await markDelivered(user!.id, id);
    return NextResponse.json({ data: sale });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not complete the sale." } },
      { status: 400 }
    );
  }
}
