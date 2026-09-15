import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar, SkeletonField } from "@/components/layout/Skeleton";

/** Rząd pól formularza zamówienia. */
function FieldsSkeleton({ count, columns }: { count: number; columns: string }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonField key={index} />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Nowe zamówienie"
      subtitle="Sprzedaż spoza sklepu — trafi do ewidencji, raportu i (na żądanie) do BaseLinkera."
      label="Wczytywanie formularza zamówienia…"
      actions={
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-11 px-5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista zamówień
        </Link>
      }
    >
      <Card title="Zamówienie" description="Dane potrzebne do rozliczenia i raportu.">
        <FieldsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-4" />
      </Card>

      <Card title="Klient">
        <FieldsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
      </Card>

      <Card title="Dostawa">
        <FieldsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
      </Card>

      <Card title="Płatność i faktura">
        <FieldsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
      </Card>

      <Card
        title="Pozycje"
        description="Ceny brutto. Nazwa trafia do raportu i do BaseLinkera."
        actions={<SkeletonBar className="h-10 w-44 rounded-xl" />}
      >
        <FieldsSkeleton count={4} columns="grid-cols-1 sm:grid-cols-4" />
      </Card>

      <Card title="Notatka wewnętrzna" description="Widoczna tylko w panelu.">
        <SkeletonBar className="h-24 w-full rounded-xl" />
      </Card>

      <div className="sm:max-w-xs">
        <SkeletonBar className="h-12 w-full rounded-xl" />
      </div>
    </AdminPageSkeleton>
  );
}
