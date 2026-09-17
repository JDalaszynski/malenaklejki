import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

const HEADINGS = [
  "Lp",
  "Nr zamówienia",
  "Nr faktury",
  "Data sprzedaży",
  "Data zapłaty",
  "Nabywca",
  "Towar",
  "Netto",
  "VAT",
  "Kwota VAT",
  "Brutto",
  "Płatność",
  "ID transakcji",
];

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Ewidencja sprzedaży"
      subtitle="Podgląd jest tym samym, co trafi do plików CSV i PDF — sprawdź, zanim wyślesz księgowej."
      label="Wczytywanie ewidencji sprzedaży…"
    >
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <SkeletonBar className="h-4 w-16 mb-2" />
            <SkeletonBar className="h-12 w-48 rounded-xl" />
          </div>
          <SkeletonBar className="h-5 w-64 sm:mb-3" />
          <div className="flex gap-2 sm:ml-auto">
            <SkeletonBar className="h-12 w-40 rounded-xl" />
            <SkeletonBar className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="border-b border-border/60 pb-4 mb-4">
          <SkeletonBar className="h-5 w-96 max-w-full" />
          <SkeletonBar className="h-4 w-80 max-w-full mt-2" />
          <SkeletonBar className="h-4 w-72 max-w-full mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-6 w-24 mt-1.5" />
            </div>
          ))}
        </div>

        <AdminTableSkeleton headings={HEADINGS} rows={6} />
      </Card>
    </AdminPageSkeleton>
  );
}
