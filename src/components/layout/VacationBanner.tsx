"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { CalendarClock, Palmtree, TriangleAlert, X } from "lucide-react";

import { pausedOrdersMessage, type ResolvedVacation, type VacationTone } from "@/lib/settings/vacation";
import { useVacation } from "./VacationProvider";

const DISMISS_KEY = "przerwa-urlopowa-zamknieta";

const TONES: Record<VacationTone, { wrapper: string; badge: string; icon: string; close: string }> = {
  info: {
    wrapper: "bg-primary/10 border-primary/30 text-foreground",
    badge: "bg-primary/15 text-primary border-primary/25",
    icon: "bg-primary/15 text-primary",
    close: "text-primary/70 hover:text-primary hover:bg-primary/15",
  },
  warning: {
    wrapper: "bg-destructive/10 border-destructive/30 text-foreground",
    badge: "bg-destructive/15 text-destructive border-destructive/25",
    icon: "bg-destructive/15 text-destructive",
    close: "text-destructive/70 hover:text-destructive hover:bg-destructive/15",
  },
};

/** Krótkie podsumowanie w prawym rogu: „zostały 3 dni" / „start za 5 dni". */
function countdownLabel(info: ResolvedVacation): string | null {
  if (info.status === "upcoming" && info.daysUntilStart !== null) {
    if (info.daysUntilStart === 0) return "start dzisiaj";
    if (info.daysUntilStart === 1) return "start jutro";
    return `start za ${info.daysUntilStart} dni`;
  }
  if (info.status === "active" && info.daysUntilReturn !== null) {
    if (info.daysUntilReturn <= 1) return "wracamy jutro";
    return `wracamy za ${info.daysUntilReturn} dni`;
  }
  return null;
}

/**
 * Pasek informacyjny nad nagłówkiem sklepu.
 *
 * Zamknięcie zapamiętujemy tylko na czas sesji przeglądarki i wiążemy je
 * z wersją ustawień — po zmianie treści w panelu baner wraca także tym
 * osobom, które go wcześniej odłożyły.
 */
export function VacationBanner() {
  const info = useVacation();
  const pathname = usePathname();
  const [closedNow, setClosedNow] = useState(false);

  // Pamięć sesji jest niedostępna przy renderowaniu na serwerze, więc czytamy
  // ją migawką — HTML wychodzi z banerem, a po hydratacji znika u osób, które
  // już go zamknęły.
  const storedVersion = useSyncExternalStore(subscribeNever, readDismissedVersion, () => null);

  // Panel administratora ma własny widok ustawień; klientowski pasek tylko
  // zabierałby tam miejsce.
  if (pathname?.startsWith("/admin")) return null;
  if (!info.visible || closedNow || storedVersion === info.version) return null;

  const close = () => {
    setClosedNow(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, info.version);
    } catch {
      /* brak pamięci sesji nie może wywrócić zamykania */
    }
  };

  return <VacationBannerView info={info} onClose={close} />;
}

function readDismissedVersion(): string | null {
  try {
    return sessionStorage.getItem(DISMISS_KEY);
  } catch {
    /* tryb prywatny — baner po prostu zostaje widoczny */
    return null;
  }
}

/** Zamknięcie zapisujemy sami, więc nie ma czego nasłuchiwać. */
function subscribeNever(): () => void {
  return () => {};
}

/**
 * Sam wygląd paska, bez decyzji „pokazać czy nie".
 *
 * Wydzielony, bo dokładnie ten sam widok służy za podgląd na żywo w panelu —
 * administrator ma widzieć to, co zobaczy klient, a nie przybliżenie.
 */
export function VacationBannerView({
  info,
  onClose,
}: {
  info: ResolvedVacation;
  onClose?: () => void;
}) {
  const tone = TONES[info.tone];
  const countdown = countdownLabel(info);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div
        role="status"
        className={`relative flex items-start gap-3 sm:gap-4 rounded-2xl border px-4 py-3.5 sm:px-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${tone.wrapper}`}
      >
        <span className={`shrink-0 p-2 rounded-xl ${tone.icon}`} aria-hidden>
          {info.status === "upcoming" ? (
            <CalendarClock className="w-5 h-5" />
          ) : (
            <Palmtree className="w-5 h-5" />
          )}
        </span>

        <div className="flex-1 min-w-0 pr-6 sm:pr-8">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="font-extrabold text-sm sm:text-base leading-tight">{info.title}</h2>
            {info.rangeLabel && (
              <span
                className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-black uppercase tracking-wide ${tone.badge}`}
              >
                {info.rangeLabel}
              </span>
            )}
            {countdown && (
              <span className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                {countdown}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-relaxed mt-1">
            {info.message}
          </p>
          {info.pauseOrders && (
            <p className="flex items-start gap-1.5 text-xs font-bold text-destructive mt-2">
              <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
              <span>{pausedOrdersMessage(info)}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij informację o przerwie urlopowej"
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl transition-all cursor-pointer ${tone.close}`}
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/**
 * Ta sama informacja w wersji wbudowanej w stronę — koszyk i kasa.
 *
 * Tutaj nie da się jej zamknąć: to ostatni moment, w którym klient powinien
 * zobaczyć, kiedy realnie dostanie paczkę.
 */
export function VacationNotice({ className = "" }: { className?: string }) {
  const info = useVacation();
  if (!info.visible) return null;

  const tone = TONES[info.tone];

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${tone.wrapper} ${className}`}
    >
      <span className={`shrink-0 p-2 rounded-xl ${tone.icon}`} aria-hidden>
        <Palmtree className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="font-extrabold text-sm leading-tight">
          {info.title}
          {info.rangeLabel && (
            <span className="font-black text-[11px] uppercase tracking-wide text-muted-foreground ml-2">
              {info.rangeLabel}
            </span>
          )}
        </p>
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed mt-1">
          {info.pauseOrders ? pausedOrdersMessage(info) : info.message}
        </p>
      </div>
    </div>
  );
}
