"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export function IncomeForm({ categories, editId, initial }: { categories: Category[]; editId?: string; initial?: { categoryId: string; incomeKind: "BUSINESS" | "PERSONAL"; amount: string; incomeDate: string; description: string; paymentMethod: "CASH" | "BANK" | "MOBILE_MONEY" | "OTHER" } }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [incomeDate, setIncomeDate] = useState(initial?.incomeDate ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">(initial?.paymentMethod ?? "CASH");
  const [incomeKind, setIncomeKind] = useState<"BUSINESS" | "PERSONAL">(initial?.incomeKind ?? "BUSINESS");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(editId ? `/api/income/${editId}` : "/api/income", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, incomeKind, amount, incomeDate, description: description || undefined, paymentMethod: method }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the income.");
      return;
    }
    if (editId) {
      router.push(`/income/${editId}`);
    } else {
      router.push("/income");
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select required className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Kind
        <select className="input" value={incomeKind} onChange={(e) => setIncomeKind(e.target.value as never)}>
          <option value="BUSINESS">Business income</option>
          <option value="PERSONAL">Personal income</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Amount
        <input autoFocus required type="number" min={0.01} step="0.01" inputMode="decimal" className="input text-2xl py-3" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input required type="date" className="input" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Payment method
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value as never)}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE_MONEY">Mobile money</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="sticky bottom-0 border-t border-border bg-background py-3">
      <button disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Saving…" : editId ? "Save changes" : "Save income"}
      </button>
      </div>
    </form>
  );
}
