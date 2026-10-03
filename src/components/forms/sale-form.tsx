"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toCents, fromCents } from "@/lib/money";

type Item = {
  id: string;
  name: string;
  supplierName: string;
  availableQuantity: number;
  sellingPrice: string;
  costPrice: string;
};

type Line = { item: Item; quantity: number; unitPrice: string };

export function SaleForm({ items, customers }: { items: Item[]; customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"DRAFT" | "CONFIRMED" | "DELIVERED">("DELIVERED");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK" | "MOBILE_MONEY" | "OTHER">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredItems = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10),
    [items, search]
  );

  function addLine(item: Item) {
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, quantity: Math.min(l.quantity + 1, item.availableQuantity) } : l
        );
      }
      return [...prev, { item, quantity: 1, unitPrice: item.sellingPrice }];
    });
    setSearch("");
  }

  const revenueCents = lines.reduce((s, l) => s + toCents(l.unitPrice || "0") * l.quantity, 0);
  const cogsCents = lines.reduce((s, l) => s + toCents(l.item.costPrice) * l.quantity, 0);
  const deliveryCents = toCents(deliveryCharge || "0");
  const totalCents = revenueCents + deliveryCents;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (paymentAmount && toCents(paymentAmount) > totalCents) {
      setError("Payment total cannot exceed the sale total.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId || undefined,
        customerName: !customerId && customerName ? customerName : undefined,
        saleDate,
        status,
        deliveryCharge: deliveryCharge || undefined,
        notes: notes || undefined,
        lines: lines.map((l) => ({ inventoryItemId: l.item.id, quantity: l.quantity, unitSellingPrice: l.unitPrice })),
        payment: paymentAmount
          ? { amount: paymentAmount, paymentDate: saleDate, method: paymentMethod }
          : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not create the sale.");
      return;
    }
    const { data } = await res.json();
    router.push(`/sales/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Customer
          <select className="rounded-md border border-neutral-300 px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in / new customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        {!customerId && (
          <label className="flex flex-col gap-1 text-sm">
            New customer name
            <input className="rounded-md border border-neutral-300 px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Date
          <input type="date" className="rounded-md border border-neutral-300 px-3 py-2" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select className="rounded-md border border-neutral-300 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as never)}>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </label>
      </div>

      <div>
        <input
          placeholder="Search inventory to add…"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <ul className="mt-1 divide-y divide-neutral-100 rounded-md border border-neutral-200">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button type="button" className="flex w-full justify-between px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => addLine(item)}>
                  <span>{item.name} · {item.supplierName}</span>
                  <span className="text-neutral-500">{item.availableQuantity} left · ${Number(item.sellingPrice).toFixed(2)}</span>
                </button>
              </li>
            ))}
            {filteredItems.length === 0 && <li className="px-3 py-2 text-sm text-neutral-500">No matching items.</li>}
          </ul>
        )}
      </div>

      {lines.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Qty</th>
              <th className="py-2 font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.item.id} className="border-b border-neutral-100">
                <td className="py-2">{line.item.name}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min={1}
                    max={line.item.availableQuantity}
                    className="w-20 rounded-md border border-neutral-300 px-2 py-1"
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l) =>
                          l.item.id === line.item.id
                            ? { ...l, quantity: Math.max(1, Math.min(Number(e.target.value) || 1, line.item.availableQuantity)) }
                            : l
                        )
                      )
                    }
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-28 rounded-md border border-neutral-300 px-2 py-1"
                    value={line.unitPrice}
                    onChange={(e) =>
                      setLines((prev) => prev.map((l) => (l.item.id === line.item.id ? { ...l, unitPrice: e.target.value } : l)))
                    }
                  />
                </td>
                <td className="py-2 text-right">${Number(fromCents(toCents(line.unitPrice || "0") * line.quantity)).toFixed(2)}</td>
                <td className="py-2 text-right">
                  <button type="button" className="text-neutral-400 underline" onClick={() => setLines((prev) => prev.filter((l) => l.item.id !== line.item.id))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="rounded-md border border-neutral-200 p-4 text-sm">
        <p>Revenue: <span className="float-right">${Number(fromCents(revenueCents)).toFixed(2)}</span></p>
        <p>COGS: <span className="float-right">${Number(fromCents(cogsCents)).toFixed(2)}</span></p>
        <p>Delivery charge: <span className="float-right">${Number(fromCents(deliveryCents)).toFixed(2)}</span></p>
        <p className="font-medium">Total: <span className="float-right">${Number(fromCents(totalCents)).toFixed(2)}</span></p>
        <p className="font-medium">Gross profit: <span className="float-right">${Number(fromCents(revenueCents - cogsCents)).toFixed(2)}</span></p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Delivery charge
        <input type="number" min={0} step="0.01" className="rounded-md border border-neutral-300 px-3 py-2" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Amount paid now
          <input type="number" min={0} step="0.01" className="rounded-md border border-neutral-300 px-3 py-2" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Payment method
          <select className="rounded-md border border-neutral-300 px-3 py-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as never)}>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea className="rounded-md border border-neutral-300 px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving…" : "Save sale"}
      </button>
    </form>
  );
}
