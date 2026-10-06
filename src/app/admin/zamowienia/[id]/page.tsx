import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetailView } from "@/components/admin/order/OrderDetailView";
import { requireAdmin } from "@/lib/auth/dal";
import { getOrder } from "@/lib/admin/queries";
import { listAuditForOrder } from "@/lib/admin/audit";

export const metadata: Metadata = {
  title: "Panel — zamówienie",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
// Ręczne wystawienie faktury czeka na odpowiedź inFaktu.
export const maxDuration = 30;

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const order = await getOrder(id);
  if (!order) notFound();

  const audit = await listAuditForOrder(id);

  return <OrderDetailView order={order} audit={audit} adminEmail={admin.email ?? ""} />;
}
