import { requireUser } from "@/lib/api";
import { deleteExpense, getExpense, updateExpense } from "@/lib/services/expenses";
import { updateExpenseSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const expense = await getExpense(id);
  if (!expense) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Expense not found." } }, { status: 404 });
  return NextResponse.json({ data: expense });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = updateExpenseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const expense = await updateExpense(id, parsed.data);
  return NextResponse.json({ data: expense });
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  await deleteExpense(id);
  return NextResponse.json({ data: { id } });
}
