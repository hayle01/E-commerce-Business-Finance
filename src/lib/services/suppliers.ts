import { prisma } from "@/lib/db";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/lib/validation";

export async function listSuppliers(userId: string) {
  const suppliers = await prisma.supplier.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { inventoryItems: { where: { isActive: true } } } },
      supplierPayables: {
        select: { amountDue: true, amountPaid: true, status: true },
      },
    },
  });
  return suppliers.map((s) => {
    const owed = s.supplierPayables
      .filter((p) => p.status !== "PAID")
      .reduce((sum, p) => sum + Number(p.amountDue) - Number(p.amountPaid), 0);
    const paid = s.supplierPayables
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amountPaid), 0);
    return { ...s, activeItems: s._count.inventoryItems, amountOwed: owed, totalPaid: paid };
  });
}

export async function getSupplier(userId: string, id: string) {
  return prisma.supplier.findFirst({
    where: { id, userId },
    include: {
      inventoryItems: { where: { isActive: true } },
      supplierPayables: { include: { payments: true, saleLine: { include: { sale: true } } } },
    },
  });
}

export async function createSupplier(userId: string, input: CreateSupplierInput) {
  return prisma.supplier.create({ data: { ...input, userId } });
}

export async function updateSupplier(userId: string, id: string, input: UpdateSupplierInput) {
  const existing = await prisma.supplier.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Supplier not found.");
  return prisma.supplier.update({ where: { id }, data: input });
}
