"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DateRangePicker({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return;
    router.push(`${basePath}?preset=custom&from=${from}&to=${to}`);
  }

  return (
    <form onSubmit={apply} className="flex items-center gap-2">
      <input type="date" aria-label="From" required className="input px-2 py-1.5" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input type="date" aria-label="To" required className="input px-2 py-1.5" value={to} onChange={(e) => setTo(e.target.value)} />
      <button className="btn-secondary">Apply</button>
    </form>
  );
}
