import { Card } from "@/components/admin/AdminLayout";
import {
  AdminPageSkeleton,
  FiltersCardSkeleton,
  StatTileSkeleton,
} from "@/components/admin/AdminSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Baza naklejek"
      subtitle="Wszystkie naklejki z gotowych arkuszy — z nazwą do wyszukiwania i ustawieniami, z jakimi trafiają na arkusz."
      label="Wczytywanie bazy naklejek…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTileSkeleton hero />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <FiltersCardSkeleton selects={3} gridClassName="grid-cols-1 sm:grid-cols-3" />

      <Card title="Naklejki">
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-card p-2">
              <SkeletonBar className="aspect-square w-full rounded-xl" />
              <SkeletonBar className="h-4 w-3/4 mt-2.5" />
              <SkeletonBar className="h-3 w-1/2 mt-1.5 mb-1" />
            </div>
          ))}
        </div>
      </Card>
    </AdminPageSkeleton>
  );
}
