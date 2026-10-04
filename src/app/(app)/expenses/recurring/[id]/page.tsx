import { getRecurring, recurringStatus } from "@/lib/services/recurring";
import { formatMoney, formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecordRecurringButton } from "@/components/record-recurring-button";
import { RecurringDetailActions } from "@/components/recurring-detail-actions";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/api";

export default async function RecurringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const template = await getRecurring(user.id, id);
  if (!template) notFound();
  const status = recurringStatus(template);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{template.name}</h1>
        <Link href="/expenses/recurring" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      <div className="mb-4">
        <Link href={`/expenses/recurring/${template.id}/edit`} className="btn-secondary inline-block">Edit</Link>
      </div>

      <Badge
        label={status === "due" ? "Due today" : status === "overdue" ? "Overdue" : status === "inactive" ? "Inactive" : "Upcoming"}
        variant={status === "due" ? "warning" : status === "overdue" ? "danger" : status === "inactive" ? "muted" : "success"}
      />

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-lg">
        <dt className="text-neutral-500">Amount</dt><dd>{formatMoney(template.amount)}</dd>
        <dt className="text-neutral-500">Frequency</dt><dd>{template.frequency}</dd>
        <dt className="text-neutral-500">Category</dt><dd>{template.category.name}</dd>
        <dt className="text-neutral-500">Next due date</dt><dd>{formatDate(template.nextDueDate)}</dd>
        <dt className="text-neutral-500">Notes</dt><dd>{template.notes ?? "—"}</dd>
      </dl>

      <div className="mt-6 flex items-center gap-3">
        <RecordRecurringButton id={template.id} active={template.isActive} />
        <RecurringDetailActions id={template.id} isActive={template.isActive} />
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Recently recorded expenses</h2>
        {template.expenses.length === 0 ? (
          <p className="text-sm text-neutral-500">No expenses recorded from this template yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {template.expenses.map((e) => (
              <li key={e.id} className="flex justify-between py-2 text-sm">
                <Link href={`/expenses/${e.id}`}>{formatDate(e.expenseDate)}</Link>
                <span>{formatMoney(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
