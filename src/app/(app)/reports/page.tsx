import { endOfDay, getFinancialSummary, getReportBreakdowns, startOfDay } from "@/lib/services/reporting";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { DateRangePicker } from "@/components/date-range-picker";
import { getSessionUser } from "@/lib/api";

type Preset = "today" | "week" | "month" | "lastMonth" | "custom";

function rangeFromParams(preset: Preset | undefined, from?: string, to?: string) {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "week": {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
      return { from: start, to: endOfDay(now), label: "This week" };
    }
    case "lastMonth": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(first), to: endOfDay(last), label: "Last month" };
    }
    case "custom":
      if (from && to) return { from: startOfDay(new Date(from)), to: endOfDay(new Date(to)), label: `${from} → ${to}` };
      // fall through
    default:
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
        label: "This month",
      };
  }
}

function BreakdownList({ title, rows }: { title: string; rows: { name: string; value: number }[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No data.</p>
      ) : (
        <ul className="mt-1 divide-y divide-border text-sm">
          {rows.map((r) => (
            <li key={r.name} className="flex justify-between py-1.5">
              <span>{r.name}</span>
              <span>{formatMoney(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: Preset; from?: string; to?: string }>;
}) {
  const { preset, from, to } = await searchParams;
  const range = rangeFromParams(preset, from, to);

  const user = (await getSessionUser())!;
  const [summary, breakdowns] = await Promise.all([
    getFinancialSummary(user.id, range),
    getReportBreakdowns(user.id, range),
  ]);

  const rows: { label: string; value: number; kind: string }[] = [
    { label: "Sales Revenue", value: summary.revenue, kind: "Earned" },
    { label: "COGS", value: summary.cogs, kind: "Earned" },
    { label: "Gross Profit", value: summary.grossProfit, kind: "Earned" },
    { label: "Business Expenses", value: summary.businessExpenses, kind: "Cash paid (by expense date)" },
    { label: "Other Business Income", value: summary.otherBusinessIncome, kind: "Cash received" },
    { label: "Net Profit", value: summary.netProfit, kind: "Earned" },
    { label: "Personal Expenses", value: summary.personalExpenses, kind: "Cash paid" },
    { label: "Other Personal Income", value: summary.otherPersonalIncome, kind: "Cash received" },
    { label: "Net Available Income", value: summary.netAvailableIncome, kind: "Earned" },
    { label: "Cash In", value: summary.cashIn, kind: "Actual cash" },
    { label: "Cash Out", value: summary.cashOut, kind: "Actual cash" },
    { label: "Net Cash Flow", value: summary.netCashFlow, kind: "Actual cash" },
    { label: "Supplier Outstanding", value: summary.supplierOutstanding, kind: "Current balance" },
  ];

  const presets: [string, string][] = [
    ["today", "Today"],
    ["week", "This week"],
    ["month", "This month"],
    ["lastMonth", "Last month"],
  ];

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <span className="text-sm text-muted-foreground">{range.label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {presets.map(([key, label]) => (
          <Link key={key} href={`/reports?preset=${key}`} className="btn-secondary">{label}</Link>
        ))}
        <DateRangePicker basePath="/reports" />
      </div>

      <table className="mt-6 w-full max-w-2xl border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 font-medium">Figure</th>
            <th className="py-2 text-right font-medium">Amount</th>
            <th className="py-2 pl-4 font-medium">Basis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border">
              <td className="py-2">{r.label}</td>
              <td className="py-2 text-right">{formatMoney(r.value)}</td>
              <td className="py-2 pl-4 text-muted-foreground">{r.kind}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <BreakdownList title="Revenue by day" rows={breakdowns.revenueByDay} />
        <BreakdownList title="Revenue by product" rows={breakdowns.revenueByProduct} />
        <BreakdownList title="Revenue by category" rows={breakdowns.revenueByCategory} />
        <BreakdownList title="Revenue by supplier" rows={breakdowns.revenueBySupplier} />
        <BreakdownList title="Profit by day" rows={breakdowns.profitByDay} />
        <BreakdownList title="Profit by product" rows={breakdowns.profitByProduct} />
        <BreakdownList title="Profit by supplier" rows={breakdowns.profitBySupplier} />
        <BreakdownList title="Expenses by category" rows={breakdowns.expensesByCategory} />
        <BreakdownList title="Expenses by day" rows={breakdowns.expensesByDay} />
        <BreakdownList title="Expenses: business vs personal" rows={breakdowns.expensesByKind} />
        <BreakdownList title="Other income by category" rows={breakdowns.incomeByCategory} />
        <BreakdownList title="Other income by day" rows={breakdowns.incomeByDay} />
      </div>

      <section className="mt-8 max-w-md">
        <h3 className="text-sm font-semibold text-foreground">Supplier liabilities</h3>
        <dl className="mt-1 grid grid-cols-2 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Opening unpaid</dt><dd className="text-right">{formatMoney(breakdowns.supplierLiabilities.opening)}</dd>
          <dt className="text-muted-foreground">New payables</dt><dd className="text-right">{formatMoney(breakdowns.supplierLiabilities.newPayables)}</dd>
          <dt className="text-muted-foreground">Payments made</dt><dd className="text-right">{formatMoney(breakdowns.supplierLiabilities.paymentsMade)}</dd>
          <dt className="text-muted-foreground">Closing unpaid</dt><dd className="text-right font-medium">{formatMoney(breakdowns.supplierLiabilities.closing)}</dd>
        </dl>
      </section>
    </main>
  );
}
