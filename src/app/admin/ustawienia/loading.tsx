import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar, SkeletonField } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Ustawienia sklepu"
      subtitle="Terminy i komunikaty dla klientów oraz widoczność gotowych zestawów. Każdą sekcję zapisujesz osobno."
      label="Wczytywanie ustawień sklepu…"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((index) => (
            <SkeletonBar key={index} className="h-[4.25rem] w-full rounded-xl" />
          ))}
        </div>

        <div className="flex flex-col gap-12 max-w-3xl min-w-0">
          {[0, 1, 2].map((section) => (
            <div key={section} className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <SkeletonBar className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <SkeletonBar className="h-7 w-64 max-w-full" />
                  <SkeletonBar className="h-4 w-full max-w-lg" />
                </div>
              </div>
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonField />
                  <SkeletonField />
                </div>
                <SkeletonBar className="h-20 w-full rounded-2xl mt-4" />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </AdminPageSkeleton>
  );
}
