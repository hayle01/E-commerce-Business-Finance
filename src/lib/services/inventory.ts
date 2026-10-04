import { prisma } from "@/lib/db";
import type { CreateInventoryInput, UpdateInventoryInput } from "@/lib/validation";

export async function listInventoryItems(userId: string) {
  return prisma.inventoryItem.findMany({
    where: { userId },
    include: { supplier: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInventoryItem(userId: string, id: string) {
  return prisma.inventoryItem.findFirst({
    where: { id, userId },
    include: {
      supplier: true,
      category: true,
      saleLines: { include: { sale: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createInventoryItem(userId: string, input: CreateInventoryInput) {
  return prisma.inventoryItem.create({
    data: {
      userId,
      id: input.id,
      name: input.name,
      supplierId: input.supplierId,
      categoryId: input.categoryId ?? null,
      costPrice: input.costPrice,
      sellingPrice: input.sellingPrice,
      initialQuantity: input.initialQuantity,
      availableQuantity: input.initialQuantity,
      sku: input.sku || null,
      description: input.description,
      notes: input.notes,
      imageUrl: input.image?.url,
      imageKey: input.image?.key,
      imageWidth: input.image?.width,
      imageHeight: input.image?.height,
      imageMimeType: input.image?.mimeType,
      imageSizeBytes: input.image?.sizeBytes,
    },
  });
}

export async function updateInventoryItem(userId: string, id: string, input: UpdateInventoryInput) {
  const existing = await prisma.inventoryItem.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Inventory item not found.");
  return prisma.inventoryItem.update({
    where: { id },
    data: {
      name: input.name,
      supplierId: input.supplierId,
      categoryId: input.categoryId,
      costPrice: input.costPrice,
      sellingPrice: input.sellingPrice,
      initialQuantity: input.initialQuantity,
      availableQuantity: input.availableQuantity,
      sku: input.sku,
      description: input.description,
      notes: input.notes,
      isActive: input.isActive,
      imageUrl: input.image?.url,
      imageKey: input.image?.key,
      imageWidth: input.image?.width,
      imageHeight: input.image?.height,
      imageMimeType: input.image?.mimeType,
      imageSizeBytes: input.image?.sizeBytes,
    },
  });
}
