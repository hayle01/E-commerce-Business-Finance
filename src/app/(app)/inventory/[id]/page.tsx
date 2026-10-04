import { getInventoryItem } from "@/lib/services/inventory";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/api";

export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const item = await getInventoryItem(user.id, id);
  if (!item) notFound();

  const quantitySold = item.initialQuantity - item.availableQuantity;
  const realizedRevenue = item.saleLines
    .filter((l) => l.sale.status === "DELIVERED")
    .reduce((sum, l) => sum + Number(l.lineRevenue), 0);
  const realizedCOGS = item.saleLines
    .filter((l) => l.sale.status === "DELIVERED")
    .reduce((sum, l) => sum + Number(l.lineCOGS), 0);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{item.name}</h1>
        <Link href="/inventory" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <dt className="text-neutral-500">Supplier</dt><dd>{item.supplier.name}</dd>
          <dt className="text-neutral-500">Category</dt><dd>{item.category?.name ?? "—"}</dd>
          <dt className="text-neutral-500">Cost price</dt><dd>{formatMoney(item.costPrice)}</dd>
          <dt className="text-neutral-500">Selling price</dt><dd>{formatMoney(item.sellingPrice)}</dd>
          <dt className="text-neutral-500">Quantity sourced</dt><dd>{item.initialQuantity}</dd>
          <dt className="text-neutral-500">Quantity sold</dt><dd>{quantitySold}</dd>
          <dt className="text-neutral-500">Available</dt><dd>{item.availableQuantity}</dd>
          <dt className="text-neutral-500">Realized revenue</dt><dd>{formatMoney(realizedRevenue)}</dd>
          <dt className="text-neutral-500">Realized COGS</dt><dd>{formatMoney(realizedCOGS)}</dd>
          <dt className="text-neutral-500">Realized profit</dt><dd>{formatMoney(realizedRevenue - realizedCOGS)}</dd>
          <dt className="text-neutral-500">SKU</dt><dd>{item.sku ?? "—"}</dd>
        </dl>
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Related sales</h2>
        {item.saleLines.length === 0 ? (
          <p className="text-sm text-neutral-500">No sales recorded for this item yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {item.saleLines.map((line) => (
              <li key={line.id} className="flex justify-between py-2 text-sm">
                <Link href={`/sales/${line.saleId}`} className="font-medium">{line.sale.orderNumber}</Link>
                <span>{line.quantity} × {formatMoney(line.unitSellingPriceSnapshot)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
