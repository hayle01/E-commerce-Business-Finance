"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

export function ExpenseDetailActions({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete the expense.");
    },
    onSuccess: () => {
      router.push("/expenses");
      router.refresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not delete the expense."),
  });

  return (
    <div className="mt-6">
      <button
        disabled={mutation.isPending}
        onClick={() => {
          if (confirm("Delete this expense?")) mutation.mutate();
        }}
        className="btn-danger"
      >
        {mutation.isPending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
