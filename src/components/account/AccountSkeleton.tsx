import { AccountLayout, Panel } from "./AccountLayout";
import {
  SkeletonBar,
  SkeletonField,
  SkeletonScreen,
  SkeletonSubtitle,
  SkeletonTitle,
} from "@/components/layout/Skeleton";

/**
 * Szkielet strony konta.
 *
 * Nagłówek sklepu, menu konta i stopka są prawdziwe — to statyczne
 * komponenty klienckie, na które nie trzeba czekać. Menu samo podświetla
 * zakładkę, do której użytkownik właśnie kliknął (czyta adres z `usePathname`),
 * więc ekran wczytywania od razu potwierdza, że nawigacja zadziałała.
 *
 * Tytuł podajemy prawdziwy wszędzie tam, gdzie jest stały — pasek zastępczy
 * zostaje tylko dla stron nazwanych danymi (powitanie po imieniu, numer
 * zamówienia).
 */
export function AccountPageSkeleton({
  title,
  subtitle,
  actions,
  label,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <AccountLayout
      title={title ?? <SkeletonTitle />}
      subtitle={subtitle ?? <SkeletonSubtitle />}
      actions={actions}
    >
      <SkeletonScreen label={label}>{children}</SkeletonScreen>
    </AccountLayout>
  );
}

/** Kafelek zamówienia na liście — miniatury, numer, statusy i kwota. */
export function OrderCardSkeleton() {
  return (
    <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex -space-x-3 shrink-0">
          {[0, 1, 2].map((index) => (
            <SkeletonBar key={index} className="w-16 h-16 rounded-xl border-2 border-card" />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <SkeletonBar className="h-4 w-36" />
          <SkeletonBar className="h-4 w-44 mt-2" />
          <div className="flex flex-wrap gap-2 mt-3">
            <SkeletonBar className="h-7 w-28 rounded-full" />
            <SkeletonBar className="h-7 w-24 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2 shrink-0">
          <SkeletonBar className="h-6 w-24" />
          <SkeletonBar className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Wiersz „etykieta — wartość" z podsumowań zamówienia. */
export function RowSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex justify-between gap-6 py-3 border-b border-border/40 last:border-b-0">
      <SkeletonBar className="h-4 w-28" />
      <SkeletonBar className={wide ? "h-4 w-48" : "h-4 w-32"} />
    </div>
  );
}

/** Karta formularza: tytuł jest znany, więc szkieletem są same pola. */
export function FormPanelSkeleton({
  title,
  description,
  fields,
  columns = 2,
}: {
  title: string;
  description?: string;
  fields: number;
  columns?: 1 | 2;
}) {
  return (
    <Panel title={title} description={description}>
      <div
        className={`grid gap-5 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {Array.from({ length: fields }, (_, index) => (
          <SkeletonField key={index} />
        ))}
      </div>
    </Panel>
  );
}
