import { Card } from "@/components/admin/AdminLayout";
import {
  AdminPageSkeleton,
  CollapsedCardSkeleton,
  StatTileSkeleton,
} from "@/components/admin/AdminSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

/**
 * Najdłużej wczytywana strona panelu: liczy zysk z całej historii sprzedaży,
 * więc czekanie bez zastępnika jest tu najbardziej odczuwalne.
 */
export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Statystyki"
      subtitle="Opłacone zamówienia i sprzedaż dopisana ręcznie: przychód netto minus koszty, składka zdrowotna i PIT na skali."
      label="Wczytywanie statystyk…"
    >
      <Card
        title="Zysk"
        description={<SkeletonBar className="h-4 w-64 max-w-full mt-1" />}
        actions={<SkeletonBar className="h-10 w-56 rounded-xl" />}
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatTileSkeleton hero className="col-span-2" />
          <StatTileSkeleton />
          <StatTileSkeleton />
          <StatTileSkeleton />
        </div>
        <SkeletonBar className="h-4 w-72 max-w-full mt-4" />
      </Card>

      <Card
        title="Ostatnie 12 miesięcy"
        description={<SkeletonBar className="h-4 w-80 max-w-full mt-1" />}
        actions={<SkeletonBar className="h-10 w-32 rounded-xl" />}
      >
        <SkeletonBar className="h-56 w-full rounded-2xl" />
      </Card>

      <CollapsedCardSkeleton title="Jak liczymy zysk" />

      <CollapsedCardSkeleton title="Sprzedaż poza sklepem" />
    </AdminPageSkeleton>
  );
}
