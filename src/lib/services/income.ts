import { prisma } from "@/lib/db";
import type { createIncomeSchema, updateIncomeSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listOtherIncome(userId: string, filters: { from?: string; to?: string; categoryId?: string; method?: string }) {
  return prisma.otherIncome.findMany({
    where: {
      userId,
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.method ? { paymentMethod: filters.method as never } : {}),
      ...(filters.from || filters.to
        ? { incomeDate: { ...(filters.from ? { gte: new Date(filters.from) } : {}), ...(filters.to ? { lte: new Date(filters.to) } : {}) } }
        : {}),
    },
    include: { category: true },
    orderBy: { incomeDate: "desc" },
  });
}

export async function getOtherIncome(userId: string, id: string) {
  return prisma.otherIncome.findFirst({ where: { id, userId }, include: { category: true } });
}

export async function createOtherIncome(userId: string, input: z.infer<typeof createIncomeSchema>) {
  return prisma.otherIncome.create({ data: { ...input, userId } });
}

export async function updateOtherIncome(userId: string, id: string, input: z.infer<typeof updateIncomeSchema>) {
  const existing = await prisma.otherIncome.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Other income not found.");
  return prisma.otherIncome.update({ where: { id }, data: input });
}
