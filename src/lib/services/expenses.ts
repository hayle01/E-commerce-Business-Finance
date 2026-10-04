import { prisma } from "@/lib/db";
import type { createExpenseSchema, updateExpenseSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listExpenses(userId: string, filters: { from?: string; to?: string; categoryId?: string; expenseKind?: string; method?: string }) {
  return prisma.expense.findMany({
    where: {
      userId,
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

export async function getExpense(userId: string, id: string) {
  return prisma.expense.findFirst({ where: { id, userId }, include: { category: true, recurringTemplate: true } });
}

export async function createExpense(userId: string, input: z.infer<typeof createExpenseSchema>) {
  return prisma.expense.create({ data: { ...input, userId } });
}

export async function updateExpense(userId: string, id: string, input: z.infer<typeof updateExpenseSchema>) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Expense not found.");
  return prisma.expense.update({ where: { id }, data: input });
}

export async function deleteExpense(userId: string, id: string) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Expense not found.");
  return prisma.expense.delete({ where: { id } });
}
