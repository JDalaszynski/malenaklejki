import Link from "next/link";
import { Layers } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton, StatTileSkeleton } from "@/components/admin/AdminSkeleton";
import { STATS_TABS, SectionTabs } from "@/components/admin/SectionTabs";
import { SkeletonBar } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Statystyki"
      subtitle="Czy klienci w ogóle zaglądają do gotowych zestawów i czy kończy się to koszykiem."
      label="Wczytywanie liczników zestawów…"
      actions={
        <Link
          href="/admin/zestawy"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <Layers className="w-4 h-4" aria-hidden />
          Zarządzaj zestawami
        </Link>
      }
    >
      <SectionTabs tabs={STATS_TABS} current="/admin/statystyki/zestawy" label="Widok statystyk" />

      <Card
        title="Czy klienci klikają w gotowe zestawy?"
        description="Liczy kliknięcia w kreatorze: otwarcie galerii, obejrzenie wzoru, wczytanie go do kreatora i dodanie zestawu do koszyka."
        actions={<SkeletonBar className="h-9 w-44 rounded-xl" />}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTileSkeleton hero />
          <StatTileSkeleton />
          <StatTileSkeleton />
          <StatTileSkeleton />
        </div>
        <SkeletonBar className="h-16 w-full rounded-xl mt-6" />
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <SkeletonBar className="h-40 w-full rounded-xl" />
          <SkeletonBar className="h-40 w-full rounded-xl" />
        </div>
      </Card>
    </AdminPageSkeleton>
  );
}
