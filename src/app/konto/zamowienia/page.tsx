import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";

import { AccountLayout, Panel } from "@/components/account/AccountLayout";
import { OrderCard } from "@/components/account/OrderCard";
import { requireVerifiedUser } from "@/lib/auth/dal";
import { listUserOrders } from "@/lib/orders/queries";

export const metadata: Metadata = {
  title: "Moje zamówienia — MałeNaklejki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireVerifiedUser("/konto/zamowienia");
  const orders = await listUserOrders(session.uid);

  return (
    <AccountLayout
      title="Moje zamówienia"
      subtitle="Otwórz zamówienie, żeby zobaczyć szczegóły i zamówić te same arkusze ponownie."
    >
      {orders.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center text-center py-10 gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Package className="w-7 h-7 text-muted-foreground" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-extrabold text-foreground">Brak zamówień</p>
              <p className="text-sm font-medium text-muted-foreground mt-1 max-w-md">
                Kiedy złożysz pierwsze zamówienie, znajdziesz je tutaj razem z arkuszami gotowymi do
                ponownego użycia. Zamówienia złożone wcześniej bez logowania dołączamy automatycznie
                po potwierdzeniu adresu e-mail.
              </p>
            </div>
            <Link
              href="/#sheet"
              className="inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-8 shadow-sm transition-all"
            >
              Zaprojektuj naklejki
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
