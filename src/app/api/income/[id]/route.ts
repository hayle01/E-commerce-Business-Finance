import { requireUser } from "@/lib/api";
import { getOtherIncome, updateOtherIncome } from "@/lib/services/income";
import { updateIncomeSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const income = await getOtherIncome(id);
  if (!income) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Income not found." } }, { status: 404 });
  return NextResponse.json({ data: income });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = updateIncomeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const income = await updateOtherIncome(id, parsed.data);
  return NextResponse.json({ data: income });
}
