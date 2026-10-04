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
        <Link href="/inventory" className="text-sm text-muted-foreground underline">Back</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Supplier</dt><dd>{item.supplier.name}</dd>
          <dt className="text-muted-foreground">Category</dt><dd>{item.category?.name ?? "—"}</dd>
          <dt className="text-muted-foreground">Cost price</dt><dd>{formatMoney(item.costPrice)}</dd>
          <dt className="text-muted-foreground">Selling price</dt><dd>{formatMoney(item.sellingPrice)}</dd>
          <dt className="text-muted-foreground">Quantity sourced</dt><dd>{item.initialQuantity}</dd>
          <dt className="text-muted-foreground">Quantity sold</dt><dd>{quantitySold}</dd>
          <dt className="text-muted-foreground">Available</dt><dd>{item.availableQuantity}</dd>
          <dt className="text-muted-foreground">Realized revenue</dt><dd>{formatMoney(realizedRevenue)}</dd>
          <dt className="text-muted-foreground">Realized COGS</dt><dd>{formatMoney(realizedCOGS)}</dd>
          <dt className="text-muted-foreground">Realized profit</dt><dd>{formatMoney(realizedRevenue - realizedCOGS)}</dd>
          <dt className="text-muted-foreground">SKU</dt><dd>{item.sku ?? "—"}</dd>
        </dl>
      </div>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Related sales</h2>
        {item.saleLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales recorded for this item yet.</p>
        ) : (
          <ul className="divide-y divide-border">
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
