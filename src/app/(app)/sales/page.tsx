import { listSales } from "@/lib/services/sales";
import { formatMoney, formatDate } from "@/lib/format";
import Link from "next/link";
import { ClickableRow } from "@/components/clickable-row";
import { getSessionUser } from "@/lib/api";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; paymentStatus?: string }>;
}) {
  const filters = await searchParams;
  const user = (await getSessionUser())!;
  const sales = await listSales(user.id, filters);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales</h1>
        <Link href="/sales/new" className="btn-primary text-sm px-3">Record sale</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/sales">
        <input name="q" defaultValue={filters.q} placeholder="Search order or customer" className="btn-secondary" />
        <select name="status" defaultValue={filters.status ?? ""} className="btn-secondary">
          <option value="">All statuses</option>
          {["DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED", "RETURNED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={filters.paymentStatus ?? ""} className="btn-secondary">
          <option value="">All payments</option>
          {["UNPAID", "PARTIAL", "PAID", "REFUNDED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>

      {sales.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium">No sales yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Record your first sale to start tracking revenue and profit.</p>
          <Link href="/sales/new" className="mt-4 inline-block btn-primary">Record sale</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
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
                    <ClickableRow key={sale.id} href={`/sales/${sale.id}`}>
                      <td className="py-2 pr-4"><Link href={`/sales/${sale.id}`} className="font-medium">{sale.orderNumber}</Link></td>
                      <td className="py-2 pr-4 text-muted-foreground">{sale.customer?.name ?? "—"}</td>
                      <td className="py-2 pr-4 text-right">{sale._count.lines}</td>
                      <td className="py-2 pr-4 text-right">{formatMoney(sale.total)}</td>
                      <td className="py-2 pr-4 text-right">{formatMoney(profit)}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{sale.paymentStatus}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{sale.status}</td>
                      <td className="py-2 text-muted-foreground">{formatDate(sale.saleDate)}</td>
                    </ClickableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {sales.map((sale) => {
              const revenue = sale.lines.reduce((s, l) => s + Number(l.lineRevenue), 0);
              const profit = revenue - sale.lines.reduce((s, l) => s + Number(l.lineCOGS), 0);
              return (
                <li key={sale.id}>
                  <Link href={`/sales/${sale.id}`} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{sale.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{sale.customer?.name ?? "—"} · {sale._count.lines} items</p>
                      <p className="text-sm text-muted-foreground">{sale.status} · {sale.paymentStatus}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatMoney(sale.total)}</p>
                      <p className="text-sm text-muted-foreground">profit {formatMoney(profit)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.saleDate)}</p>
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
