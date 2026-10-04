import { listOtherIncome } from "@/lib/services/income";
import { prisma } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { getSessionUser } from "@/lib/api";
import Link from "next/link";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; categoryId?: string; method?: string }>;
}) {
  const filters = await searchParams;
  const user = (await getSessionUser())!;
  const [income, categories] = await Promise.all([
    listOtherIncome(user.id, filters),
    prisma.category.findMany({ where: { type: "INCOME" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Other income</h1>
        <Link href="/income/new" className="btn-primary text-sm px-3">Add income</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/income">
        <input type="date" name="from" defaultValue={filters.from} className="btn-secondary" />
        <input type="date" name="to" defaultValue={filters.to} className="btn-secondary" />
        <select name="categoryId" defaultValue={filters.categoryId ?? ""} className="btn-secondary">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="method" defaultValue={filters.method ?? ""} className="btn-secondary">
          <option value="">All methods</option>
          {["CASH", "BANK", "MOBILE_MONEY", "OTHER"].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>

      {income.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium">No other income yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Record freelance, gifts, commission and side work.</p>
          <Link href="/income/new" className="mt-4 inline-block btn-primary">Add income</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Kind</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 text-right font-medium">Amount</th>
                  <th className="py-2 font-medium">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {income.map((i) => (
                  <tr key={i.id} className="border-b border-border hover:bg-accent">
                    <td className="py-2 pr-4">{formatDate(i.incomeDate)}</td>
                    <td className="py-2 pr-4"><Link href={`/income/${i.id}`} className="font-medium">{i.category.name}</Link></td>
                    <td className="py-2 pr-4 text-muted-foreground">{i.incomeKind === "PERSONAL" ? "Personal" : "Business"}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{i.description ?? "—"}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(i.amount)}</td>
                    <td className="py-2 text-muted-foreground">{i.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {income.map((i) => (
              <li key={i.id}>
                <Link href={`/income/${i.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{i.category.name}</p>
                    <p className="text-sm text-muted-foreground">{i.incomeKind === "PERSONAL" ? "Personal" : "Business"} · {formatDate(i.incomeDate)}</p>
                    {i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}
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
