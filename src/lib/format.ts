import { format } from "date-fns";

export function formatMoney(value: unknown): string {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export function formatDate(value: Date | string): string {
  return format(new Date(value), "dd MMM yyyy");
}

export function formatDateTime(value: Date | string): string {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}
