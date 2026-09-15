import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Panel } from "@/components/account/AccountLayout";
import { AccountPageSkeleton, RowSkeleton } from "@/components/account/AccountSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

/**
 * Szczegóły zamówienia. Nagłówkiem jest numer zamówienia, więc zostaje pasek,
 * ale powrót do listy jest prawdziwy — z ekranu wczytywania da się wyjść.
 */
export default function Loading() {
  return (
    <AccountPageSkeleton
      label="Wczytywanie szczegółów zamówienia…"
      actions={
        <Link
          href="/konto/zamowienia"
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2.5 rounded-xl border border-border/60 self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden />
          Wszystkie zamówienia
        </Link>
      }
    >
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-7 w-28 rounded-full" />
          <SkeletonBar className="h-7 w-32 rounded-full" />
        </div>
      </Panel>

      <Panel
        title="Zamówione arkusze"
        description="Każdy arkusz możesz zamówić ponownie — trafi do koszyka jako nowa pozycja."
      >
        <div className="flex flex-col gap-4">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl border border-border/60 bg-muted/15"
            >
              <SkeletonBar className="w-28 h-28 shrink-0 rounded-xl" />
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <SkeletonBar className="h-5 w-28" />
                <SkeletonBar className="h-4 w-full max-w-md" />
                <div className="flex flex-wrap gap-2 mt-1">
                  <SkeletonBar className="h-10 w-36 rounded-xl" />
                  <SkeletonBar className="h-10 w-32 rounded-xl" />
                </div>
              </div>
              <SkeletonBar className="h-6 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Dostawa i płatność">
          <div className="flex flex-col">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <RowSkeleton key={index} wide={index === 1} />
            ))}
          </div>
        </Panel>

        <Panel title="Podsumowanie">
          <div className="flex flex-col">
            <RowSkeleton />
            <RowSkeleton />
          </div>
          <div className="flex justify-between items-center pt-4 mt-3 border-t border-border/60">
            <SkeletonBar className="h-5 w-20" />
            <SkeletonBar className="h-8 w-32" />
          </div>
        </Panel>
      </div>
    </AccountPageSkeleton>
  );
}
