"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupplierForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, shopName: shopName || undefined, phone: phone || undefined, location: location || undefined, notes: notes || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not save the supplier.");
      return;
    }
    const { data } = await res.json();
    router.push(`/suppliers/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Shop name (optional)
        <input className="input" value={shopName} onChange={(e) => setShopName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone (optional)
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Location (optional)
        <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes (optional)
        <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="sticky bottom-0 border-t border-border bg-background py-3">
      <button disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? "Saving…" : "Save supplier"}
      </button>
      </div>
    </form>
  );
}
