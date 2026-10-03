import { requireUser } from "@/lib/api";
import { createRecurring, listRecurring } from "@/lib/services/recurring";
import { createRecurringSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireUser();
  if (response) return response;
  return NextResponse.json({ data: await listRecurring() });
}

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const parsed = createRecurringSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const template = await createRecurring(parsed.data);
  return NextResponse.json({ data: template }, { status: 201 });
}
