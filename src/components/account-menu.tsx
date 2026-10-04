"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initial = (name?.trim()?.[0] ?? email?.[0] ?? "?").toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-40 w-56 rounded-md border border-border bg-background py-1 text-sm shadow-sm"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Link
            href="/settings/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 hover:bg-accent"
          >
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() =>
              authClient.signOut({
                fetchOptions: { onSuccess: () => { setOpen(false); router.push("/sign-in"); router.refresh(); } },
              })
            }
            className="block w-full px-3 py-2 text-left text-red-700 dark:text-red-400 hover:bg-accent"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
