"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EXPENSE_COLORS = ["#111827", "#059669", "#b45309", "#7c3aed", "#dc2626", "#2563eb", "#64748b", "#0d9488"];

type TrendDay = { date: string; revenue: number; cogs: number; grossProfit: number; cashIn: number; cashOut: number };

function ChartEmpty() {
  return (
    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
      No data for this period.
    </div>
  );
}

export function DashboardCharts({ days, expensesByCategory }: { days: TrendDay[]; expensesByCategory: { name: string; value: number }[] }) {
  const hasEarned = days.some((d) => d.revenue !== 0 || d.cogs !== 0 || d.grossProfit !== 0);
  const hasCash = days.some((d) => d.cashIn !== 0 || d.cashOut !== 0);
  const hasExpenses = expensesByCategory.length > 0;

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Revenue vs COGS vs Gross Profit</h2>
        <div className="h-64 w-full">
          {hasEarned ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#111827" barSize={14} />
              <Bar dataKey="cogs" fill="#9ca3af" barSize={14} />
              <Line type="monotone" dataKey="grossProfit" stroke="#059669" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmpty />
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Expenses by category</h2>
        <div className="h-64 w-full">
          {hasExpenses ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius={90}>
                {expensesByCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmpty />
          )}
        </div>
      </section>

      <section className="md:col-span-2">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Cash in vs cash out</h2>
        <div className="h-64 w-full">
          {hasCash ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cashIn" fill="#059669" barSize={6} />
              <Bar dataKey="cashOut" fill="#b91c1c" barSize={6} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <ChartEmpty />
          )}
        </div>
      </section>
    </div>
  );
}
