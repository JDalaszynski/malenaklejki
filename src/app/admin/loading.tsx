import Link from "next/link";
import { PackagePlus } from "lucide-react";

import { Card } from "@/components/admin/AdminLayout";
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

/**
 * Lista zamówień. Karta sprzątania porzuconych zamówień nie ma tu
 * odpowiednika — pokazuje się tylko wtedy, gdy jest co sprzątać, więc
 * zastępnik migałby na ekranie i znikał.
 */
export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Zamówienia"
      subtitle="Filtry zapisują się w adresie strony — możesz odłożyć widok do zakładek."
      label="Wczytywanie listy zamówień…"
      actions={
        <Link
          href="/admin/zamowienia/nowe"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all"
        >
          <PackagePlus className="w-4 h-4" aria-hidden />
          Dodaj zamówienie
        </Link>
      }
    >
      <FiltersCardSkeleton />

      <Card title="Wyniki">
        <AdminTableSkeleton headings={HEADINGS} rows={10} />
      </Card>
    </AdminPageSkeleton>
  );
}
