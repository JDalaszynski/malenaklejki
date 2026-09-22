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
      title="Formularz"
      subtitle="Wiadomości z formularza kontaktowego i z zapytań o projekt naklejki — zapisywane niezależnie od poczty."
      label="Wczytywanie wiadomości…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTileSkeleton hero />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <FiltersCardSkeleton selects={3} gridClassName="grid-cols-1 sm:grid-cols-3" />

      <Card title="Wyniki">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
              <SkeletonBar className="h-5 w-40 rounded-full" />
              <SkeletonBar className="h-4 w-64 max-w-full mt-3" />
              <SkeletonBar className="h-3 w-40 mt-2" />
            </div>
          ))}
        </div>
      </Card>
    </AdminPageSkeleton>
  );
}
