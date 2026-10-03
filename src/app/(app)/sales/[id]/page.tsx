import { getSale } from "@/lib/services/sales";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaleActions } from "@/components/sale-actions";

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await getSale(id);
  if (!sale) notFound();

  const revenue = sale.lines.reduce((s, l) => s + Number(l.lineRevenue), 0);
  const cogs = sale.lines.reduce((s, l) => s + Number(l.lineCOGS), 0);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{sale.orderNumber}</h1>
        <Link href="/sales" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      <p className="text-sm text-neutral-600">
        {new Date(sale.saleDate).toLocaleDateString()} · {sale.status} · {sale.paymentStatus} · {sale.customer?.name ?? "Walk-in"}
      </p>

      <SaleActions saleId={sale.id} status={sale.status} payables={sale.lines
        .map((l) => l.supplierPayable)
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({ id: p.id, supplierName: p.supplier.name, amountDue: p.amountDue.toString(), amountPaid: p.amountPaid.toString(), status: p.status }))}
      />

      <table className="mt-6 w-full border-collapse text-sm">
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

      <div className="mt-4 max-w-sm rounded-md border border-neutral-200 p-4 text-sm">
        <p>Revenue: <span className="float-right">{formatMoney(sale.total)}</span></p>
        <p>COGS: <span className="float-right">{formatMoney(cogs)}</span></p>
        <p className="font-medium">Gross profit: <span className="float-right">{formatMoney(revenue - cogs)}</span></p>
        <p>Amount paid: <span className="float-right">{formatMoney(sale.amountPaid)}</span></p>
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Payment history</h2>
        {sale.payments.length === 0 ? (
          <p className="text-sm text-neutral-500">No payments recorded.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 text-sm">
            {sale.payments.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{new Date(p.paymentDate).toLocaleDateString()} · {p.method}</span>
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
                          <span>{new Date(p.paymentDate).toLocaleDateString()} · {p.method}</span>
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
