import { prisma } from "@/lib/db";
import type { CreateInventoryInput, UpdateInventoryInput } from "@/lib/validation";

export async function listInventoryItems() {
  return prisma.inventoryItem.findMany({
    include: { supplier: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInventoryItem(id: string) {
  return prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      supplier: true,
      category: true,
      saleLines: { include: { sale: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createInventoryItem(input: CreateInventoryInput) {
  return prisma.inventoryItem.create({
    data: {
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

export async function updateInventoryItem(id: string, input: UpdateInventoryInput) {
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
