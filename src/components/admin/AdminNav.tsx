"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Inbox,
  Layers,
  PackagePlus,
  Receipt,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

const MESSAGES_HREF = "/admin/formularz";

const ITEMS = [
  { href: "/admin", label: "Zamówienia", icon: Receipt, exact: true },
  { href: "/admin/zamowienia/nowe", label: "Nowe zamówienie", icon: PackagePlus, exact: true },
  { href: "/admin/arkusze", label: "Arkusze", icon: Layers, exact: false },
  { href: MESSAGES_HREF, label: "Formularz", icon: Inbox, exact: false },
  { href: "/admin/uzytkownicy", label: "Użytkownicy", icon: Users, exact: false },
  { href: "/admin/statystyki", label: "Statystyki", icon: BarChart3, exact: false },
  { href: "/admin/raporty", label: "Raporty", icon: FileSpreadsheet, exact: false },
  { href: "/admin/kosz", label: "Kosz", icon: Trash2, exact: false },
  { href: "/admin/ustawienia", label: "Ustawienia", icon: Settings, exact: false },
];

/**
 * Liczba nieodhaczonych wiadomości z formularzy.
 *
 * Dociągana po wyrysowaniu nawigacji, a nie razem ze stroną: ten sam pasek
 * wisi nad każdą sekcją panelu i nad każdym ekranem wczytywania, więc
 * zapytanie do bazy w tym miejscu opóźniałoby je wszystkie. Cicha porażka
 * jest w porządku — bez odpowiedzi po prostu nie ma odznaki.
 */
function useNewMessagesCount(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let aborted = false;

    fetch("/api/admin/nowe-wiadomosci", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!aborted && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});

    return () => {
      aborted = true;
    };
    // Odświeżamy przy zmianie sekcji — po odhaczeniu wiadomości licznik
    // nie może zostać na starej wartości.
  }, [pathname]);

  return count;
}

export function AdminNav() {
  const pathname = usePathname();
  const newMessages = useNewMessagesCount();

  return (
    <nav aria-label="Sekcje panelu">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badge = href === MESSAGES_HREF && newMessages > 0 ? newMessages : 0;

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
                {badge > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-black tabular-nums"
                    aria-label={`${badge} nowych wiadomości`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
