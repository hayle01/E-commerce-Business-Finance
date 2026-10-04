"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SaleEditForm({
  saleId,
  status,
  saleDate,
  deliveryCharge,
  notes,
}: {
  saleId: string;
  status: string;
  saleDate: string;
  deliveryCharge: string;
  notes: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(saleDate);
  const [delivery, setDelivery] = useState(deliveryCharge);
  const [noteText, setNoteText] = useState(notes);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const delivered = status === "DELIVERED";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/sales/${saleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        saleDate: date,
        deliveryCharge: delivered ? undefined : delivery === "" ? null : delivery,
        notes: noteText,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not update the sale.");
      return;
    }
    router.push(`/sales/${saleId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input required type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Delivery charge
        <input
          type="number"
          min={0}
          step="0.01"
          disabled={delivered}
          title={delivered ? "Cannot change delivery charge after delivery." : undefined}
          className="input disabled:opacity-50"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="input" rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="sticky bottom-0 border-t border-border bg-background py-3">
        <button disabled={loading} className="btn-primary w-full md:w-auto">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
