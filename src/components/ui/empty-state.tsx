import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-4 inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
