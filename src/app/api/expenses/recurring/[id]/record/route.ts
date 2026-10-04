import { requireUser } from "@/lib/api";
import { recordRecurringExpense } from "@/lib/services/recurring";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  try {
    const expense = await recordRecurringExpense(user!.id, id);
    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not record the expense." } },
      { status: 400 }
    );
  }
}
