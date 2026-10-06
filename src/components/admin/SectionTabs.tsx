import Link from "next/link";

export type SectionTab = {
  href: string;
  label: string;
  /** Liczba przy etykiecie — np. zamówień w koszu. */
  count?: number;
};

/**
 * Podzakładki w obrębie jednej zakładki panelu.
 *
 * To zwykłe linki, nie stan Reacta: każdy widok ma własny adres (da się go
 * odłożyć do zakładek przeglądarki), własny ekran wczytywania i pobiera
 * tylko swoje dane — zysk nie czeka na liczniki zestawów, a lista zamówień
 * nie czeka na kosz.
 */
export function SectionTabs({
  tabs,
  current,
  label,
}: {
  tabs: SectionTab[];
  /** `href` aktywnej podzakładki. */
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mt-1">
      <ul className="inline-flex max-w-full overflow-x-auto rounded-xl bg-muted/50 dark:bg-white/5 p-1 gap-1 border border-border/50">
        {tabs.map((tab) => {
          const active = tab.href === current;
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold transition-colors whitespace-nowrap ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-muted text-muted-foreground text-[11px] font-black tabular-nums">
                    {tab.count}
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

/** Zamówienia: lista i kosz to dwa widoki tych samych zamówień. */
export const ORDER_TABS: SectionTab[] = [
  { href: "/admin", label: "Aktywne" },
  { href: "/admin/kosz", label: "Kosz" },
];

/**
 * Statystyki: zysk, zainteresowanie gotowymi zestawami i ewidencja dla
 * księgowej odpowiadają na różne pytania, więc każda ma własny widok.
 */
export const STATS_TABS: SectionTab[] = [
  { href: "/admin/statystyki", label: "Zysk" },
  { href: "/admin/statystyki/zestawy", label: "Gotowe zestawy" },
  { href: "/admin/raporty", label: "Ewidencja sprzedaży" },
];
