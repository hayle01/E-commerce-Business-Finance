"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Payable = { id: string; supplierName: string; amountDue: string; amountPaid: string; status: string };

export function SaleActions({ saleId, status, payables }: { saleId: string; status: string; payables: Payable[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"payment" | "paySupplier" | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [payableId, setPayableId] = useState(payables[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function post(url: string, body: object) {
    setError(null);
    setLoading(true);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      setError(json?.error?.message ?? "Action failed.");
      return;
    }
    setMode(null);
    setAmount("");
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {(status === "DRAFT" || status === "CONFIRMED") && (
          <button
            disabled={loading}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => post(`/api/sales/${saleId}/complete`, {})}
          >
            Mark delivered
          </button>
        )}
        {status !== "CANCELLED" && status !== "RETURNED" && (
          <button
            disabled={loading}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => post(`/api/sales/${saleId}/cancel`, { outcome: "CANCELLED" })}
          >
            Cancel
          </button>
        )}
        {status === "DELIVERED" && (
          <button
            disabled={loading}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            onClick={() => post(`/api/sales/${saleId}/cancel`, { outcome: "RETURNED" })}
          >
            Return
          </button>
        )}
        {status !== "CANCELLED" && status !== "RETURNED" && (
          <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMode(mode === "payment" ? null : "payment")}>
            Record payment
          </button>
        )}
        {payables.length > 0 && (
          <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMode(mode === "paySupplier" ? null : "paySupplier")}>
            Pay supplier
          </button>
        )}
      </div>

      {mode === "payment" && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            post(`/api/sales/${saleId}/payments`, { amount, paymentDate: today, method });
          }}
        >
          <input type="number" min={0.01} step="0.01" required placeholder="Amount" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={method} onChange={(e) => setMethod(e.target.value as never)}>
            <option value="CASH">Cash</option><option value="BANK">Bank</option><option value="MOBILE_MONEY">Mobile money</option><option value="OTHER">Other</option>
          </select>
          <button disabled={loading} className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">Save</button>
        </form>
      )}

      {mode === "paySupplier" && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            post(`/api/supplier-payables/${payableId}/payments`, { amount, paymentDate: today, method });
          }}
        >
          <select className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={payableId} onChange={(e) => setPayableId(e.target.value)}>
            {payables.map((p) => (
              <option key={p.id} value={p.id}>{p.supplierName} — ${Number(p.amountPaid).toFixed(2)} / ${Number(p.amountDue).toFixed(2)}</option>
            ))}
          </select>
          <input type="number" min={0.01} step="0.01" required placeholder="Amount" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" value={method} onChange={(e) => setMethod(e.target.value as never)}>
            <option value="CASH">Cash</option><option value="BANK">Bank</option><option value="MOBILE_MONEY">Mobile money</option><option value="OTHER">Other</option>
          </select>
          <button disabled={loading} className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">Save</button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
