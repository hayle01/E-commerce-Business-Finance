"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendDay = { date: string; revenue: number; cogs: number; grossProfit: number; cashIn: number; cashOut: number };

export function DashboardCharts({ days, expensesByCategory }: { days: TrendDay[]; expensesByCategory: { name: string; value: number }[] }) {
  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Revenue vs COGS vs Gross Profit</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#111827" dot={false} />
              <Line type="monotone" dataKey="cogs" stroke="#9ca3af" dot={false} />
              <Line type="monotone" dataKey="grossProfit" stroke="#059669" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Expenses by category</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius={90} fill="#374151" />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="md:col-span-2">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Cash in vs cash out</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cashIn" fill="#059669" />
              <Bar dataKey="cashOut" fill="#b91c1c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
