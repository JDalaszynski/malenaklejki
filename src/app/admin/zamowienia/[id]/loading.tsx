import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar, SkeletonLines } from "@/components/layout/Skeleton";

/**
 * Szczegóły zamówienia — te same bloki co na stronie: pasek z danymi
 * zamówienia, pliki i realizacja obok siebie, pod nimi faktura i rachunek.
 * Numer zamówienia i statusy zostają paskami, a powrót na listę jest
 * prawdziwy, więc z ekranu wczytywania da się wyjść.
 */
export default function Loading() {
  return (
    <AdminPageSkeleton
      compact
      label="Wczytywanie zamówienia…"
      subtitle={<SkeletonBar className="h-5 w-48" />}
      meta={
        <div className="flex flex-wrap items-center gap-1.5">
          {["w-24", "w-28", "w-24"].map((width, index) => (
            <SkeletonBar key={index} className={`h-7 rounded-full ${width}`} />
          ))}
        </div>
      }
      actions={
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-10 px-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista zamówień
        </Link>
      }
    >
      <Card dense>
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index}>
              <SkeletonBar className="h-3 w-16 mb-3" />
              <SkeletonBar className="h-5 w-32" />
              <SkeletonBar className="h-4 w-40 mt-2.5" />
              <SkeletonBar className="h-4 w-36 mt-2" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <Card
            dense
            title="Pliki produkcyjne"
            actions={<SkeletonBar className="h-11 w-36 rounded-xl" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1].map((index) => (
                <div key={index} className="flex gap-4 rounded-2xl border border-border/60 bg-muted/15 p-3">
                  <SkeletonBar className="w-28 sm:w-32 aspect-[210/297] rounded-xl shrink-0" />
                  <div className="flex-1 pt-1">
                    <SkeletonBar className="h-5 w-24" />
                    <SkeletonBar className="h-5 w-16 mt-2" />
                    <SkeletonBar className="h-4 w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Card dense title="Faktura">
              <SkeletonLines count={2} />
              <SkeletonBar className="h-10 w-40 rounded-xl mt-3" />
            </Card>
            <Card dense title="Rachunek">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index}>
                    <SkeletonBar className="h-3 w-20" />
                    <SkeletonBar className="h-5 w-20 mt-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card dense title="Realizacja">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <SkeletonBar className="h-4 w-28 mb-2" />
                <SkeletonBar className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <SkeletonBar className="h-10 w-36 rounded-xl mt-4" />
        </Card>
      </div>

      <div className="bg-card border border-border/70 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-foreground">Edycja zamówienia</h2>
        <SkeletonBar className="h-4 w-72 max-w-full mt-2" />
      </div>
    </AdminPageSkeleton>
  );
}
