import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { Pagination } from "@/components/admin/Pagination";
import { ORDER_TABS, SectionTabs } from "@/components/admin/SectionTabs";
import { requireAdmin } from "@/lib/auth/dal";
import { listOrdersPage, ORDERS_PAGE_SIZE } from "@/lib/admin/queries";
import { parseFilters, parsePage, type AdminSearchParams } from "@/lib/admin/filters";

export const metadata: Metadata = {
  title: "Panel — kosz",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const page = await listOrdersPage(parseFilters(params, true), parsePage(params));

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Zamówienia"
      subtitle="Kosz: zamówienia usunięte z listy. Nie wchodzą do raportów, ale wciąż można je przywrócić."
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

      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <OrderFilters basePath="/admin/kosz" />
        </Suspense>
      </Card>

      <Card title={`W koszu (${page.total})`}>
        <OrdersTable orders={page.orders} emptyMessage="Kosz jest pusty." />
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          total={page.total}
          pageSize={ORDERS_PAGE_SIZE}
          basePath="/admin/kosz"
          params={params}
        />
      </Card>
    </AdminLayout>
  );
}
