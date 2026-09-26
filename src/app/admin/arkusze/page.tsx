import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Library, Plus } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { Pagination } from "@/components/admin/Pagination";
import { StatTile } from "@/components/admin/ProfitStats";
import { StatusPill } from "@/components/account/StatusPill";
import { SheetGrid } from "@/components/sheets/SheetGrid";
import { SheetsFilters } from "@/components/sheets/SheetsFilters";
import { requireAdmin } from "@/lib/auth/dal";
import { parsePage, type AdminSearchParams } from "@/lib/admin/filters";
import { READY_SHEETS_MODE_LABELS } from "@/lib/settings/readySheets";
import { getReadySheetsSettingsFresh } from "@/lib/settings/readySheetsStore";
import {
  SHEETS_PAGE_SIZE,
  countLibraryStickers,
  filterSheets,
  listCategories,
  listSheets,
  paginateSheets,
  parseSheetFilters,
} from "@/lib/sheets/store";

export const metadata: Metadata = {
  title: "Panel — gotowe arkusze",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSheetsPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters = parseSheetFilters(params);

  const [all, libraryCount, readySheets] = await Promise.all([
    listSheets(),
    countLibraryStickers(),
    getReadySheetsSettingsFresh(),
  ]);
  const categories = listCategories(all);
  const page = paginateSheets(filterSheets(all, filters), parsePage(params));

  const published = all.filter((sheet) => sheet.status === "published").length;

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Gotowe arkusze"
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          Arkusze tematyczne układane z naklejek z bazy. Opublikowane widać w kreatorze na stronie
          głównej, szkice tylko tutaj.
          <Link href="/admin/ustawienia" className="inline-flex" title="Zmień w ustawieniach sklepu">
            <StatusPill
              tone={
                readySheets.mode === "on" ? "success" : readySheets.mode === "preview" ? "warning" : "neutral"
              }
              className="hover:opacity-80 transition-opacity"
            >
              W sklepie: {READY_SHEETS_MODE_LABELS[readySheets.mode].toLowerCase()}
            </StatusPill>
          </Link>
        </span>
      }
      actions={
        <>
          <Link
            href="/admin/arkusze/baza-naklejek"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-bold h-11 px-5 border border-slate-300 dark:border-white/20 bg-background hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            <Library className="w-4 h-4" aria-hidden />
            Baza naklejek
          </Link>
          <Link
            href={
              filters.category
                ? `/admin/arkusze/nowy?kategoria=${encodeURIComponent(filters.category)}`
                : "/admin/arkusze/nowy"
            }
            className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-11 px-5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden />
            Nowy arkusz
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Opublikowane"
          value={String(published)}
          hint={
            readySheets.mode === "on"
              ? published
                ? "widoczne w sklepie"
                : "żaden arkusz nie jest w sklepie"
              : readySheets.mode === "preview"
                ? "widzisz je tylko Ty (podgląd)"
                : "sklep ma gotowe arkusze wyłączone"
          }
          hero
        />
        <StatTile label="Szkice" value={String(all.length - published)} hint="w przygotowaniu" />
        <StatTile
          label="Kategorie"
          value={String(categories.length)}
          hint={categories.slice(0, 3).join(", ") || "jeszcze żadnej"}
        />
        <StatTile label="Naklejek w bazie" value={String(libraryCount)} hint="do układania arkuszy" />
      </div>

      {all.length > 0 && (
        <Card>
          <Suspense fallback={<div className="h-11 animate-pulse rounded-xl bg-muted/40" />}>
            <SheetsFilters categories={categories} />
          </Suspense>
        </Card>
      )}

      <Card title={all.length > 0 ? `Arkusze (${page.total})` : undefined}>
        <SheetGrid
          sheets={page.items}
          showCreate={all.length === 0}
          emptyMessage="Brak arkuszy dla wybranych filtrów."
        />
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          total={page.total}
          pageSize={SHEETS_PAGE_SIZE}
          basePath="/admin/arkusze"
          params={params}
        />
      </Card>
    </AdminLayout>
  );
}
