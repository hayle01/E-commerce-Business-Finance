"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sales", label: "Sales" },
  { href: "/inventory", label: "Inventory" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/expenses", label: "Expenses" },
  { href: "/income", label: "Other Income" },
  { href: "/reports", label: "Reports" },
  { href: "/settings/account", label: "Settings" },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-neutral-100 font-medium" : "text-neutral-600 hover:bg-neutral-50"}`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-neutral-200 bg-white p-4 md:block">
      <p className="mb-4 px-3 text-sm font-semibold tracking-wide text-neutral-900">Commerce & Finance</p>
      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<"add" | "more" | null>(null);

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
            className="absolute inset-x-0 bottom-0 rounded-t-xl bg-white p-4"
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
                  <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm hover:bg-neutral-50" onClick={() => setSheet(null)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
            {sheet === "more" && (
              <div className="flex flex-col gap-1">
                {[
                  ["/inventory", "Inventory"],
                  ["/suppliers", "Suppliers"],
                  ["/income", "Other Income"],
                  ["/reports", "Reports"],
                  ["/settings/account", "Settings"],
                ].map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm hover:bg-neutral-50" onClick={() => setSheet(null)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white md:hidden">
        {tabs.map((tab) =>
          tab.href.startsWith("#") ? (
            <button
              key={tab.label}
              type="button"
              className="flex-1 py-3 text-center text-sm text-neutral-700"
              onClick={() => setSheet(sheet === tab.href.slice(1) ? null : (tab.href.slice(1) as "add" | "more"))}
            >
              {tab.label}
            </button>
          ) : (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex-1 py-3 text-center text-sm ${pathname.startsWith(tab.href) ? "font-medium text-neutral-900" : "text-neutral-500"}`}
            >
              {tab.label}
            </Link>
          )
        )}
      </nav>
    </>
  );
}
