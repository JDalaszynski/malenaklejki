import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { StatsBar } from "@/components/admin/StatsBar";
import { SweepCard } from "@/components/admin/SweepCard";
import { requireAdmin } from "@/lib/auth/dal";
import { listOrders, summarize } from "@/lib/admin/queries";
import { parseFilters, type AdminSearchParams } from "@/lib/admin/filters";
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
  const orders = await listOrders(filters);
  const stats = summarize(orders);

  // Tylko podgląd — samo wejście na listę niczego nie kasuje.
  const sweep = await sweepAbandonedOrders({ dryRun: true });

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
      <StatsBar stats={stats} />

      <SweepCard matched={sweep.matched} afterDays={ABANDONED_AFTER_DAYS} />

      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <OrderFilters />
        </Suspense>
      </Card>

      <Card
        title={`Wyniki (${orders.length})`}
        description={
          orders.length >= 500
            ? "Pokazujemy 500 najnowszych zamówień z tego zakresu — zawęź filtr, żeby zobaczyć resztę."
            : undefined
        }
      >
        <OrdersTable orders={orders} />
      </Card>
    </AdminLayout>
  );
}
