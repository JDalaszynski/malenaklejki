import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { UserActions } from "@/components/admin/UserActions";
import { StatusPill } from "@/components/account/StatusPill";
import { requireAdmin } from "@/lib/auth/dal";
import { adminAuth, db } from "@/lib/firebase/admin";
import { listOrdersForUser } from "@/lib/admin/queries";
import { formatDateTime, formatPln } from "@/lib/orders/status";

export const metadata: Metadata = {
  title: "Panel — użytkownik",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-bold text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

export default async function AdminUserPage({ params }: { params: Promise<{ uid: string }> }) {
  const admin = await requireAdmin();
  const { uid } = await params;

  const record = await adminAuth.getUser(uid).catch(() => null);
  if (!record) notFound();

  const [profileSnap, orders] = await Promise.all([
    db.collection("users").doc(uid).get(),
    listOrdersForUser(uid),
  ]);
  const profile = profileSnap.data();

  const isAdmin = record.customClaims?.role === "admin";
  const name = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  const paidOrders = orders.filter((order) => order.status === "PAID");
  const totalSpent = paidOrders.reduce((sum, order) => sum + order.totals.total, 0);
  const address = profile?.defaultAddress;
  const locker = profile?.defaultLocker;
  const invoiceDetails = profile?.invoiceDetails;

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title={name || record.email || uid}
      subtitle={`${record.email ?? "bez adresu e-mail"} · konto od ${formatDateTime(
        record.metadata.creationTime ? new Date(record.metadata.creationTime).toISOString() : ""
      )}`}
      actions={
        <Link
          href="/admin/uzytkownicy"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-11 px-5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Lista użytkowników
        </Link>
      }
    >
      <Card
        title="Konto"
        actions={
          <div className="flex flex-wrap gap-1.5">
            <StatusPill tone={record.emailVerified ? "success" : "warning"}>
              {record.emailVerified ? "E-mail potwierdzony" : "E-mail niepotwierdzony"}
            </StatusPill>
            <StatusPill tone={record.disabled ? "danger" : "neutral"}>
              {record.disabled ? "Logowanie zablokowane" : "Aktywne"}
            </StatusPill>
            {isAdmin && (
              <StatusPill tone="info">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                Administrator
              </StatusPill>
            )}
          </div>
        }
      >
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="UID" value={<span className="font-mono text-xs">{record.uid}</span>} />
          <Field label="E-mail" value={record.email ?? "—"} />
          <Field label="Telefon" value={profile?.phone || "—"} />
          <Field
            label="Ostatnie logowanie"
            value={
              record.metadata.lastSignInTime
                ? formatDateTime(new Date(record.metadata.lastSignInTime).toISOString())
                : "—"
            }
          />
          <Field
            label="Konto założone"
            value={formatDateTime(
              record.metadata.creationTime ? new Date(record.metadata.creationTime).toISOString() : ""
            )}
          />
          <Field label="Zgoda marketingowa" value={profile?.marketingConsent ? "Tak" : "Nie"} />
        </dl>

        <div className="mt-5 pt-5 border-t border-border/60">
          <UserActions
            uid={record.uid}
            disabled={record.disabled}
            emailVerified={record.emailVerified}
            isSelf={record.uid === admin.uid}
          />
        </div>
      </Card>

      <Card title="Profil" description={profile ? undefined : "Brak profilu w Firestore — konto istnieje tylko w Auth."}>
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                Adres domyślny
              </p>
              {address ? (
                <p className="text-sm font-bold text-foreground">
                  {address.street} {address.building}
                  <br />
                  {address.postalCode} {address.city}
                </p>
              ) : locker?.lockerId ? (
                <p className="text-sm font-bold text-foreground">
                  Paczkomat {locker.lockerId}
                  <br />
                  <span className="font-medium text-muted-foreground">{locker.address}</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Nie podano.</p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                Dane do faktury
              </p>
              {invoiceDetails?.nip ? (
                <p className="text-sm font-bold text-foreground">
                  {invoiceDetails.companyName || "—"}
                  <br />
                  <span className="font-medium text-muted-foreground">NIP {invoiceDetails.nip}</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Nie podano.</p>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card
        title={`Zamówienia (${orders.length})`}
        description={
          orders.length
            ? `${paidOrders.length} opłaconych na łącznie ${formatPln(totalSpent)}.`
            : "To konto nie ma jeszcze żadnego zamówienia."
        }
      >
        <OrdersTable orders={orders} emptyMessage="Brak zamówień powiązanych z tym kontem." />
      </Card>
    </AdminLayout>
  );
}
