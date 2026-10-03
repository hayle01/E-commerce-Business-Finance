import { prisma } from "@/lib/db";
import { ExpenseForm } from "@/components/forms/expense-form";

export default async function NewExpensePage() {
  const categories = await prisma.category.findMany({
    where: { type: "EXPENSE", isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">New expense</h1>
      <ExpenseForm categories={categories.map((c) => ({ id: c.id, name: c.name, expenseKind: c.expenseKind }))} />
    </main>
  );
}
