"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayablePayButton({ payableId, outstanding }: { payableId: string; outstanding: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(outstanding.toFixed(2));
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (outstanding <= 0) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/supplier-payables/${payableId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, paymentDate: new Date().toISOString().slice(0, 10), method }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not record the payment.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="mt-1">
      <button onClick={() => setOpen(!open)} className="btn-secondary px-2 py-1 text-xs">
        {open ? "Cancel" : "Pay"}
      </button>
      {open && (
        <form onSubmit={onSubmit} className="mt-2 flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-2">
          <input
            type="number"
            min={0.01}
            max={outstanding}
            step="0.01"
            required
            aria-label="Amount"
            className="input w-28 px-2 py-1 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select aria-label="Method" className="input px-2 py-1 text-sm" value={method} onChange={(e) => setMethod(e.target.value as never)}>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="OTHER">Other</option>
          </select>
          <button disabled={loading} className="btn-primary px-3 py-1 text-sm">
            {loading ? "Saving…" : "Save"}
          </button>
          {error && <p className="w-full text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
