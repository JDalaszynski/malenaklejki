import { ChevronDown } from "lucide-react";

import { AdminLayout, Card } from "./AdminLayout";
import {
  SkeletonBar,
  SkeletonScreen,
  SkeletonSubtitle,
  SkeletonTitle,
} from "@/components/layout/Skeleton";

/**
 * Szkielet strony panelu.
 *
 * Panel czeka na Firestore dłużej niż sklep — statystyki przeliczają całą
 * historię sprzedaży, a lista użytkowników wchodzi do Firebase Auth. To tutaj
 * zastępniki robią największą różnicę.
 *
 * Nawigacja panelu zostaje prawdziwa i klikalna: wybór innej zakładki w
 * trakcie wczytywania przerywa poprzednie wejście, zamiast czekać na nie do
 * końca.
 */
export function AdminPageSkeleton({
  title,
  subtitle,
  actions,
  label,
  stickyHeader,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  label: string;
  stickyHeader?: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminLayout
      title={title ?? <SkeletonTitle />}
      subtitle={subtitle ?? <SkeletonSubtitle />}
      actions={actions}
      userBar={<AdminUserBarSkeleton />}
      stickyHeader={stickyHeader}
    >
      <SkeletonScreen label={label}>{children}</SkeletonScreen>
    </AdminLayout>
  );
}

/** Adres admina, wyjście do sklepu i wylogowanie — znane dopiero z sesji. */
function AdminUserBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SkeletonBar className="h-7 w-40 rounded-full" />
      <SkeletonBar className="h-9 w-20 rounded-xl" />
      <SkeletonBar className="h-9 w-24 rounded-xl" />
    </div>
  );
}

/** Kafelek liczbowy — etykieta, wartość, dopisek. */
export function StatTileSkeleton({
  hero = false,
  className = "",
}: {
  hero?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3.5 border shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${
        hero ? "bg-primary/10 border-primary/40" : "bg-card border-border/70"
      } ${className}`}
    >
      <SkeletonBar className="h-3 w-24" />
      <SkeletonBar className={`mt-2 w-28 ${hero ? "h-9 sm:h-10" : "h-7"}`} />
      <SkeletonBar className="h-3 w-32 mt-2" />
    </div>
  );
}

/**
 * Tabela panelu. Zamiast wiernie odwzorowywać szerokości kolumn rysujemy
 * równy raster — i tak nikt nie zdąży go przeczytać, a rozjazd z prawdziwą
 * tabelą byłby tym bardziej widoczny, im dłużej trwa wczytywanie.
 */
export function AdminTableSkeleton({
  headings,
  rows = 8,
}: {
  headings: string[];
  rows?: number;
}) {
  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {headings.map((heading) => (
              <th
                key={heading}
                className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-border/40">
              {headings.map((heading, column) => (
                <td key={heading} className="py-3.5 pr-4">
                  <SkeletonBar className={column === 0 ? "h-4 w-24" : "h-4 w-full min-w-10"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Karta zwinięta (`CollapsibleCard`). Rysujemy sam pasek nagłówka — dokładnie
 * tak wygląda po wejściu na stronę, więc po wczytaniu nic nie drgnie.
 */
export function CollapsedCardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-card border border-border/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
          <SkeletonBar className="h-4 w-80 max-w-full mt-2" />
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span className="hidden sm:inline">Rozwiń</span>
          <ChevronDown className="w-4 h-4" aria-hidden />
        </span>
      </div>
    </div>
  );
}

/**
 * Pasek filtrów nad tabelą: wyszukiwarka i rząd list rozwijanych. Filtry są
 * komponentem klienckim czytającym adres strony, więc na pierwsze wejście
 * czekają razem z danymi.
 */
export function FiltersCardSkeleton({
  selects = 6,
  gridClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
}: {
  selects?: number;
  gridClassName?: string;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <SkeletonBar className="h-11 flex-1 rounded-xl" />
          <SkeletonBar className="h-11 w-24 rounded-xl shrink-0" />
        </div>
        <div className={`grid gap-3 ${gridClassName}`}>
          {Array.from({ length: selects }, (_, index) => (
            <SkeletonBar key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </Card>
  );
}
