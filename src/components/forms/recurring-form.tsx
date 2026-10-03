"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; expenseKind: string | null };

export function RecurringForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"MONTHLY" | "WEEKLY" | "YEARLY">("MONTHLY");
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/expenses/recurring", {
      method: "POST",
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
    router.push("/expenses/recurring");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input required className="rounded-md border border-neutral-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select required className="rounded-md border border-neutral-300 px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.expenseKind === "PERSONAL" ? "Personal" : "Business"})</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Amount
        <input required type="number" min={0.01} step="0.01" className="rounded-md border border-neutral-300 px-3 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Frequency
        <select className="rounded-md border border-neutral-300 px-3 py-2" value={frequency} onChange={(e) => setFrequency(e.target.value as never)}>
          <option value="MONTHLY">Monthly</option>
          <option value="WEEKLY">Weekly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Next due date
        <input required type="date" className="rounded-md border border-neutral-300 px-3 py-2" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Day of month (optional)
        <input type="number" min={1} max={31} className="rounded-md border border-neutral-300 px-3 py-2" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="rounded-md border border-neutral-300 px-3 py-2" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving…" : "Save template"}
      </button>
    </form>
  );
}
