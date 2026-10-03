import { prisma } from "@/lib/db";
import { addMonths, addWeeks, addYears } from "date-fns";
import type { createRecurringSchema, updateRecurringSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listRecurring() {
  return prisma.recurringExpenseTemplate.findMany({
    include: { category: true },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function getRecurring(id: string) {
  return prisma.recurringExpenseTemplate.findUnique({ where: { id }, include: { category: true, expenses: { orderBy: { expenseDate: "desc" }, take: 20 } } });
}

export async function createRecurring(input: z.infer<typeof createRecurringSchema>) {
  return prisma.recurringExpenseTemplate.create({ data: input });
}

export async function updateRecurring(id: string, input: z.infer<typeof updateRecurringSchema>) {
  return prisma.recurringExpenseTemplate.update({ where: { id }, data: input });
}

export function advanceDueDate(from: Date, frequency: "MONTHLY" | "WEEKLY" | "YEARLY"): Date {
  if (frequency === "WEEKLY") return addWeeks(from, 1);
  if (frequency === "YEARLY") return addYears(from, 1);
  return addMonths(from, 1);
}

export async function recordRecurringExpense(id: string) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.recurringExpenseTemplate.findUniqueOrThrow({ where: { id } });
    if (!template.isActive) throw new Error("This recurring obligation is inactive.");
    const expense = await tx.expense.create({
      data: {
        categoryId: template.categoryId,
        amount: template.amount,
        expenseDate: template.nextDueDate,
        description: template.name,
        paymentMethod: "OTHER",
        recurringTemplateId: template.id,
      },
    });
    await tx.recurringExpenseTemplate.update({
      where: { id },
      data: { nextDueDate: advanceDueDate(template.nextDueDate, template.frequency) },
    });
    return expense;
  });
}
