import { requireUser } from "@/lib/api";
import { addSalePayment } from "@/lib/services/sales";
import { addSalePaymentSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;

  const parsed = addSalePaymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  try {
    const payment = await addSalePayment(id, parsed.data);
    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not record the payment." } },
      { status: 400 }
    );
  }
}
