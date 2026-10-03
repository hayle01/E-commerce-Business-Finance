import { prisma } from "@/lib/db";
import { IncomeForm } from "@/components/forms/income-form";

export default async function NewIncomePage() {
  const categories = await prisma.category.findMany({ where: { type: "INCOME", isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">New other income</h1>
      <IncomeForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </main>
  );
}
