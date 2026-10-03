import { prisma } from "@/lib/db";
import type { createIncomeSchema, updateIncomeSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listOtherIncome(filters: { from?: string; to?: string; categoryId?: string; method?: string }) {
  return prisma.otherIncome.findMany({
    where: {
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

export async function getOtherIncome(id: string) {
  return prisma.otherIncome.findUnique({ where: { id }, include: { category: true } });
}

export async function createOtherIncome(input: z.infer<typeof createIncomeSchema>) {
  return prisma.otherIncome.create({ data: input });
}

export async function updateOtherIncome(id: string, input: z.infer<typeof updateIncomeSchema>) {
  return prisma.otherIncome.update({ where: { id }, data: input });
}
