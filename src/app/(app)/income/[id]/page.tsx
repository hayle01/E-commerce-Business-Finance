import { getOtherIncome } from "@/lib/services/income";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/api";

export default async function IncomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const income = await getOtherIncome(user.id, id);
  if (!income) notFound();

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{income.category.name}</h1>
        <Link href="/income" className="text-sm text-muted-foreground underline">Back</Link>
      </div>
      <div className="mb-4">
        <Link href={`/income/${income.id}/edit`} className="btn-secondary inline-block">Edit</Link>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-lg">
        <dt className="text-muted-foreground">Kind</dt><dd>{income.incomeKind === "PERSONAL" ? "Personal" : "Business"}</dd>
        <dt className="text-muted-foreground">Amount</dt><dd>{formatMoney(income.amount)}</dd>
        <dt className="text-muted-foreground">Date</dt><dd>{formatDate(income.incomeDate)}</dd>
        <dt className="text-muted-foreground">Payment method</dt><dd>{income.paymentMethod}</dd>
        <dt className="text-muted-foreground">Description</dt><dd>{income.description ?? "—"}</dd>
        <dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(income.createdAt)}</dd>
      </dl>
    </main>
  );
}
