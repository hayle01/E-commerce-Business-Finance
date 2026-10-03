import { prisma } from "@/lib/db";
import { createCustomerSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listCustomers() {
  return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createCustomer(input: z.infer<typeof createCustomerSchema>) {
  return prisma.customer.create({ data: input });
}
