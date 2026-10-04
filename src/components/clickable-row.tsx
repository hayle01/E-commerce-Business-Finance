"use client";

import { useRouter } from "next/navigation";

export function ClickableRow({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      tabIndex={0}
      role="link"
      aria-label={`Open ${href}`}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="cursor-pointer border-b border-border hover:bg-accent focus-visible:outline-2"
    >
      {children}
    </tr>
  );
}
