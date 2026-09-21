import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { Pagination } from "@/components/admin/Pagination";
import { SweepCard } from "@/components/admin/SweepCard";
import { requireAdmin } from "@/lib/auth/dal";
import { listOrdersPage, ORDERS_PAGE_SIZE } from "@/lib/admin/queries";
import { parseFilters, parsePage, type AdminSearchParams } from "@/lib/admin/filters";
import { sweepAbandonedOrders, ABANDONED_AFTER_DAYS } from "@/lib/orders/sweep";

export const metadata: Metadata = {
  title: "Panel — zamówienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters = parseFilters(params);

  // Oba zapytania idą równolegle — jedno drugiego nie potrzebuje, a przy
  // sekwencji panel czekał na sumę obu czasów.
  // Sprzątanie jest tylko podglądem: samo wejście na listę niczego nie kasuje.
  const [page, sweep] = await Promise.all([
    listOrdersPage(filters, parsePage(params)),
    sweepAbandonedOrders({ dryRun: true }),
  ]);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Zamówienia"
      subtitle="Filtry zapisują się w adresie strony — możesz odłożyć widok do zakładek."
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
      <SweepCard matched={sweep.matched} afterDays={ABANDONED_AFTER_DAYS} />

      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <OrderFilters />
        </Suspense>
      </Card>

      <Card
        title={`Wyniki (${page.total})`}
        description={
          page.capped
            ? "Pokazujemy 500 najnowszych zamówień z tego zakresu — zawęź filtr, żeby zobaczyć resztę."
            : undefined
        }
      >
        <OrdersTable orders={page.orders} />
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          total={page.total}
          pageSize={ORDERS_PAGE_SIZE}
          basePath="/admin"
          params={params}
        />
      </Card>
    </AdminLayout>
  );
}
