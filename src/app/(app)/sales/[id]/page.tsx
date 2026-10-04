import { getSale } from "@/lib/services/sales";
import { formatMoney, formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaleActions } from "@/components/sale-actions";
import { Badge } from "@/components/ui/badge";
import { getSessionUser } from "@/lib/api";

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const sale = await getSale(user.id, id);
  if (!sale) notFound();

  const revenue = sale.lines.reduce((s, l) => s + Number(l.lineRevenue), 0);
  const cogs = sale.lines.reduce((s, l) => s + Number(l.lineCOGS), 0);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{sale.orderNumber}</h1>
        <Link href="/sales" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      {sale.status !== "CANCELLED" && sale.status !== "RETURNED" && (
        <div className="mb-4">
          <Link href={`/sales/${sale.id}/edit`} className="btn-secondary inline-block">Edit</Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
        <span>{formatDate(sale.saleDate)}</span>
        <Badge label={sale.status} variant={sale.status === "DELIVERED" ? "success" : sale.status === "CANCELLED" || sale.status === "RETURNED" ? "danger" : sale.status === "CONFIRMED" ? "warning" : "muted"} />
        <Badge label={sale.paymentStatus} variant={sale.paymentStatus === "PAID" ? "success" : sale.paymentStatus === "PARTIAL" ? "warning" : sale.paymentStatus === "REFUNDED" ? "danger" : "muted"} />
        <span>{sale.customer?.name ?? "Walk-in"}</span>
      </div>


      <SaleActions saleId={sale.id} status={sale.status} paymentStatus={sale.paymentStatus} payables={sale.lines
        .map((l) => l.supplierPayable)
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({ id: p.id, supplierName: p.supplier.name, amountDue: p.amountDue.toString(), amountPaid: p.amountPaid.toString(), status: p.status }))}
      />

      {/* Desktop line table */}
      <table className="mt-6 hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit cost</th>
            <th className="py-2 text-right font-medium">Unit price</th>
            <th className="py-2 text-right font-medium">Revenue</th>
            <th className="py-2 text-right font-medium">COGS</th>
            <th className="py-2 text-right font-medium">Profit</th>
          </tr>
        </thead>
        <tbody>
          {sale.lines.map((line) => (
            <tr key={line.id} className="border-b border-neutral-100">
              <td className="py-2">{line.itemNameSnapshot}</td>
              <td className="py-2 text-right">{line.quantity}</td>
              <td className="py-2 text-right">{formatMoney(line.unitCostSnapshot)}</td>
              <td className="py-2 text-right">{formatMoney(line.unitSellingPriceSnapshot)}</td>
              <td className="py-2 text-right">{formatMoney(line.lineRevenue)}</td>
              <td className="py-2 text-right">{formatMoney(line.lineCOGS)}</td>
              <td className="py-2 text-right">{formatMoney(line.lineProfit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile line list */}
      <ul className="mt-6 divide-y divide-neutral-100 md:hidden">
        {sale.lines.map((line) => (
          <li key={line.id} className="py-3 text-sm">
            <p className="font-medium">{line.itemNameSnapshot}</p>
            <p className="text-sm text-neutral-500">
              {line.quantity} × {formatMoney(line.unitSellingPriceSnapshot)} · cost {formatMoney(line.unitCostSnapshot)} ·{" "}
              <span className="text-emerald-700 font-medium">profit {formatMoney(line.lineProfit)}</span>
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-6 border-t border-neutral-200 pt-4 md:ml-auto md:w-96">
        <div className="flex items-end justify-between">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="text-3xl font-semibold tracking-tight">{formatMoney(sale.total)}</p>
        </div>
        <p className="mt-1 text-right text-sm text-neutral-500">
          Paid {formatMoney(sale.amountPaid)}
          {Number(sale.total) - Number(sale.amountPaid) > 0 && (
            <> · Due <span className="font-medium text-amber-700">{formatMoney(Number(sale.total) - Number(sale.amountPaid))}</span></>
          )}
        </p>

        <dl className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
          <div className="flex items-center justify-between py-2">
            <dt className="text-neutral-500">Revenue</dt>
            <dd>{formatMoney(sale.total)}</dd>
          </div>
          <div className="flex items-center justify-between py-2">
            <dt className="text-neutral-500">COGS</dt>
            <dd>{formatMoney(cogs)}</dd>
          </div>
          <div className="flex items-center justify-between py-2">
            <dt className="font-medium">Gross profit</dt>
            <dd className="font-medium text-emerald-700">{formatMoney(revenue - cogs)}</dd>
          </div>
          <div className="flex items-center justify-between py-2">
            <dt className="text-neutral-500">Amount paid</dt>
            <dd>{formatMoney(sale.amountPaid)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Payment history</h2>
        {sale.payments.length === 0 ? (
          <p className="text-sm text-neutral-500">No payments recorded.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {sale.payments.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{formatDate(p.paymentDate)} · {p.method}</span>
                <span>{formatMoney(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Supplier payables</h2>
        {sale.lines.every((l) => !l.supplierPayable) ? (
          <p className="text-sm text-neutral-500">No supplier payables yet — they are created when the sale is delivered.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {sale.lines.map((line) =>
              line.supplierPayable ? (
                <li key={line.supplierPayable.id} className="py-2">
                  <div className="flex justify-between">
                    <span>{line.supplierPayable.supplier.name}</span>
                    <span>{formatMoney(line.supplierPayable.amountPaid)} / {formatMoney(line.supplierPayable.amountDue)} · {line.supplierPayable.status}</span>
                  </div>
                  {line.supplierPayable.payments.length > 0 && (
                    <ul className="ml-4 mt-1 text-neutral-500">
                      {line.supplierPayable.payments.map((p) => (
                        <li key={p.id} className="flex justify-between">
                          <span>{formatDate(p.paymentDate)} · {p.method}</span>
                          <span>{formatMoney(p.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : null
            )}
          </ul>
        )}
      </section>

      {sale.notes && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Notes</h2>
          <p className="text-sm text-neutral-600">{sale.notes}</p>
        </section>
      )}
    </main>
  );
}
