import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MailWarning, Package, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { AccountLayout, Panel } from "@/components/account/AccountLayout";
import { OrderCard } from "@/components/account/OrderCard";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/firebase/admin";
import { listUserOrders } from "@/lib/orders/queries";
import { formatPln } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Moje konto — MałeNaklejki",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SHORTCUTS = [
  {
    href: "/konto/zamowienia",
    label: "Moje zamówienia",
    text: "Statusy, szczegóły i powrót do arkuszy.",
    icon: Package,
  },
  {
    href: "/konto/dane",
    label: "Dane i adresy",
    text: "Uzupełnij raz, wypełni się przy każdym zamówieniu.",
    icon: UserRound,
  },
  {
    href: "/konto/bezpieczenstwo",
    label: "Bezpieczeństwo",
    text: "Hasło, adres e-mail i sposoby logowania.",
    icon: ShieldCheck,
  },
];

export default async function AccountDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ powitanie?: string }>;
}) {
  const session = await requireUser("/konto");
  const params = await searchParams;
  const justJoined = params.powitanie === "1";

  const profileSnapshot = await db.collection("users").doc(session.uid).get();
  const firstName = profileSnapshot.data()?.firstName || "";

  const orders = session.emailVerified ? await listUserOrders(session.uid, 3) : [];
  const paidTotal = orders
    .filter((order) => order.status === "PAID")
    .reduce((sum, order) => sum + order.totals.total, 0);

  return (
    <AccountLayout
      title={firstName ? `Cześć, ${firstName}!` : "Twoje konto"}
      subtitle={
        justJoined
          ? "Konto jest gotowe. Poniżej wszystko, co możesz z nim zrobić."
          : "Wszystko o Twoich naklejkach w jednym miejscu."
      }
      banner={
        !session.emailVerified ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4">
            <MailWarning className="w-6 h-6 text-destructive shrink-0" aria-hidden />
            <p className="flex-1 text-sm font-bold text-foreground leading-relaxed">
              Potwierdź adres <span className="text-destructive">{session.email}</span>, żeby
              odblokować historię zamówień i edycję arkuszy.
            </p>
            <Link
              href="/konto/potwierdz-email"
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98] h-11 px-5 transition-all shrink-0"
            >
              Potwierdź teraz
            </Link>
          </div>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {SHORTCUTS.map(({ href, label, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-card border border-border/70 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="w-5 h-5" aria-hidden />
            </span>
            <span className="font-extrabold text-foreground mt-1">{label}</span>
            <span className="text-sm font-medium text-muted-foreground leading-relaxed">{text}</span>
          </Link>
        ))}
      </div>

      <Panel
        title="Ostatnie zamówienia"
        actions={
          orders.length > 0 ? (
            <Link
              href="/konto/zamowienia"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all"
            >
              Zobacz wszystkie
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : null
        }
      >
        {!session.emailVerified ? (
          <p className="text-sm font-medium text-muted-foreground">
            Historia zamówień odblokuje się po potwierdzeniu adresu e-mail.
          </p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Sparkles className="w-7 h-7 text-muted-foreground" aria-hidden />
            </span>
            <div>
              <p className="font-extrabold text-foreground">Jeszcze nic tu nie ma</p>
              <p className="text-sm font-medium text-muted-foreground mt-1 max-w-sm">
                Zaprojektuj pierwszy arkusz — potem wrócisz do niego jednym kliknięciem.
              </p>
            </div>
            <Link
              href="/#sheet"
              className="inline-flex items-center justify-center rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-8 shadow-sm transition-all"
            >
              Otwórz kreator
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {paidTotal > 0 && (
              <p className="text-sm font-medium text-muted-foreground pt-2">
                Opłacone w tym zestawieniu:{" "}
                <strong className="text-foreground">{formatPln(paidTotal)}</strong>
              </p>
            )}
          </div>
        )}
      </Panel>
    </AccountLayout>
  );
}
