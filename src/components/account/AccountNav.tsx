"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, ShieldCheck, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/konto", label: "Pulpit", icon: LayoutGrid, exact: true },
  { href: "/konto/zamowienia", label: "Moje zamówienia", icon: Package, exact: false },
  { href: "/konto/dane", label: "Dane i adresy", icon: UserRound, exact: false },
  { href: "/konto/bezpieczenstwo", label: "Bezpieczeństwo", icon: ShieldCheck, exact: false },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu konta">
      <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-colors border whitespace-nowrap ${
                  active
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-card border-border/60 text-foreground hover:bg-muted/50 hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
