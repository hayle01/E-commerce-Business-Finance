import { prisma } from "@/lib/db";
import { SaleForm } from "@/components/forms/sale-form";

export default async function NewSalePage() {
  const [items, customers] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { isActive: true, availableQuantity: { gt: 0 } },
      include: { supplier: true },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">Record sale</h1>
      <SaleForm
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          supplierName: i.supplier.name,
          availableQuantity: i.availableQuantity,
          sellingPrice: i.sellingPrice.toString(),
          costPrice: i.costPrice.toString(),
        }))}
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      />
    </main>
  );
}
