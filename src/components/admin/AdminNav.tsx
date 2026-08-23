"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSpreadsheet, PackagePlus, Receipt, Trash2 } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Zamówienia", icon: Receipt, exact: true },
  { href: "/admin/zamowienia/nowe", label: "Nowe zamówienie", icon: PackagePlus, exact: true },
  { href: "/admin/raporty", label: "Raporty", icon: FileSpreadsheet, exact: false },
  { href: "/admin/kosz", label: "Kosz", icon: Trash2, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sekcje panelu">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-colors border whitespace-nowrap ${
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
