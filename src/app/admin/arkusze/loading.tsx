import { Card } from "@/components/admin/AdminLayout";
import {
  AdminPageSkeleton,
  FiltersCardSkeleton,
  StatTileSkeleton,
} from "@/components/admin/AdminSkeleton";
import { SheetGridSkeleton } from "@/components/sheets/SheetsSkeletons";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Gotowe arkusze"
      subtitle="Arkusze tematyczne układane z naklejek z bazy. Opublikowane widać w kreatorze na stronie głównej, szkice tylko tutaj."
      label="Wczytywanie arkuszy…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTileSkeleton hero />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <FiltersCardSkeleton selects={0} />

      <Card title="Arkusze">
        <SheetGridSkeleton />
      </Card>
    </AdminPageSkeleton>
  );
}
