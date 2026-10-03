import { listRecurring } from "@/lib/services/recurring";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { RecordRecurringButton } from "@/components/record-recurring-button";

export default async function RecurringPage() {
  const templates = await listRecurring();

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recurring obligations</h1>
        <Link href="/expenses/recurring/new" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">Add template</Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No recurring obligations yet</p>
          <p className="mt-1 text-sm text-neutral-500">Track rent-like monthly fees, subscriptions and similar costs.</p>
          <Link href="/expenses/recurring/new" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Add template</Link>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatMoney(t.amount)} {t.frequency.toLowerCase()} · {t.category.name} · due {new Date(t.nextDueDate).toLocaleDateString()}
                  {!t.isActive && " · inactive"}
                </p>
              </div>
              <RecordRecurringButton id={t.id} active={t.isActive} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
