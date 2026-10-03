"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export function IncomeForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, amount, incomeDate, description: description || undefined, paymentMethod: method }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the income.");
      return;
    }
    router.push("/income");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select required className="rounded-md border border-neutral-300 px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Amount
        <input autoFocus required type="number" min={0.01} step="0.01" inputMode="decimal" className="rounded-md border border-neutral-300 px-3 py-3 text-2xl" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Date
        <input required type="date" className="rounded-md border border-neutral-300 px-3 py-2" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <input className="rounded-md border border-neutral-300 px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Payment method
        <select className="rounded-md border border-neutral-300 px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value as never)}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE_MONEY">Mobile money</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving…" : "Save income"}
      </button>
    </form>
  );
}
