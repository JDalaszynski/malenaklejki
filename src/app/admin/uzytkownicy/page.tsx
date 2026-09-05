import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { UsersFilters } from "@/components/admin/UsersFilters";
import { UsersTable } from "@/components/admin/UsersTable";
import { StatTile } from "@/components/admin/ProfitStats";
import { requireAdmin } from "@/lib/auth/dal";
import { filterAdminUsers, listAdminUsers, parseUserFilters } from "@/lib/admin/users";
import type { AdminSearchParams } from "@/lib/admin/filters";

export const metadata: Metadata = {
  title: "Panel — użytkownicy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters = parseUserFilters(params);

  const allUsers = await listAdminUsers();
  const users = filterAdminUsers(allUsers, filters);

  const verifiedCount = allUsers.filter((user) => user.emailVerified).length;
  const withOrdersCount = allUsers.filter((user) => user.orderCount > 0).length;
  const blockedCount = allUsers.filter((user) => user.disabled).length;
  const percent = (count: number) => (allUsers.length ? Math.round((count / allUsers.length) * 100) : 0);

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Użytkownicy"
      subtitle="Konta klientów: dane z rejestracji, powiązane zamówienia i dostęp do logowania."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Konta łącznie" value={String(allUsers.length)} hint="w Firebase Auth" hero />
        <StatTile
          label="Zweryfikowany e-mail"
          value={String(verifiedCount)}
          hint={`${percent(verifiedCount)}% wszystkich kont`}
        />
        <StatTile
          label="Złożyli zamówienie"
          value={String(withOrdersCount)}
          hint={`${percent(withOrdersCount)}% wszystkich kont`}
        />
        <StatTile
          label="Zablokowane"
          value={String(blockedCount)}
          hint={blockedCount ? "bez możliwości logowania" : "brak zablokowanych"}
        />
      </div>

      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <UsersFilters />
        </Suspense>
      </Card>

      <Card title={`Wyniki (${users.length})`}>
        <UsersTable users={users} />
      </Card>
    </AdminLayout>
  );
}
