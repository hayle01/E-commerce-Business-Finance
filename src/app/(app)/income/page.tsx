import { listOtherIncome } from "@/lib/services/income";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; categoryId?: string; method?: string }>;
}) {
  const filters = await searchParams;
  const [income, categories] = await Promise.all([
    listOtherIncome(filters),
    prisma.category.findMany({ where: { type: "INCOME" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Other income</h1>
        <Link href="/income/new" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">Add income</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/income">
        <input type="date" name="from" defaultValue={filters.from} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <input type="date" name="to" defaultValue={filters.to} className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <select name="categoryId" defaultValue={filters.categoryId ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="method" defaultValue={filters.method ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All methods</option>
          {["CASH", "BANK", "MOBILE_MONEY", "OTHER"].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Filter</button>
      </form>

      {income.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No other income yet</p>
          <p className="mt-1 text-sm text-neutral-500">Record freelance, gifts, commission and side work.</p>
          <Link href="/income/new" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Add income</Link>
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
                  <th className="py-2 pr-4 text-right font-medium">Amount</th>
                  <th className="py-2 font-medium">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {income.map((i) => (
                  <tr key={i.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 pr-4">{new Date(i.incomeDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4"><Link href={`/income/${i.id}`} className="font-medium">{i.category.name}</Link></td>
                    <td className="py-2 pr-4 text-neutral-600">{i.description ?? "—"}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(i.amount)}</td>
                    <td className="py-2 text-neutral-600">{i.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-neutral-100 md:hidden">
            {income.map((i) => (
              <li key={i.id}>
                <Link href={`/income/${i.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{i.category.name}</p>
                    <p className="text-sm text-neutral-500">{new Date(i.incomeDate).toLocaleDateString()}</p>
                    {i.description && <p className="text-sm text-neutral-600">{i.description}</p>}
                  </div>
                  <p className="font-medium">+{formatMoney(i.amount)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
