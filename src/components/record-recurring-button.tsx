"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export function RecordRecurringButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/expenses/recurring/${id}/record`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not record the expense.");
      }
    },
    onSuccess: () => {
      setRecorded(true);
      router.refresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not record the expense."),
  });

  return (
    <span className="flex flex-col items-end">
      <button
        disabled={mutation.isPending || !active}
        onClick={() => {
          setError(null);
          mutation.mutate();
        }}
        className="btn-secondary"
      >
        {mutation.isPending ? "Recording…" : "Record expense"}
      </button>
      {recorded && !error && <span className="mt-1 text-xs text-emerald-700">Recorded.</span>}
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}
