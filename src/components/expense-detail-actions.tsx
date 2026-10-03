"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExpenseDetailActions({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this expense?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("Could not delete the expense.");
      return;
    }
    router.push("/expenses");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <button
        disabled={loading}
        onClick={onDelete}
        className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
