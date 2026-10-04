import { requireUser } from "@/lib/api";
import { createExpense, listExpenses } from "@/lib/services/expenses";
import { createExpenseSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const sp = request.nextUrl.searchParams;
  const expenses = await listExpenses(user!.id, {
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    expenseKind: sp.get("expenseKind") ?? undefined,
    method: sp.get("method") ?? undefined,
  });
  return NextResponse.json({ data: expenses });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const parsed = createExpenseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const expense = await createExpense(user!.id, parsed.data);
  return NextResponse.json({ data: expense }, { status: 201 });
}
