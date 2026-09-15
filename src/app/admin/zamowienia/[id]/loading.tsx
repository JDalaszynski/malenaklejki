import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar, SkeletonLines } from "@/components/layout/Skeleton";

/**
 * Szczegóły zamówienia. Nagłówek to numer zamówienia, a podtytuł składa datę,
 * kwotę i e-mail klienta — jedno i drugie zostaje paskiem. Powrót na listę
 * jest prawdziwy, więc z ekranu wczytywania da się wyjść.
 */
export default function Loading() {
  return (
    <AdminPageSkeleton
      label="Wczytywanie zamówienia…"
      actions={
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-11 px-5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista zamówień
        </Link>
      }
    >
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {["w-28", "w-32", "w-24", "w-36", "w-28"].map((width, index) => (
            <SkeletonBar key={index} className={`h-7 rounded-full ${width}`} />
          ))}
        </div>
      </Card>

      <Card
        title="Statusy"
        description="Ręczna zmiana działa tak samo jak zaksięgowanie płatności online."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <SkeletonBar className="h-3 w-24 mb-2" />
              <SkeletonBar className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rachunek zamówienia">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="h-6 w-24 mt-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Faktura"
        description="inFakt wystawia ją automatycznie po zaksięgowaniu płatności. Faktura nigdzie nie jest wysyłana."
      >
        <SkeletonLines count={2} />
        <SkeletonBar className="h-11 w-48 rounded-xl mt-4" />
      </Card>

      <Card
        title="Pliki produkcyjne"
        description="Podgląd i wersja z liniami cięcia. Lista zamówień celowo ich nie ładuje."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-muted/15 p-4">
              <SkeletonBar className="aspect-square w-full rounded-xl" />
              <SkeletonBar className="h-4 w-32 mt-3" />
              <SkeletonBar className="h-10 w-full rounded-xl mt-3" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Dziennik zmian" description="Kto, kiedy i co zmienił w tym zamówieniu.">
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex justify-between gap-6 py-2 border-b border-border/40 last:border-b-0"
            >
              <SkeletonBar className="h-4 w-56" />
              <SkeletonBar className="h-4 w-32 shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </AdminPageSkeleton>
  );
}
