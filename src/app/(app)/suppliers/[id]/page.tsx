import { getSupplier } from "@/lib/services/suppliers";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();

  const owed = supplier.supplierPayables
    .filter((p) => p.status !== "PAID")
    .reduce((sum, p) => sum + Number(p.amountDue) - Number(p.amountPaid), 0);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{supplier.name}</h1>
        <Link href="/suppliers" className="text-sm text-neutral-500 underline">Back</Link>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:max-w-lg">
        <dt className="text-neutral-500">Shop</dt><dd>{supplier.shopName ?? "—"}</dd>
        <dt className="text-neutral-500">Phone</dt><dd>{supplier.phone ?? "—"}</dd>
        <dt className="text-neutral-500">Location</dt><dd>{supplier.location ?? "—"}</dd>
        <dt className="text-neutral-500">Amount owed</dt><dd>{formatMoney(owed)}</dd>
      </dl>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Active items</h2>
        {supplier.inventoryItems.length === 0 ? (
          <p className="text-sm text-neutral-500">No active inventory items from this supplier.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {supplier.inventoryItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <Link href={`/inventory/${item.id}`} className="font-medium">{item.name}</Link>
                <span>{item.availableQuantity} available</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
