import { listSuppliers } from "@/lib/services/suppliers";
import { formatMoney } from "@/lib/format";
import Link from "next/link";
import { getSessionUser } from "@/lib/api";

export default async function SuppliersPage() {
  const user = (await getSessionUser())!;
  const suppliers = await listSuppliers(user.id);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <Link href="/suppliers/new" className="btn-primary text-sm px-3">Add supplier</Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="font-medium">No suppliers yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add the shops you source products from.</p>
          <Link href="/suppliers/new" className="mt-4 inline-block btn-primary">Add supplier</Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Supplier / Shop</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 text-right font-medium">Active items</th>
                  <th className="py-2 pr-4 text-right font-medium">Owed</th>
                  <th className="py-2 text-right font-medium">Total paid</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-accent">
                    <td className="py-2 pr-4"><Link href={`/suppliers/${s.id}`} className="font-medium">{s.name}</Link></td>
                    <td className="py-2 pr-4 text-muted-foreground">{s.phone ?? s.location ?? "—"}</td>
                    <td className="py-2 pr-4 text-right">{s.activeItems}</td>
                    <td className="py-2 pr-4 text-right">{formatMoney(s.amountOwed)}</td>
                    <td className="py-2 text-right">{formatMoney(s.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {suppliers.map((s) => (
              <li key={s.id}>
                <Link href={`/suppliers/${s.id}`} className="block py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.phone ?? s.location ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
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
