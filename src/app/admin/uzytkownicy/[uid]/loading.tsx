import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

/** Ta sama tabela co na liście zamówień — karta konta pokazuje jej wycinek. */
const ORDER_HEADINGS = [
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

/** Wiersz „etykieta — wartość" z karty konta. */
function RowSkeleton() {
  return (
    <div className="flex justify-between gap-6 py-2.5 border-b border-border/40 last:border-b-0">
      <SkeletonBar className="h-4 w-32" />
      <SkeletonBar className="h-4 w-44" />
    </div>
  );
}

export default function Loading() {
  return (
    <AdminPageSkeleton
      label="Wczytywanie konta klienta…"
      actions={
        <Link
          href="/admin/uzytkownicy"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-11 px-5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista użytkowników
        </Link>
      }
    >
      <Card
        title="Konto"
        actions={
          <div className="flex flex-wrap gap-1.5">
            <SkeletonBar className="h-7 w-28 rounded-full" />
            <SkeletonBar className="h-7 w-24 rounded-full" />
          </div>
        }
      >
        <div className="flex flex-col">
          {[0, 1, 2, 3, 4].map((index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          <SkeletonBar className="h-11 w-40 rounded-xl" />
          <SkeletonBar className="h-11 w-36 rounded-xl" />
        </div>
      </Card>

      <Card title="Profil">
        <div className="flex flex-col">
          {[0, 1, 2, 3].map((index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
      </Card>

      <Card title="Zamówienia">
        <AdminTableSkeleton headings={ORDER_HEADINGS} rows={4} />
      </Card>
    </AdminPageSkeleton>
  );
}
