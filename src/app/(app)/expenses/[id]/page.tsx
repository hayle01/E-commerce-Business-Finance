import { getExpense } from "@/lib/services/expenses";
import { formatMoney, formatDate, formatDateTime } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpenseDetailActions } from "@/components/expense-detail-actions";
import { getSessionUser } from "@/lib/api";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const expense = await getExpense(user.id, id);
  if (!expense) notFound();

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{expense.category.name}</h1>
        <Link href="/expenses" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-lg">
        <dt className="text-neutral-500">Amount</dt><dd>{formatMoney(expense.amount)}</dd>
        <dt className="text-neutral-500">Type</dt><dd>{expense.category.expenseKind ?? "—"}</dd>
        <dt className="text-neutral-500">Date</dt><dd>{formatDate(expense.expenseDate)}</dd>
        <dt className="text-neutral-500">Payment method</dt><dd>{expense.paymentMethod}</dd>
        <dt className="text-neutral-500">Description</dt><dd>{expense.description ?? "—"}</dd>
        <dt className="text-neutral-500">Recurring template</dt><dd>{expense.recurringTemplate?.name ?? "—"}</dd>
        <dt className="text-neutral-500">Created</dt><dd>{formatDateTime(expense.createdAt)}</dd>
        <dt className="text-neutral-500">Updated</dt><dd>{formatDateTime(expense.updatedAt)}</dd>
      </dl>

      <ExpenseDetailActions expenseId={expense.id} />
    </main>
  );
}
