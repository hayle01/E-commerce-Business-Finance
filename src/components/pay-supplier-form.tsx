"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaySupplierForm({ supplierId, outstanding }: { supplierId: string; outstanding: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState(outstanding > 0 ? outstanding.toFixed(2) : "");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/suppliers/${supplierId}/payments`, {
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
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-3">
      <label className="flex flex-col gap-1 text-xs text-neutral-500">
        Amount (outstanding ${outstanding.toFixed(2)})
        <input type="number" min={0.01} max={outstanding} step="0.01" required className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-500">
        Method
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value as never)}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE_MONEY">Mobile money</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <button disabled={loading || outstanding <= 0} className="btn-primary">
        {loading ? "Paying…" : "Pay supplier"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
