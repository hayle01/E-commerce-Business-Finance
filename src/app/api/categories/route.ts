import { requireUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createCategorySchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const type = request.nextUrl.searchParams.get("type");
  const categories = await prisma.category.findMany({
    where: type ? { type: type as "EXPENSE" | "INCOME" | "PRODUCT" } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;

  const parsed = createCategorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json({ data: category }, { status: 201 });
}
