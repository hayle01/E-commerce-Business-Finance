import Link from "next/link";
import { endOfDay, getFinancialSummary, getTrends, startOfDay } from "@/lib/services/reporting";
import { formatMoney } from "@/lib/format";
import { prisma } from "@/lib/db";
import { DashboardCharts } from "@/components/charts/dashboard-charts";

function rangeFromParams(preset: string | undefined, from?: string, to?: string) {
  const now = new Date();
  if (preset === "today") return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
  if (preset === "week") {
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
    return { from: start, to: endOfDay(now), label: "Last 7 days" };
  }
  if (preset === "custom" && from && to) {
    return { from: startOfDay(new Date(from)), to: endOfDay(new Date(to)), label: `${from} → ${to}` };
  }
  return {
    from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: endOfDay(now),
    label: "This month",
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const { preset, from, to } = await searchParams;
  const range = rangeFromParams(preset, from, to);

  const [summary, trends, recentSales, recentExpenses] = await Promise.all([
    getFinancialSummary(range),
    getTrends(range),
    prisma.sale.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.expense.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const kpis: [string, number][] = [
    ["Revenue", summary.revenue],
    ["Gross Profit", summary.grossProfit],
    ["Net Profit", summary.netProfit],
    ["Personal Expenses", summary.personalExpenses],
    ["Net Available Income", summary.netAvailableIncome],
    ["Net Cash Flow", summary.netCashFlow],
  ];

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <span className="text-sm text-neutral-500">{range.label}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard?preset=today" className="rounded-md border border-neutral-300 px-3 py-1.5">Today</Link>
        <Link href="/dashboard?preset=week" className="rounded-md border border-neutral-300 px-3 py-1.5">Last 7 days</Link>
        <Link href="/dashboard?preset=month" className="rounded-md border border-neutral-300 px-3 py-1.5">This month</Link>
        <Link href="/dashboard?preset=custom&from=2026-01-01&to=2026-12-31" className="rounded-md border border-neutral-300 px-3 py-1.5">Custom</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 divide-x divide-y divide-neutral-200 border border-neutral-200 md:grid-cols-3">
        {kpis.map(([label, value]) => (
          <div key={label} className="p-4">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-lg font-semibold">{formatMoney(value)}</p>
          </div>
        ))}
      </div>

      <DashboardCharts days={trends.days} expensesByCategory={trends.expensesByCategory} />

      <section className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">Recent sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-sm text-neutral-500">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentSales.map((sale) => (
                <li key={sale.id}>
                  <Link href={`/sales/${sale.id}`} className="flex justify-between py-2 text-sm">
                    <span>{sale.orderNumber} · {sale.customer?.name ?? "Walk-in"}</span>
                    <span>{formatMoney(sale.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">Recent expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-neutral-500">No expenses yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentExpenses.map((e) => (
                <li key={e.id}>
                  <Link href={`/expenses/${e.id}`} className="flex justify-between py-2 text-sm">
                    <span>{e.category.name}</span>
                    <span>{formatMoney(e.amount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
