import { requireUser } from "@/lib/api";
import { createOtherIncome, listOtherIncome } from "@/lib/services/income";
import { createIncomeSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const sp = request.nextUrl.searchParams;
  const income = await listOtherIncome({
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    method: sp.get("method") ?? undefined,
  });
  return NextResponse.json({ data: income });
}

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const parsed = createIncomeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const income = await createOtherIncome(parsed.data);
  return NextResponse.json({ data: income }, { status: 201 });
}
