import { prisma } from "@/lib/db";
import { IncomeForm } from "@/components/forms/income-form";
import { getOtherIncome } from "@/lib/services/income";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/api";

export default async function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const income = await getOtherIncome(user.id, id);
  if (!income) notFound();
  const categories = await prisma.category.findMany({ where: { type: "INCOME", isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">Edit other income</h1>
      <IncomeForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        editId={income.id}
        initial={{
          categoryId: income.categoryId,
          incomeKind: income.incomeKind,
          amount: income.amount.toString(),
          incomeDate: income.incomeDate.toISOString().slice(0, 10),
          description: income.description ?? "",
          paymentMethod: income.paymentMethod,
        }}
      />
    </main>
  );
}
