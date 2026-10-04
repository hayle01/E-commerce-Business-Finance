import { listRecurring, recurringStatus } from "@/lib/services/recurring";
import { formatMoney, formatDate } from "@/lib/format";
import Link from "next/link";
import { RecordRecurringButton } from "@/components/record-recurring-button";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/api";

export default async function RecurringPage() {
  const user = (await getSessionUser())!;
  const templates = await listRecurring(user.id);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recurring obligations</h1>
        <Link href="/expenses/recurring/new" className="btn-primary text-sm px-3">Add template</Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium">No recurring obligations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Track rent-like monthly fees, subscriptions and similar costs.</p>
          <Link href="/expenses/recurring/new" className="mt-4 inline-block btn-primary">Add template</Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {templates.map((t) => {
            const status = recurringStatus(t);
            return (
            <li key={t.id} className="flex items-center justify-between py-3">
              <Link href={`/expenses/recurring/${t.id}`} className="min-w-0 flex-1">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(t.amount)} {t.frequency.toLowerCase()} · {t.category.name} · due {formatDate(t.nextDueDate)}
                </p>
                <Badge
                  label={status === "due" ? "Due today" : status === "overdue" ? "Overdue" : status === "inactive" ? "Inactive" : "Upcoming"}
                  variant={status === "due" ? "warning" : status === "overdue" ? "danger" : status === "inactive" ? "muted" : "success"}
                />
              </Link>
              <RecordRecurringButton id={t.id} active={t.isActive} />
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
