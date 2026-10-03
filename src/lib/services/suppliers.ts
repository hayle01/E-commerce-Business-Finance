import { prisma } from "@/lib/db";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/lib/validation";

export async function listSuppliers() {
  const suppliers = await prisma.supplier.findMany({
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

export async function getSupplier(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      inventoryItems: { where: { isActive: true } },
      supplierPayables: { include: { payments: true } },
    },
  });
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
  return prisma.supplier.update({ where: { id }, data: input });
}
