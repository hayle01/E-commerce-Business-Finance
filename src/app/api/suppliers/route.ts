import { requireUser } from "@/lib/api";
import { createSupplier, listSuppliers } from "@/lib/services/suppliers";
import { createSupplierSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  const suppliers = await listSuppliers();
  return NextResponse.json({ data: suppliers });
}

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const parsed = createSupplierSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const supplier = await createSupplier(parsed.data);
  return NextResponse.json({ data: supplier }, { status: 201 });
}
