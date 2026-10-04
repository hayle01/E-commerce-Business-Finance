"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; expenseKind: string | null };

export function RecurringForm({ categories, editId, initial }: { categories: Category[]; editId?: string; initial?: { name: string; categoryId: string; amount: string; frequency: "MONTHLY" | "WEEKLY" | "YEARLY"; nextDueDate: string; dayOfMonth: string; notes: string } }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [frequency, setFrequency] = useState<"MONTHLY" | "WEEKLY" | "YEARLY">(initial?.frequency ?? "MONTHLY");
  const [nextDueDate, setNextDueDate] = useState(initial?.nextDueDate ?? new Date().toISOString().slice(0, 10));
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(editId ? `/api/expenses/recurring/${editId}` : "/api/expenses/recurring", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId,
        amount,
        frequency,
        nextDueDate,
        dayOfMonth: dayOfMonth ? Number(dayOfMonth) : undefined,
        notes: notes || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the template.");
      return;
    }
    router.push(editId ? `/expenses/recurring/${editId}` : "/expenses/recurring");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select required className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.expenseKind === "PERSONAL" ? "Personal" : "Business"})</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Amount
        <input required type="number" min={0.01} step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Frequency
        <select className="input" value={frequency} onChange={(e) => setFrequency(e.target.value as never)}>
          <option value="MONTHLY">Monthly</option>
          <option value="WEEKLY">Weekly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Next due date
        <input required type="date" className="input" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Day of month (optional)
        <input type="number" min={1} max={31} className="input" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white py-3">
      <button disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Saving…" : editId ? "Save changes" : "Save template"}
      </button>
      </div>
    </form>
  );
}
