"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecordRecurringButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function record() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/expenses/recurring/${id}/record`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not record the expense.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="flex flex-col items-end">
      <button
        disabled={loading || !active}
        onClick={record}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? "Recording…" : "Record expense"}
      </button>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}
