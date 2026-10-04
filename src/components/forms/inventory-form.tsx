"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./image-upload-field";
import type { UploadedImage } from "@/lib/storage/media";

type Option = { id: string; name: string };

export function InventoryForm({ suppliers, categories }: { suppliers: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [itemId] = useState(() => crypto.randomUUID());
  const [name, setName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: itemId,
        name,
        supplierId,
        categoryId: categoryId || null,
        costPrice,
        sellingPrice,
        initialQuantity: quantity,
        sku: sku || undefined,
        description: description || undefined,
        image,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the item.");
      return;
    }
    const { data } = await res.json();
    router.push(`/inventory/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Product/item name
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Supplier
        <select required className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="">Select supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Product category
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <div>
        <p className="mb-1 text-sm">Photo</p>
        <ImageUploadField folderId={itemId} value={image} onChange={setImage} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Cost price
          <input required type="number" min="0" step="0.01" className="input" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Selling price
          <input required type="number" min="0" step="0.01" className="input" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Quantity
        <input required type="number" min="1" step="1" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        SKU (optional)
        <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description / notes
        <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="sticky bottom-0 border-t border-border bg-background py-3">
      <button disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Saving…" : "Save item"}
      </button>
      </div>
    </form>
  );
}
