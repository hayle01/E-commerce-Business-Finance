import { requireUser } from "@/lib/api";
import { getSale } from "@/lib/services/sales";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const sale = await getSale(id);
  if (!sale) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Sale not found." } }, { status: 404 });
  return NextResponse.json({ data: sale });
}
