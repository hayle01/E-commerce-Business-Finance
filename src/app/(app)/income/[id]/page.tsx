import { getOtherIncome } from "@/lib/services/income";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function IncomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const income = await getOtherIncome(id);
  if (!income) notFound();

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{income.category.name}</h1>
        <Link href="/income" className="text-sm text-neutral-500 underline">Back</Link>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-lg">
        <dt className="text-neutral-500">Amount</dt><dd>{formatMoney(income.amount)}</dd>
        <dt className="text-neutral-500">Date</dt><dd>{new Date(income.incomeDate).toLocaleDateString()}</dd>
        <dt className="text-neutral-500">Payment method</dt><dd>{income.paymentMethod}</dd>
        <dt className="text-neutral-500">Description</dt><dd>{income.description ?? "—"}</dd>
        <dt className="text-neutral-500">Created</dt><dd>{new Date(income.createdAt).toLocaleString()}</dd>
      </dl>
    </main>
  );
}
