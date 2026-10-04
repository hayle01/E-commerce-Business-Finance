import { prisma } from "@/lib/db";
import { createCustomerSchema } from "@/lib/validation";
import type { z } from "zod";

export async function listCustomers(userId: string) {
  return prisma.customer.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createCustomer(userId: string, input: z.infer<typeof createCustomerSchema>) {
  return prisma.customer.create({ data: { ...input, userId } });
}
