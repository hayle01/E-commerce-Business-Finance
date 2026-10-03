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
        <input required className="rounded-md border border-neutral-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Shop name (optional)
        <input className="rounded-md border border-neutral-300 px-3 py-2" value={shopName} onChange={(e) => setShopName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone (optional)
        <input className="rounded-md border border-neutral-300 px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Location (optional)
        <input className="rounded-md border border-neutral-300 px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Notes (optional)
        <textarea className="rounded-md border border-neutral-300 px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving…" : "Save supplier"}
      </button>
    </form>
  );
}
