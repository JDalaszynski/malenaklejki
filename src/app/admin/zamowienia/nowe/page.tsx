import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderEditForm } from "@/components/admin/OrderEditForm";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Panel — nowe zamówienie",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const admin = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Nowe zamówienie"
      subtitle="Sprzedaż spoza sklepu — trafi do ewidencji, raportu i (na żądanie) do BaseLinkera."
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
      <OrderEditForm
        mode="create"
        defaults={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          deliveryMethod: "paczkomat",
          street: "",
          building: "",
          postalCode: "",
          city: "",
          lockerId: "",
          lockerAddress: "",
          wantsInvoice: false,
          nip: "",
          companyName: "",
          paymentMethod: "manual",
          shipping: 19.99,
          internalNote: "",
          source: "manual",
          status: "PAID",
          createdAt: today,
          paidAt: today,
          items: [
            {
              id: "",
              name: "Naklejki (1 szt.) wraz z dostawą",
              sheetQuantity: 1,
              pricePerSheet: 49,
              taxRate: 23,
            },
          ],
        }}
      />
    </AdminLayout>
  );
}
