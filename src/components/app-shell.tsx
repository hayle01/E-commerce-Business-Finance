"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sales", label: "Sales" },
  { href: "/inventory", label: "Products" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/expenses", label: "Expenses" },
  { href: "/income", label: "Other Income" },
  { href: "/reports", label: "Reports" },
  { href: "/settings/account", label: "Settings" },
];

export function MobileTopBar({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-none md:hidden">
      <p className="text-sm font-semibold">Commerce & Finance</p>
      <ThemeToggle />
      <AccountMenu name={userName} email={userEmail} />
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-border bg-background p-4 md:block">
      <p className="mb-4 px-3 text-sm font-semibold tracking-wide text-foreground">Commerce & Finance</p>
      <nav aria-label="Primary" className="flex flex-col gap-1">
        {MAIN_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-accent"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<"add" | "more" | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSheet(null);
    }
    if (sheet) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet]);

  const tabs = [
    { href: "/dashboard", label: "Home" },
    { href: "/sales", label: "Sales" },
    { href: "#add", label: "Add" },
    { href: "/expenses", label: "Expenses" },
    { href: "#more", label: "More" },
  ];

  return (
    <>
      {sheet && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSheet(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={sheet === "add" ? "Quick add" : "More"}
            className="absolute inset-x-0 bottom-0 rounded-t-xl bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            {sheet === "add" && (
              <div className="flex flex-col gap-1">
                {[
                  ["/sales/new", "New Sale"],
                  ["/expenses/new", "New Expense"],
                  ["/inventory/new", "New Inventory Item"],
                  ["/income/new", "New Other Income"],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm hover:bg-accent" onClick={() => setSheet(null)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
            {sheet === "more" && (
              <div className="flex flex-col gap-1">
                {[
                  ["/inventory", "Products"],
                  ["/suppliers", "Suppliers"],
                  ["/income", "Other Income"],
                  ["/reports", "Reports"],
                  ["/settings/account", "Settings"],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm hover:bg-accent" onClick={() => setSheet(null)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        {tabs.map((tab) =>
          tab.href.startsWith("#") ? (
            <button
              key={tab.label}
              type="button"
              aria-expanded={sheet === tab.href.slice(1)}
              className="flex-1 py-3 text-center text-sm text-foreground"
              onClick={() => setSheet(sheet === tab.href.slice(1) ? null : (tab.href.slice(1) as "add" | "more"))}
            >
              {tab.label}
            </button>
          ) : (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={pathname.startsWith(tab.href) ? "page" : undefined}
              className={`flex-1 py-3 text-center text-sm ${pathname.startsWith(tab.href) ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {tab.label}
            </Link>
          )
        )}
      </nav>
    </>
  );
}
