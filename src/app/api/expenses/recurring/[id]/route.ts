import { requireUser } from "@/lib/api";
import { updateRecurring } from "@/lib/services/recurring";
import { updateRecurringSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = updateRecurringSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const template = await updateRecurring(user!.id, id, parsed.data);
  return NextResponse.json({ data: template });
}
