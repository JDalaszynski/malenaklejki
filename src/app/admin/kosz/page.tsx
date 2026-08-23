import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { requireAdmin } from "@/lib/auth/dal";
import { listOrders } from "@/lib/admin/queries";
import { parseFilters, type AdminSearchParams } from "@/lib/admin/filters";

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
  const orders = await listOrders(parseFilters(params, true));

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Kosz"
      subtitle="Zamówienia usunięte z listy. Nie wchodzą do raportów, ale wciąż można je przywrócić."
    >
      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <OrderFilters basePath="/admin/kosz" />
        </Suspense>
      </Card>

      <Card title={`W koszu (${orders.length})`}>
        <OrdersTable orders={orders} emptyMessage="Kosz jest pusty." />
      </Card>
    </AdminLayout>
  );
}
