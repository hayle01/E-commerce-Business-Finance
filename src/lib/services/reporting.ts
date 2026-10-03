import { prisma } from "@/lib/db";
import { toCents } from "@/lib/money";

export type Range = { from: Date; to: Date };

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function cents(v: unknown): number {
  return toCents(Number(v ?? 0));
}

async function deliveredSales(range: Range) {
  return prisma.sale.findMany({
    where: {
      status: "DELIVERED",
      deliveredAt: { gte: range.from, lte: range.to },
    },
    include: {
      lines: { include: { inventoryItem: { include: { category: true, supplier: true } } } },
    },
  });
}

async function expensesIn(range: Range) {
  return prisma.expense.findMany({
    where: { expenseDate: { gte: range.from, lte: range.to } },
    include: { category: true },
  });
}

async function incomesIn(range: Range) {
  return prisma.otherIncome.findMany({
    where: { incomeDate: { gte: range.from, lte: range.to } },
    include: { category: true },
  });
}

export async function getFinancialSummary(range: Range) {
  const [sales, expenses, incomes, salePayments, supplierPayments] = await Promise.all([
    deliveredSales(range),
    expensesIn(range),
    incomesIn(range),
    prisma.salePayment.findMany({ where: { paymentDate: { gte: range.from, lte: range.to } } }),
    prisma.supplierPayment.findMany({ where: { paymentDate: { gte: range.from, lte: range.to } } }),
  ]);

  let revenueCents = 0;
  let cogsCents = 0;
  for (const sale of sales) {
    for (const line of sale.lines) {
      revenueCents += cents(line.lineRevenue);
      cogsCents += cents(line.lineCOGS);
    }
  }

  let businessExpenseCents = 0;
  let personalExpenseCents = 0;
  for (const e of expenses) {
    if (e.category.expenseKind === "PERSONAL") personalExpenseCents += cents(e.amount);
    else businessExpenseCents += cents(e.amount);
  }

  let businessIncomeCents = 0;
  let personalIncomeCents = 0;
  for (const i of incomes) {
    if (i.incomeKind === "PERSONAL") personalIncomeCents += cents(i.amount);
    else businessIncomeCents += cents(i.amount);
  }

  const grossProfitCents = revenueCents - cogsCents;
  const netProfitCents = grossProfitCents - businessExpenseCents + businessIncomeCents;
  const netAvailableIncomeCents = netProfitCents + personalIncomeCents - personalExpenseCents;

  const cashInCents =
    salePayments.reduce((s, p) => s + cents(p.amount), 0) +
    incomes.reduce((s, i) => s + cents(i.amount), 0);
  const cashOutCents =
    supplierPayments.reduce((s, p) => s + cents(p.amount), 0) +
    businessExpenseCents +
    personalExpenseCents;

  const outstandingPayables = await prisma.supplierPayable.findMany({
    where: { status: { not: "PAID" } },
    select: { amountDue: true, amountPaid: true },
  });
  const supplierOutstandingCents = outstandingPayables.reduce(
    (s, p) => s + cents(p.amountDue) - cents(p.amountPaid),
    0
  );

  return {
    revenue: revenueCents / 100,
    cogs: cogsCents / 100,
    grossProfit: grossProfitCents / 100,
    businessExpenses: businessExpenseCents / 100,
    otherBusinessIncome: businessIncomeCents / 100,
    netProfit: netProfitCents / 100,
    personalExpenses: personalExpenseCents / 100,
    otherPersonalIncome: personalIncomeCents / 100,
    netAvailableIncome: netAvailableIncomeCents / 100,
    cashIn: cashInCents / 100,
    cashOut: cashOutCents / 100,
    netCashFlow: (cashInCents - cashOutCents) / 100,
    supplierOutstanding: supplierOutstandingCents / 100,
  };
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function eachDay(range: Range): string[] {
  const days: string[] = [];
  const cur = startOfDay(range.from);
  const end = startOfDay(range.to);
  while (cur <= end) {
    days.push(dayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export async function getTrends(range: Range) {
  const [sales, expenses, salePayments, supplierPayments, incomes] = await Promise.all([
    deliveredSales(range),
    expensesIn(range),
    prisma.salePayment.findMany({ where: { paymentDate: { gte: range.from, lte: range.to } } }),
    prisma.supplierPayment.findMany({ where: { paymentDate: { gte: range.from, lte: range.to } } }),
    incomesIn(range),
  ]);

  const revenueByDay = new Map<string, number>();
  const cogsByDay = new Map<string, number>();
  const cashInByDay = new Map<string, number>();
  const cashOutByDay = new Map<string, number>();
  const expenseByCategory = new Map<string, number>();

  for (const sale of sales) {
    const key = sale.deliveredAt ? dayKey(sale.deliveredAt) : dayKey(sale.saleDate);
    for (const line of sale.lines) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + cents(line.lineRevenue));
      cogsByDay.set(key, (cogsByDay.get(key) ?? 0) + cents(line.lineCOGS));
    }
  }
  for (const p of salePayments) {
    const key = dayKey(p.paymentDate);
    cashInByDay.set(key, (cashInByDay.get(key) ?? 0) + cents(p.amount));
  }
  for (const i of incomes) {
    const key = dayKey(i.incomeDate);
    cashInByDay.set(key, (cashInByDay.get(key) ?? 0) + cents(i.amount));
  }
  for (const p of supplierPayments) {
    const key = dayKey(p.paymentDate);
    cashOutByDay.set(key, (cashOutByDay.get(key) ?? 0) + cents(p.amount));
  }
  for (const e of expenses) {
    const key = dayKey(e.expenseDate);
    cashOutByDay.set(key, (cashOutByDay.get(key) ?? 0) + cents(e.amount));
    const name = e.category.name;
    expenseByCategory.set(name, (expenseByCategory.get(name) ?? 0) + cents(e.amount));
  }

  return {
    days: eachDay(range).map((date) => ({
      date,
      revenue: (revenueByDay.get(date) ?? 0) / 100,
      cogs: (cogsByDay.get(date) ?? 0) / 100,
      grossProfit: ((revenueByDay.get(date) ?? 0) - (cogsByDay.get(date) ?? 0)) / 100,
      cashIn: (cashInByDay.get(date) ?? 0) / 100,
      cashOut: (cashOutByDay.get(date) ?? 0) / 100,
    })),
    expensesByCategory: [...expenseByCategory.entries()]
      .map(([name, value]) => ({ name, value: value / 100 }))
      .sort((a, b) => b.value - a.value),
  };
}

export async function getReportBreakdowns(range: Range) {
  const [sales, expenses, incomes, payablesCreated, supplierPayments] = await Promise.all([
    deliveredSales(range),
    expensesIn(range),
    incomesIn(range),
    prisma.supplierPayable.findMany({ where: { createdAt: { gte: range.from, lte: range.to } } }),
    prisma.supplierPayment.findMany({ where: { paymentDate: { gte: range.from, lte: range.to } } }),
  ]);

  const revenueByDay = new Map<string, number>();
  const revenueByProduct = new Map<string, number>();
  const revenueByCategory = new Map<string, number>();
  const revenueBySupplier = new Map<string, number>();
  const profitByDay = new Map<string, number>();
  const profitByProduct = new Map<string, number>();
  const profitBySupplier = new Map<string, number>();

  for (const sale of sales) {
    const day = sale.deliveredAt ? dayKey(sale.deliveredAt) : dayKey(sale.saleDate);
    for (const line of sale.lines) {
      const revenue = cents(line.lineRevenue);
      const profit = revenue - cents(line.lineCOGS);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + revenue);
      profitByDay.set(day, (profitByDay.get(day) ?? 0) + profit);

      const product = line.itemNameSnapshot;
      revenueByProduct.set(product, (revenueByProduct.get(product) ?? 0) + revenue);
      profitByProduct.set(product, (profitByProduct.get(product) ?? 0) + profit);

      const categoryName = line.inventoryItem.category?.name ?? "Uncategorized";
      revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) ?? 0) + revenue);

      const supplierName = line.inventoryItem.supplier?.name ?? "Unknown";
      revenueBySupplier.set(supplierName, (revenueBySupplier.get(supplierName) ?? 0) + revenue);
      profitBySupplier.set(supplierName, (profitBySupplier.get(supplierName) ?? 0) + profit);
    }
  }

  const expensesByCategory = new Map<string, number>();
  const expensesByDay = new Map<string, number>();
  let businessCents = 0;
  let personalCents = 0;
  for (const e of expenses) {
    expensesByCategory.set(e.category.name, (expensesByCategory.get(e.category.name) ?? 0) + cents(e.amount));
    const day = dayKey(e.expenseDate);
    expensesByDay.set(day, (expensesByDay.get(day) ?? 0) + cents(e.amount));
    if (e.category.expenseKind === "PERSONAL") personalCents += cents(e.amount);
    else businessCents += cents(e.amount);
  }

  const incomeByCategory = new Map<string, number>();
  const incomeByDay = new Map<string, number>();
  for (const i of incomes) {
    incomeByCategory.set(i.category.name, (incomeByCategory.get(i.category.name) ?? 0) + cents(i.amount));
    const day = dayKey(i.incomeDate);
    incomeByDay.set(day, (incomeByDay.get(day) ?? 0) + cents(i.amount));
  }

  // Supplier liabilities across the same range.
  const payablesBefore = await prisma.supplierPayable.findMany({
    where: { createdAt: { lt: range.from } },
    include: { payments: { where: { paymentDate: { lt: range.from } } } },
  });
  const openingCents = payablesBefore.reduce(
    (s, p) => s + cents(p.amountDue) - p.payments.reduce((x, pay) => x + cents(pay.amount), 0),
    0
  );
  const newPayablesCents = payablesCreated.reduce((s, p) => s + cents(p.amountDue), 0);
  const paymentsCents = supplierPayments.reduce((s, p) => s + cents(p.amount), 0);

  const toEntries = (m: Map<string, number>) =>
    [...m.entries()].map(([name, value]) => ({ name, value: value / 100 })).sort((a, b) => b.value - a.value);

  return {
    revenueByDay: toEntries(revenueByDay),
    revenueByProduct: toEntries(revenueByProduct),
    revenueByCategory: toEntries(revenueByCategory),
    revenueBySupplier: toEntries(revenueBySupplier),
    profitByDay: toEntries(profitByDay),
    profitByProduct: toEntries(profitByProduct),
    profitBySupplier: toEntries(profitBySupplier),
    expensesByCategory: toEntries(expensesByCategory),
    expensesByDay: toEntries(expensesByDay),
    expensesByKind: [
      { name: "Business", value: businessCents / 100 },
      { name: "Personal", value: personalCents / 100 },
    ],
    incomeByCategory: toEntries(incomeByCategory),
    incomeByDay: toEntries(incomeByDay),
    supplierLiabilities: {
      opening: openingCents / 100,
      newPayables: newPayablesCents / 100,
      paymentsMade: paymentsCents / 100,
      closing: (openingCents + newPayablesCents - paymentsCents) / 100,
    },
  };
}
