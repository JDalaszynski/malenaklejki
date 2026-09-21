import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { AdminSearchParams } from "@/lib/admin/filters";

/**
 * Numery stron do pokazania: zawsze pierwsza i ostatnia, okolice bieżącej,
 * a w miejsce wyciętego kawałka `null` (wielokropek). Przy kilku stronach
 * wypisujemy je wszystkie — skracanie zaczyna mieć sens dopiero od kilkunastu.
 */
function pageNumbers(current: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const around = new Set([1, pageCount, current - 1, current, current + 1]);
  const visible = [...around].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);

  const result: (number | null)[] = [];
  for (const [index, page] of visible.entries()) {
    if (index > 0 && page - visible[index - 1] > 1) result.push(null);
    result.push(page);
  }
  return result;
}

const linkClass =
  "inline-flex items-center justify-center gap-1.5 h-10 min-w-10 px-3 rounded-xl border border-border/70 bg-card text-sm font-bold text-foreground hover:bg-muted/50 hover:border-primary/40 transition-all";
const mutedClass =
  "inline-flex items-center justify-center gap-1.5 h-10 min-w-10 px-3 rounded-xl border border-border/40 bg-muted/25 text-sm font-bold text-muted-foreground/50";

/**
 * Przewijanie listy zamówień.
 *
 * Świadomie na zwykłych `<Link>`-ach, a nie na stanie klienta: numer strony
 * siedzi w adresie tak samo jak filtry, więc widok da się odłożyć do zakładek,
 * cofnąć przyciskiem przeglądarki i otworzyć w nowej karcie.
 */
export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  /** Ile zamówień pasuje do filtrów — do podpisu „pokazujemy X–Y z N”. */
  total: number;
  pageSize: number;
  basePath: string;
  /** Bieżące parametry adresu, żeby przewijanie nie gubiło filtrów. */
  params: AdminSearchParams;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "strona" || value === undefined) continue;
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item) next.append(key, item);
      }
    }
    if (target > 1) next.set("strona", String(target));
    const query = next.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Strony wyników"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-border/60"
    >
      <p className="text-sm font-medium text-muted-foreground tabular-nums">
        Pokazujemy {first}–{last} z {total}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {page > 1 ? (
          <Link href={href(page - 1)} rel="prev" className={linkClass}>
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Poprzednia
          </Link>
        ) : (
          <span className={mutedClass} aria-hidden>
            <ChevronLeft className="w-4 h-4" />
            Poprzednia
          </span>
        )}

        {pageNumbers(page, pageCount).map((target, index) =>
          target === null ? (
            <span
              key={`przerwa-${index}`}
              className="px-1 text-sm font-bold text-muted-foreground/60"
              aria-hidden
            >
              …
            </span>
          ) : target === page ? (
            <span
              key={target}
              aria-current="page"
              className="inline-flex items-center justify-center h-10 min-w-10 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold tabular-nums"
            >
              {target}
            </span>
          ) : (
            <Link
              key={target}
              href={href(target)}
              aria-label={`Strona ${target}`}
              className={`${linkClass} tabular-nums`}
            >
              {target}
            </Link>
          )
        )}

        {page < pageCount ? (
          <Link href={href(page + 1)} rel="next" className={linkClass}>
            Następna
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        ) : (
          <span className={mutedClass} aria-hidden>
            Następna
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
