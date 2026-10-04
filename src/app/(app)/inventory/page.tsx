import { listInventoryItems } from "@/lib/services/inventory";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { getSessionUser } from "@/lib/api";

export default async function InventoryPage() {
  const user = (await getSessionUser())!;
  const items = await listInventoryItems(user.id);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventory</h1>
        <Link href="/inventory/new" className="btn-primary text-sm px-3">
          Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No inventory items yet</p>
          <p className="mt-1 text-sm text-neutral-500">Record your first sourced product to start tracking stock.</p>
          <Link href="/inventory/new" className="mt-4 inline-block btn-primary">
            Add item
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Photo</th>
                  <th className="py-2 pr-4 font-medium">Item</th>
                  <th className="py-2 pr-4 font-medium">Supplier</th>
                  <th className="py-2 pr-4 text-right font-medium">Cost</th>
                  <th className="py-2 pr-4 text-right font-medium">Sell Price</th>
                  <th className="py-2 pr-4 text-right font-medium">Available</th>
                  <th className="py-2 text-right font-medium">Potential Profit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-2 pr-4">
                      <Link href={`/inventory/${item.id}`} className="block h-10 w-10 overflow-hidden rounded-md bg-neutral-100">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : null}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Link href={`/inventory/${item.id}`} className="font-medium">{item.name}</Link>
                    </td>
                    <td className="py-2 pr-4 text-neutral-600">{item.supplier.name}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(item.costPrice)}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(item.sellingPrice)}</td>
                    <td className="py-2 pr-4 text-right">{item.availableQuantity}</td>
                    <td className="py-2 text-right">
                      {formatMoney((Number(item.sellingPrice) - Number(item.costPrice)) * item.availableQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="divide-y divide-neutral-100 md:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/inventory/${item.id}`} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.supplier.name}</p>
                    <p className="text-sm text-neutral-600">
                      Buy {formatMoney(item.costPrice)} → Sell {formatMoney(item.sellingPrice)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{item.availableQuantity} left</p>
                    <p className="text-neutral-500">
                      {formatMoney((Number(item.sellingPrice) - Number(item.costPrice)) * item.availableQuantity)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
