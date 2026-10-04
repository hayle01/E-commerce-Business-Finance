import { requireUser } from "@/lib/api";
import { createSale, listSales } from "@/lib/services/sales";
import { createSaleSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const sp = request.nextUrl.searchParams;
  const sales = await listSales(user!.id, {
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    paymentStatus: sp.get("paymentStatus") ?? undefined,
  });
  return NextResponse.json({ data: sales });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;

  const parsed = createSaleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  try {
    const sale = await createSale(user!.id, parsed.data);
    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "BUSINESS_ERROR", message: err instanceof Error ? err.message : "Could not create the sale." } },
      { status: 400 }
    );
  }
}
