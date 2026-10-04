"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; expenseKind: string | null };

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const personal = categories.filter((c) => c.expenseKind === "PERSONAL");
  const business = categories.filter((c) => c.expenseKind === "BUSINESS");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, amount, expenseDate, description: description || undefined, paymentMethod: method }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the expense.");
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">Category</p>
        <p className="mb-1 text-xs text-neutral-500">Personal</p>
        <div className="flex flex-wrap gap-1.5">
          {personal.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full border px-3 py-1 text-sm ${categoryId === c.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <p className="mb-1 mt-3 text-xs text-neutral-500">Business</p>
        <div className="flex flex-wrap gap-1.5">
          {business.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`rounded-full border px-3 py-1 text-sm ${categoryId === c.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Amount
        <input
          autoFocus
          required
          type="number"
          min={0.01}
          step="0.01"
          inputMode="decimal"
          className="input text-2xl py-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Date
        <input type="date" required className="input" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
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

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white py-3">
      <button disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Saving…" : "Save expense"}
      </button>
      </div>
    </form>
  );
}
