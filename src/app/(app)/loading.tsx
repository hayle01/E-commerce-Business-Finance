import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-4 md:p-6">
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-px border border-neutral-200 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-none" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64" />
    </main>
  );
}
