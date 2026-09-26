import { Card } from "@/components/admin/AdminLayout";
import { SkeletonBar } from "@/components/layout/Skeleton";

/** Kafelki arkuszy: podgląd A4 i dwie linijki opisu. */
export function SheetGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="bg-[#edf6f2] dark:bg-[#002c2e] p-4">
            <SkeletonBar className="mx-auto w-full max-w-[15rem] aspect-[210/297] rounded-md" />
          </div>
          <div className="p-4">
            <SkeletonBar className="h-5 w-40" />
            <SkeletonBar className="h-3 w-24 mt-2" />
            <SkeletonBar className="h-3 w-48 max-w-full mt-2.5" />
            <SkeletonBar className="h-9 w-full rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Edytor: wąska kolumna ustawień i arkusz obok — w tych samych proporcjach co gotowy widok. */
export function SheetEditorSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-[22rem] xl:w-[24rem] shrink-0 flex flex-col gap-6 order-2 lg:order-1">
        <Card title="Arkusz">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-11 w-full rounded-xl mt-2" />
          <SkeletonBar className="h-4 w-24 mt-4" />
          <SkeletonBar className="h-11 w-full rounded-xl mt-2" />
        </Card>
        <Card title="Dodaj naklejki">
          <SkeletonBar className="h-11 w-full rounded-2xl" />
          <SkeletonBar className="h-11 w-full rounded-xl mt-4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 mt-3">
            {Array.from({ length: 9 }, (_, index) => (
              <SkeletonBar key={index} className="aspect-square w-full rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3 order-1 lg:order-2">
        <div className="bg-card border border-border/70 rounded-2xl px-3 py-2.5 flex flex-wrap items-center gap-3">
          <SkeletonBar className="h-7 w-20 rounded-full" />
          <SkeletonBar className="h-8 w-28 mr-auto" />
          <SkeletonBar className="h-10 w-48 rounded-xl" />
          <SkeletonBar className="h-10 w-72 rounded-xl" />
        </div>
        <div
          className="w-full mx-auto"
          style={{ maxWidth: "max(22rem, calc((100dvh - 3.75rem - 2.25rem) * 0.7071))" }}
        >
          <SkeletonBar className="w-full aspect-[210/297] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
