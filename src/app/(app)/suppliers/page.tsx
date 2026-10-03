import { listSuppliers } from "@/lib/services/suppliers";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <Link href="/suppliers/new" className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white">Add supplier</Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No suppliers yet</p>
          <p className="mt-1 text-sm text-neutral-500">Add the shops you source products from.</p>
          <Link href="/suppliers/new" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Add supplier</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Supplier / Shop</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 text-right font-medium">Active items</th>
                  <th className="py-2 pr-4 text-right font-medium">Owed</th>
                  <th className="py-2 text-right font-medium">Total paid</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 pr-4"><Link href={`/suppliers/${s.id}`} className="font-medium">{s.name}</Link></td>
                    <td className="py-2 pr-4 text-neutral-600">{s.phone ?? s.location ?? "—"}</td>
                    <td className="py-2 pr-4 text-right">{s.activeItems}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(s.amountOwed)}</td>
                    <td className="py-2 text-right">{formatMoney(s.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-neutral-100 md:hidden">
            {suppliers.map((s) => (
              <li key={s.id}>
                <Link href={`/suppliers/${s.id}`} className="block py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-neutral-500">{s.phone ?? s.location ?? "—"}</p>
                  <p className="text-sm text-neutral-600">
                    {s.activeItems} items · owed {formatMoney(s.amountOwed)} · paid {formatMoney(s.totalPaid)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
