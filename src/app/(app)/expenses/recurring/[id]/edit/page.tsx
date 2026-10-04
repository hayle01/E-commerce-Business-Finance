import { prisma } from "@/lib/db";
import { RecurringForm } from "@/components/forms/recurring-form";
import { getRecurring } from "@/lib/services/recurring";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/api";

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const template = await getRecurring(user.id, id);
  if (!template) notFound();
  const categories = await prisma.category.findMany({ where: { type: "EXPENSE", isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">Edit recurring obligation</h1>
      <RecurringForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, expenseKind: c.expenseKind }))}
        editId={template.id}
        initial={{
          name: template.name,
          categoryId: template.categoryId,
          amount: template.amount.toString(),
          frequency: template.frequency,
          nextDueDate: template.nextDueDate.toISOString().slice(0, 10),
          dayOfMonth: template.dayOfMonth ? String(template.dayOfMonth) : "",
          notes: template.notes ?? "",
        }}
      />
    </main>
  );
}
