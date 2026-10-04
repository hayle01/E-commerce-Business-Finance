"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Payable = { id: string; supplierName: string; amountDue: string; amountPaid: string; status: string };

export function SaleActions({ saleId, status, paymentStatus, payables }: { saleId: string; status: string; paymentStatus: string; payables: Payable[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"payment" | "paySupplier" | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [payableId, setPayableId] = useState(payables[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<"deliver" | "cancel" | "return" | null>(null);

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
  const hasRecordedCustomerPayments = paymentStatus === "PARTIAL" || paymentStatus === "PAID";
  const canCloseAndReverse = status !== "CANCELLED" && status !== "RETURNED" && !(status === "DELIVERED" && hasRecordedCustomerPayments);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {(status === "DRAFT" || status === "CONFIRMED") && (
          <button className="btn-primary" onClick={() => setConfirm("deliver")}>
            Mark delivered
          </button>
        )}
        {canCloseAndReverse && (
          <button className="btn-danger" onClick={() => setConfirm("cancel")}>
            Cancel
          </button>
        )}
        {status === "DELIVERED" && !hasRecordedCustomerPayments && (
          <button className="btn-warning" onClick={() => setConfirm("return")}>
            Return
          </button>
        )}
        {status !== "CANCELLED" && status !== "RETURNED" && paymentStatus !== "PAID" && (
          <button className="btn-primary" onClick={() => setMode(mode === "payment" ? null : "payment")}>
            Record payment
          </button>
        )}
        {payables.length > 0 && payables.some((p) => p.status !== "PAID") && (
          <button className="btn-secondary" onClick={() => setMode(mode === "paySupplier" ? null : "paySupplier")}>
            Pay supplier
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        tone={confirm === "cancel" ? "danger" : "default"}
        title={confirm === "deliver" ? "Mark sale as delivered?" : confirm === "cancel" ? "Cancel this sale?" : "Return this sale?"}
        description={
          confirm === "deliver"
            ? "This will decrement stock and create supplier payables. You cannot undo this."
            : confirm === "cancel"
              ? "A delivered sale has its stock restored and unpaid payables removed. This cannot be undone."
              : "This will restore stock and reverse related payables for the delivery. This cannot be undone."
        }
        confirmLabel={confirm === "deliver" ? "Mark delivered" : confirm === "cancel" ? "Cancel sale" : "Return sale"}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm === "deliver") await post(`/api/sales/${saleId}/complete`, {});
          else if (confirm === "cancel") await post(`/api/sales/${saleId}/cancel`, { outcome: "CANCELLED" });
          else if (confirm === "return") await post(`/api/sales/${saleId}/cancel`, { outcome: "RETURNED" });
          setConfirm(null);
        }}
      />

      {mode === "payment" && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            post(`/api/sales/${saleId}/payments`, { amount, paymentDate: today, method });
          }}
        >
          <input type="number" min={0.01} step="0.01" required placeholder="Amount" className="input px-2 py-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="input px-2 py-1.5" value={method} onChange={(e) => setMethod(e.target.value as never)}>
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
          <select className="input px-2 py-1.5" value={payableId} onChange={(e) => setPayableId(e.target.value)}>
            {payables.map((p) => (
              <option key={p.id} value={p.id}>{p.supplierName} — ${Number(p.amountPaid).toFixed(2)} / ${Number(p.amountDue).toFixed(2)}</option>
            ))}
          </select>
          <input type="number" min={0.01} step="0.01" required placeholder="Amount" className="input px-2 py-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select className="input px-2 py-1.5" value={method} onChange={(e) => setMethod(e.target.value as never)}>
            <option value="CASH">Cash</option><option value="BANK">Bank</option><option value="MOBILE_MONEY">Mobile money</option><option value="OTHER">Other</option>
          </select>
          <button disabled={loading} className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">Save</button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
