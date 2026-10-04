import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/api";
import { InventoryForm } from "@/components/forms/inventory-form";

export default async function NewInventoryItemPage() {
  const user = (await getSessionUser())!;
  const [suppliers, categories] = await Promise.all([
    prisma.supplier.findMany({ where: { isActive: true, userId: user.id }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { type: "PRODUCT", isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <main className="p-4 md:p-6">
      <h1 className="mb-4 text-xl font-semibold">New inventory item</h1>
      <InventoryForm suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </main>
  );
}
