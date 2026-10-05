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
      title="Gotowe zestawy"
      subtitle="Zestawy tematyczne układane z naklejek z bazy. Opublikowane widać w kreatorze na stronie głównej, szkice tylko tutaj."
      label="Wczytywanie zestawów…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTileSkeleton hero />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <FiltersCardSkeleton selects={0} />

      <Card title="Zestawy">
        <SheetGridSkeleton />
      </Card>
    </AdminPageSkeleton>
  );
}
