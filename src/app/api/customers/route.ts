import { requireUser } from "@/lib/api";
import { listCustomers, createCustomer } from "@/lib/services/customers";
import { createCustomerSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  return NextResponse.json({ data: await listCustomers(user!.id) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const parsed = createCustomerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const customer = await createCustomer(user!.id, parsed.data);
  return NextResponse.json({ data: customer }, { status: 201 });
}
