import { prisma } from "@/lib/db";
import type { createExpenseSchema, updateExpenseSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listExpenses(filters: { from?: string; to?: string; categoryId?: string; expenseKind?: string; method?: string }) {
  return prisma.expense.findMany({
    where: {
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.method ? { paymentMethod: filters.method as never } : {}),
      ...(filters.expenseKind ? { category: { expenseKind: filters.expenseKind as never } } : {}),
      ...(filters.from || filters.to
        ? { expenseDate: { ...(filters.from ? { gte: new Date(filters.from) } : {}), ...(filters.to ? { lte: new Date(filters.to) } : {}) } }
        : {}),
    },
    include: { category: true },
    orderBy: { expenseDate: "desc" },
  });
}

export async function getExpense(id: string) {
  return prisma.expense.findUnique({ where: { id }, include: { category: true, recurringTemplate: true } });
}

export async function createExpense(input: z.infer<typeof createExpenseSchema>) {
  return prisma.expense.create({ data: input });
}

export async function updateExpense(id: string, input: z.infer<typeof updateExpenseSchema>) {
  return prisma.expense.update({ where: { id }, data: input });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({ where: { id } });
}
