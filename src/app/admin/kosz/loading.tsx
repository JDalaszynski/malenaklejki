import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { ORDER_TABS, SectionTabs } from "@/components/admin/SectionTabs";
import {
  AdminPageSkeleton,
  AdminTableSkeleton,
  FiltersCardSkeleton,
} from "@/components/admin/AdminSkeleton";

const HEADINGS = [
  "Numer",
  "Data",
  "Klient",
  "Kwota",
  "Zysk",
  "Płatność",
  "Base",
  "Faktura",
  "Mail realiz.",
  "Mail wysł.",
  "Metoda",
  " ",
];

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Zamówienia"
      subtitle="Kosz: zamówienia usunięte z listy. Nie wchodzą do raportów, ale wciąż można je przywrócić."
      label="Wczytywanie kosza…"
      actions={
        <Link
          href="/admin/zamowienia/nowe"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all"
        >
          <PackagePlus className="w-4 h-4" aria-hidden />
          Nowe zamówienie
        </Link>
      }
    >
      <SectionTabs tabs={ORDER_TABS} current="/admin/kosz" label="Widok zamówień" />

      <FiltersCardSkeleton />

      <Card title="W koszu">
        <AdminTableSkeleton headings={HEADINGS} rows={5} />
      </Card>
    </AdminPageSkeleton>
  );
}
