import { prisma } from "@/lib/db";
import { addMonths, addWeeks, addYears } from "date-fns";
import type { createRecurringSchema, updateRecurringSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listRecurring(userId: string) {
  return prisma.recurringExpenseTemplate.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { nextDueDate: "asc" },
  });
}

export async function getRecurring(userId: string, id: string) {
  return prisma.recurringExpenseTemplate.findFirst({ where: { id, userId }, include: { category: true, expenses: { orderBy: { expenseDate: "desc" }, take: 20 } } });
}

export async function createRecurring(userId: string, input: z.infer<typeof createRecurringSchema>) {
  return prisma.recurringExpenseTemplate.create({ data: { ...input, userId } });
}

export async function updateRecurring(userId: string, id: string, input: z.infer<typeof updateRecurringSchema>) {
  const existing = await prisma.recurringExpenseTemplate.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Recurring template not found.");
  return prisma.recurringExpenseTemplate.update({ where: { id }, data: input });
}

export function advanceDueDate(from: Date, frequency: "MONTHLY" | "WEEKLY" | "YEARLY"): Date {
  if (frequency === "WEEKLY") return addWeeks(from, 1);
  if (frequency === "YEARLY") return addYears(from, 1);
  return addMonths(from, 1);
}

export async function recordRecurringExpense(userId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.recurringExpenseTemplate.findFirst({ where: { id, userId } });
    if (!template) throw new Error("Recurring template not found.");
    if (!template.isActive) throw new Error("This recurring obligation is inactive.");
    const expense = await tx.expense.create({
      data: {
        userId,
        categoryId: template.categoryId,
        amount: template.amount,
        // Stamp with the day the owner actually pays it, not the template's due date.
        expenseDate: new Date(),
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

export function recurringStatus(template: { isActive: boolean; nextDueDate: Date }): "inactive" | "overdue" | "due" | "upcoming" {
  if (!template.isActive) return "inactive";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(template.nextDueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "due";
  return "upcoming";
}
