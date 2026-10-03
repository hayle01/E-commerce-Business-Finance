import { prisma } from "@/lib/db";
import { RecurringForm } from "@/components/forms/recurring-form";

export default async function NewRecurringPage() {
  const categories = await prisma.category.findMany({ where: { type: "EXPENSE", isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">New recurring obligation</h1>
      <RecurringForm categories={categories.map((c) => ({ id: c.id, name: c.name, expenseKind: c.expenseKind }))} />
    </main>
  );
}
