import { prisma } from "@/lib/db";
import { fromCents, toCents } from "@/lib/money";
import type { addSalePaymentSchema, addSupplierPaymentSchema, createSaleSchema } from "@/lib/validation";
import type { z } from "zod";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function computePaymentStatus(totalCents: number, paidCents: number): "UNPAID" | "PARTIAL" | "PAID" {
  if (paidCents <= 0) return "UNPAID";
  if (paidCents >= totalCents) return "PAID";
  return "PARTIAL";
}

async function nextOrderNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.sale.count({ where: { userId } });
  return `ORD-${year}-${String(count + 1).padStart(6, "0")}`;
}

export async function listSales(userId: string, filters: { q?: string; status?: string; paymentStatus?: string }) {
  return prisma.sale.findMany({
    where: {
      userId,
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus as never } : {}),
      ...(filters.q
        ? {
            OR: [
              { orderNumber: { contains: filters.q, mode: "insensitive" } },
              { customer: { name: { contains: filters.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      _count: { select: { lines: true } },
      lines: { select: { lineRevenue: true, lineCOGS: true } },
    },
    orderBy: { saleDate: "desc" },
  });
}

export async function getSale(userId: string, id: string) {
  return prisma.sale.findFirst({
    where: { id, userId },
    include: {
      customer: true,
      lines: { include: { inventoryItem: true, supplierPayable: { include: { payments: true, supplier: true } } } },
      payments: { orderBy: { paymentDate: "desc" } },
    },
  });
}

async function decrementInventoryAndCreatePayables(tx: Tx, saleId: string) {
  const sale = await tx.sale.findUniqueOrThrow({
    where: { id: saleId },
    include: { lines: true },
  });
  for (const line of sale.lines) {
    const item = await tx.inventoryItem.findUniqueOrThrow({ where: { id: line.inventoryItemId } });
    if (item.userId !== sale.userId) throw new Error("Inventory item does not belong to this account.");
    if (item.availableQuantity < line.quantity) {
      throw new Error(`Not enough stock for "${item.name}". Available: ${item.availableQuantity}.`);
    }
    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { availableQuantity: item.availableQuantity - line.quantity },
    });
    await tx.supplierPayable.create({
      data: {
        userId: sale.userId,
        saleLineId: line.id,
        supplierId: item.supplierId,
        amountDue: line.lineCOGS,
        amountPaid: 0,
        status: "UNPAID",
      },
    });
  }
}

async function restoreInventoryAndReversePayables(tx: Tx, saleId: string) {
  const sale = await tx.sale.findUniqueOrThrow({
    where: { id: saleId },
    include: { lines: { include: { supplierPayable: { include: { payments: true } } } } },
  });
  for (const line of sale.lines) {
    await tx.inventoryItem.update({
      where: { id: line.inventoryItemId },
      data: { availableQuantity: { increment: line.quantity } },
    });
    const payable = line.supplierPayable;
    if (payable) {
      if (payable.payments.length > 0) {
        throw new Error("Cannot reverse a sale with recorded supplier payments.");
      }
      await tx.supplierPayable.delete({ where: { id: payable.id } });
    }
  }
}

export async function createSale(userId: string, input: z.infer<typeof createSaleSchema>) {
  // Validate availability up front for a clear error message.
  for (const line of input.lines) {
    const item = await prisma.inventoryItem.findFirst({ where: { id: line.inventoryItemId, userId } });
    if (!item) throw new Error("Inventory item not found.");
    if (line.quantity > item.availableQuantity) {
      throw new Error(`Cannot sell ${line.quantity} × "${item.name}" — only ${item.availableQuantity} available.`);
    }
  }

  let customerId = input.customerId ?? null;
  if (!customerId && input.customerName) {
    const customer = await prisma.customer.create({ data: { name: input.customerName, userId } });
    customerId = customer.id;
  } else if (customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: customerId, userId } });
    if (!customer) throw new Error("Customer not found.");
  }

  const lines = await Promise.all(
    input.lines.map(async (line) => {
      const item = await prisma.inventoryItem.findFirstOrThrow({ where: { id: line.inventoryItemId, userId } });
      const unitPriceCents = toCents(line.unitSellingPrice ?? item.sellingPrice.toString());
      const unitCostCents = toCents(item.costPrice.toString());
      const lineRevenueCents = unitPriceCents * line.quantity;
      const lineCOGSCents = unitCostCents * line.quantity;
      return { line, item, unitPriceCents, unitCostCents, lineRevenueCents, lineCOGSCents };
    })
  );

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineRevenueCents, 0);
  const deliveryCents = toCents(input.deliveryCharge ?? 0);
  const totalCents = subtotalCents + deliveryCents;

  if (input.payment && toCents(input.payment.amount) > totalCents) {
    throw new Error("Payment total cannot exceed the sale total.");
  }

  const paidCents = input.payment ? toCents(input.payment.amount) : 0;

  const orderNumber = await nextOrderNumber(userId);
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        userId,
        orderNumber,
        customerId,
        status: input.status,
        paymentStatus: computePaymentStatus(totalCents, paidCents),
        saleDate: input.saleDate,
        deliveredAt: input.status === "DELIVERED" ? new Date() : null,
        subtotal: fromCents(subtotalCents),
        deliveryCharge: input.deliveryCharge ? fromCents(deliveryCents) : null,
        total: fromCents(totalCents),
        amountPaid: fromCents(paidCents),
        notes: input.notes,
        lines: {
          create: lines.map((l) => ({
            inventoryItemId: l.item.id,
            supplierIdSnapshot: l.item.supplierId,
            itemNameSnapshot: l.item.name,
            unitCostSnapshot: fromCents(l.unitCostCents),
            unitSellingPriceSnapshot: fromCents(l.unitPriceCents),
            quantity: l.line.quantity,
            lineRevenue: fromCents(l.lineRevenueCents),
            lineCOGS: fromCents(l.lineCOGSCents),
            lineProfit: fromCents(l.lineRevenueCents - l.lineCOGSCents),
          })),
        },
        payments: input.payment
          ? {
              create: {
                amount: fromCents(paidCents),
                paymentDate: input.payment.paymentDate,
                method: input.payment.method,
                reference: input.payment.reference,
                notes: input.payment.notes,
              },
            }
          : undefined,
      },
      include: { lines: true },
    });

    if (input.status === "DELIVERED") {
      await decrementInventoryAndCreatePayables(tx, sale.id);
    }
    return sale;
  });
}

export async function updateSale(
  userId: string,
  id: string,
  input: { saleDate?: Date; deliveryCharge?: number | null; notes?: string }
) {
  const sale = await prisma.sale.findFirst({ where: { id, userId } });
  if (!sale) throw new Error("Sale not found.");
  if (sale.status === "CANCELLED" || sale.status === "RETURNED") {
    throw new Error("Cannot edit a closed sale.");
  }
  if (sale.status === "DELIVERED" && input.deliveryCharge !== undefined && input.deliveryCharge !== null) {
    throw new Error("Cannot change delivery charge after delivery.");
  }
  const newDelivery = input.deliveryCharge === null ? 0 : input.deliveryCharge ?? (sale.deliveryCharge ? Number(sale.deliveryCharge) : 0);
  const newTotal = Number(sale.subtotal) + newDelivery;
  return prisma.sale.update({
    where: { id },
    data: {
      saleDate: input.saleDate,
      deliveryCharge: input.deliveryCharge === null ? null : input.deliveryCharge,
      notes: input.notes,
      total: newTotal.toFixed(2),
    },
  });
}

export async function markDelivered(userId: string, id: string) {
  const sale = await prisma.sale.findFirst({ where: { id, userId } });
  if (!sale) throw new Error("Sale not found.");
  if (sale.status === "DELIVERED") throw new Error("Sale is already delivered.");
  if (sale.status === "CANCELLED" || sale.status === "RETURNED") {
    throw new Error("Cannot deliver a cancelled or returned sale.");
  }
  return prisma.$transaction(async (tx) => {
    await decrementInventoryAndCreatePayables(tx, id);
    return tx.sale.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
  });
}

export async function cancelOrReturnSale(userId: string, id: string, outcome: "CANCELLED" | "RETURNED") {
  const sale = await prisma.sale.findFirst({
    where: { id, userId },
    include: { payments: true },
  });
  if (!sale) throw new Error("Sale not found.");
  if (sale.status === "CANCELLED" || sale.status === "RETURNED") {
    throw new Error("Sale is already closed.");
  }
  if (sale.status === "DELIVERED" && sale.payments.length > 0) {
    throw new Error("Cannot cancel/return a delivered sale with recorded customer payments.");
  }
  return prisma.$transaction(async (tx) => {
    if (sale.status === "DELIVERED") {
      await restoreInventoryAndReversePayables(tx, id);
    }
    return tx.sale.update({
      where: { id },
      data: { status: outcome, paymentStatus: outcome === "RETURNED" && sale.payments.length > 0 ? "REFUNDED" : sale.paymentStatus },
    });
  });
}

export async function addSalePayment(userId: string, id: string, input: z.infer<typeof addSalePaymentSchema>) {
  const sale = await prisma.sale.findFirst({
    where: { id, userId },
    include: { payments: true },
  });
  if (!sale) throw new Error("Sale not found.");
  if (sale.status === "CANCELLED" || sale.status === "RETURNED") {
    throw new Error("Cannot add a payment to a closed sale.");
  }
  const paidCents = sale.payments.reduce((sum, p) => sum + toCents(p.amount.toString()), 0);
  const totalCents = toCents(sale.total.toString());
  const newPaidCents = paidCents + toCents(input.amount);
  if (newPaidCents > totalCents) {
    throw new Error("Payment total cannot exceed the sale total.");
  }
  return prisma.$transaction(async (tx) => {
    const payment = await tx.salePayment.create({
      data: {
        saleId: id,
        amount: input.amount,
        paymentDate: input.paymentDate,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      },
    });
    await tx.sale.update({
      where: { id },
      data: {
        amountPaid: fromCents(newPaidCents),
        paymentStatus: computePaymentStatus(totalCents, newPaidCents),
      },
    });
    return payment;
  });
}

export async function addSupplierPayment(userId: string, payableId: string, input: z.infer<typeof addSupplierPaymentSchema>) {
  const payable = await prisma.supplierPayable.findFirst({ where: { id: payableId, userId } });
  if (!payable) throw new Error("Payable not found.");
  const paidCents = toCents(payable.amountPaid.toString()) + toCents(input.amount);
  const dueCents = toCents(payable.amountDue.toString());
  if (paidCents > dueCents) {
    throw new Error("Payment cannot exceed the outstanding amount.");
  }
  return prisma.$transaction(async (tx) => {
    const payment = await tx.supplierPayment.create({
      data: {
        supplierPayableId: payableId,
        amount: input.amount,
        paymentDate: input.paymentDate,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      },
    });
    await tx.supplierPayable.update({
      where: { id: payableId },
      data: {
        amountPaid: fromCents(paidCents),
        status: paidCents >= dueCents ? "PAID" : "PARTIAL",
      },
    });
    return payment;
  });
}

/**
 * Records one customer-side cash payment to a supplier, allocated across their
 * outstanding payables (oldest first). Supports paying everything at once,
 * or a partial amount that only settles the oldest payables.
 */
export async function paySupplierOutstanding(
  userId: string,
  supplierId: string,
  input: { amount: number; paymentDate: Date; method: "CASH" | "BANK" | "MOBILE_MONEY" | "OTHER"; reference?: string; notes?: string }
) {
  const payables = await prisma.supplierPayable.findMany({
    where: { supplierId, userId, status: { not: "PAID" } },
    orderBy: { createdAt: "asc" },
  });
  const outstandingCents = payables.reduce(
    (sum, p) => sum + toCents(p.amountDue.toString()) - toCents(p.amountPaid.toString()),
    0
  );
  const requestedCents = toCents(input.amount);
  if (requestedCents > outstandingCents) {
    throw new Error("Payment cannot exceed the total outstanding balance.");
  }

  return prisma.$transaction(async (tx) => {
    let remaining = requestedCents;
    for (const payable of payables) {
      if (remaining <= 0) break;
      const payableOutstanding = toCents(payable.amountDue.toString()) - toCents(payable.amountPaid.toString());
      const pay = Math.min(remaining, payableOutstanding);
      const newPaidCents = toCents(payable.amountPaid.toString()) + pay;
      const dueCents = toCents(payable.amountDue.toString());
      await tx.supplierPayment.create({
        data: {
          supplierPayableId: payable.id,
          amount: fromCents(pay),
          paymentDate: input.paymentDate,
          method: input.method,
          reference: input.reference,
          notes: input.notes,
        },
      });
      await tx.supplierPayable.update({
        where: { id: payable.id },
        data: { amountPaid: fromCents(newPaidCents), status: newPaidCents >= dueCents ? "PAID" : "PARTIAL" },
      });
      remaining -= pay;
    }
    return { paid: fromCents(requestedCents) };
  });
}
