import { z } from "zod";

export const inventoryImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
});

export const createInventorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required."),
  supplierId: z.string().uuid("Supplier is required."),
  categoryId: z.string().uuid().nullish(),
  costPrice: z.coerce.number().min(0, "Cost price must be zero or more."),
  sellingPrice: z.coerce.number().min(0, "Selling price must be zero or more."),
  initialQuantity: z.coerce.number().int().positive("Quantity must be at least 1."),
  sku: z.string().trim().optional(),
  description: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  image: inventoryImageSchema.nullish(),
});

export const updateInventorySchema = createInventorySchema.partial().extend({
  availableQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const saleLineSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unitSellingPrice: z.coerce.number().min(0).optional(),
});

export const salePaymentSchema = z.object({
  amount: z.coerce.number().min(0),
  paymentDate: z.coerce.date(),
  method: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().trim().min(1).optional(),
  saleDate: z.coerce.date(),
  status: z.enum(["DRAFT", "CONFIRMED", "DELIVERED"]).default("DRAFT"),
  deliveryCharge: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  lines: z.array(saleLineSchema).min(1, "At least one line is required."),
  payment: salePaymentSchema.optional(),
});

export const updateSaleSchema = z.object({
  saleDate: z.coerce.date().optional(),
  deliveryCharge: z.coerce.number().min(0).nullish(),
  notes: z.string().trim().optional(),
});

export const addSalePaymentSchema = salePaymentSchema.extend({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

export const addSupplierPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentDate: z.coerce.date(),
  method: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const paySupplierOutstandingSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentDate: z.coerce.date(),
  method: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  expenseDate: z.coerce.date(),
  description: z.string().trim().optional(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]),
  recurringTemplateId: z.string().uuid().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const createRecurringSchema = z.object({
  name: z.string().trim().min(1),
  categoryId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]),
  nextDueDate: z.coerce.date(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  notes: z.string().trim().optional(),
});

export const updateRecurringSchema = createRecurringSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createIncomeSchema = z.object({
  categoryId: z.string().uuid(),
  incomeKind: z.enum(["BUSINESS", "PERSONAL"]).default("BUSINESS"),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  incomeDate: z.coerce.date(),
  description: z.string().trim().optional(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "OTHER"]),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  shopName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["EXPENSE", "INCOME", "PRODUCT"]),
  expenseKind: z.enum(["BUSINESS", "PERSONAL"]).nullish(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
