import { requireUser } from "@/lib/api";
import { getSupplier, updateSupplier } from "@/lib/services/suppliers";
import { updateSupplierSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const supplier = await getSupplier(id);
  if (!supplier) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Supplier not found." } }, { status: 404 });
  return NextResponse.json({ data: supplier });
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;

  const parsed = updateSupplierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const supplier = await updateSupplier(id, parsed.data);
  return NextResponse.json({ data: supplier });
}
