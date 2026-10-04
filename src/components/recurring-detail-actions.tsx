"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecurringDetailActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/expenses/recurring/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not update the template.");
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <button disabled={loading} onClick={toggle} className="btn-secondary">
        {loading ? "Updating…" : isActive ? "Deactivate" : "Reactivate"}
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </span>
  );
}
