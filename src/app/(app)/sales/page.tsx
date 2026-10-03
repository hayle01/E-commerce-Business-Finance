import { listSales } from "@/lib/services/sales";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; paymentStatus?: string }>;
}) {
  const filters = await searchParams;
  const sales = await listSales(filters);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales</h1>
        <Link href="/sales/new" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">Record sale</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/sales">
        <input name="q" defaultValue={filters.q} placeholder="Search order or customer" className="rounded-md border border-neutral-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue={filters.status ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED", "RETURNED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={filters.paymentStatus ?? ""} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">All payments</option>
          {["UNPAID", "PARTIAL", "PAID", "REFUNDED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Filter</button>
      </form>

      {sales.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No sales yet</p>
          <p className="mt-1 text-sm text-neutral-500">Record your first sale to start tracking revenue and profit.</p>
          <Link href="/sales/new" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Record sale</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Order</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 text-right font-medium">Items</th>
                  <th className="py-2 pr-4 text-right font-medium">Revenue</th>
                  <th className="py-2 pr-4 text-right font-medium">Profit</th>
                  <th className="py-2 pr-4 font-medium">Payment</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const revenue = sale.lines.reduce((s, l) => s + Number(l.lineRevenue), 0);
                  const profit = revenue - sale.lines.reduce((s, l) => s + Number(l.lineCOGS), 0);
                  return (
                    <tr key={sale.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-2 pr-4"><Link href={`/sales/${sale.id}`} className="font-medium">{sale.orderNumber}</Link></td>
                      <td className="py-2 pr-4 text-neutral-600">{sale.customer?.name ?? "—"}</td>
                      <td className="py-2 pr-4 text-right">{sale._count.lines}</td>
                      <td className="py-2 pr-4 text-right">{formatMoney(sale.total)}</td>
                      <td className="py-2 pr-4 text-right">{formatMoney(profit)}</td>
                      <td className="py-2 pr-4 text-neutral-600">{sale.paymentStatus}</td>
                      <td className="py-2 pr-4 text-neutral-600">{sale.status}</td>
                      <td className="py-2 text-neutral-600">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-neutral-100 md:hidden">
            {sales.map((sale) => {
              const revenue = sale.lines.reduce((s, l) => s + Number(l.lineRevenue), 0);
              const profit = revenue - sale.lines.reduce((s, l) => s + Number(l.lineCOGS), 0);
              return (
                <li key={sale.id}>
                  <Link href={`/sales/${sale.id}`} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{sale.orderNumber}</p>
                      <p className="text-sm text-neutral-500">{sale.customer?.name ?? "—"} · {sale._count.lines} items</p>
                      <p className="text-sm text-neutral-600">{sale.status} · {sale.paymentStatus}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatMoney(sale.total)}</p>
                      <p className="text-sm text-neutral-500">profit {formatMoney(profit)}</p>
                      <p className="text-xs text-neutral-400">{new Date(sale.saleDate).toLocaleDateString()}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
