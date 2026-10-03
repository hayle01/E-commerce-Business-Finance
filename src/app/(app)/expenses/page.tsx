import { listExpenses } from "@/lib/services/expenses";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; categoryId?: string; expenseKind?: string; method?: string }>;
}) {
  const filters = await searchParams;
  const [expenses, categories] = await Promise.all([
    listExpenses(filters),
    prisma.category.findMany({ where: { type: "EXPENSE" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <div className="flex gap-2">
          <Link href="/expenses/recurring" className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Recurring</Link>
          <Link href="/expenses/new" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">Add expense</Link>
        </div>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/expenses">
        <input type="date" name="from" defaultValue={filters.from} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <input type="date" name="to" defaultValue={filters.to} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <select name="categoryId" defaultValue={filters.categoryId ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="expenseKind" defaultValue={filters.expenseKind ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">Business & personal</option>
          <option value="BUSINESS">Business</option>
          <option value="PERSONAL">Personal</option>
        </select>
        <select name="method" defaultValue={filters.method ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All methods</option>
          {["CASH", "BANK", "MOBILE_MONEY", "OTHER"].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Filter</button>
      </form>

      {expenses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No expenses yet</p>
          <p className="mt-1 text-sm text-neutral-500">Track business costs and personal spending separately.</p>
          <Link href="/expenses/new" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Add expense</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 text-right font-medium">Amount</th>
                  <th className="py-2 font-medium">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 pr-4">{new Date(e.expenseDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4"><Link href={`/expenses/${e.id}`} className="font-medium">{e.category.name}</Link></td>
                    <td className="py-2 pr-4 text-neutral-600">{e.description ?? "—"}</td>
                    <td className="py-2 pr-4 text-neutral-600">{e.category.expenseKind ?? "—"}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(e.amount)}</td>
                    <td className="py-2 text-neutral-600">{e.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-neutral-100 md:hidden">
            {expenses.map((e) => (
              <li key={e.id}>
                <Link href={`/expenses/${e.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{e.category.name}</p>
                    <p className="text-sm text-neutral-500">{e.category.expenseKind === "PERSONAL" ? "Personal" : "Business"} · {new Date(e.expenseDate).toLocaleDateString()}</p>
                    {e.description && <p className="text-sm text-neutral-600">{e.description}</p>}
                  </div>
                  <p className="font-medium">-{formatMoney(e.amount)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
