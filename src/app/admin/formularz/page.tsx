import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminLayout, Card } from "@/components/admin/AdminLayout";
import { MessagesFilters } from "@/components/admin/MessagesFilters";
import { MessagesList } from "@/components/admin/MessagesList";
import { Pagination } from "@/components/admin/Pagination";
import { StatTile } from "@/components/admin/ProfitStats";
import { requireAdmin } from "@/lib/auth/dal";
import { parsePage, type AdminSearchParams } from "@/lib/admin/filters";
import {
  MESSAGES_PAGE_SIZE,
  filterFormMessages,
  listFormMessages,
  paginateFormMessages,
  parseMessageFilters,
} from "@/lib/admin/messages";

export const metadata: Metadata = {
  title: "Panel — formularz",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const filters = parseMessageFilters(params);

  const all = await listFormMessages();
  const page = paginateFormMessages(filterFormMessages(all, filters), parsePage(params));

  const newCount = all.filter((item) => item.status === "new").length;
  const failedCount = all.filter((item) => item.mailStatus === "failed").length;
  const designCount = all.filter((item) => item.kind === "design").length;

  return (
    <AdminLayout
      adminEmail={admin.email ?? ""}
      title="Formularz"
      subtitle="Wiadomości z formularza kontaktowego i z zapytań o projekt naklejki — zapisywane niezależnie od poczty."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Nowe"
          value={String(newCount)}
          hint={newCount ? "czekają na odpowiedź" : "wszystko załatwione"}
          hero
        />
        <StatTile label="Łącznie" value={String(all.length)} hint="ostatnie 500 wiadomości" />
        <StatTile
          label="Zapytania o projekt"
          value={String(designCount)}
          hint={`kontakt: ${all.length - designCount}`}
        />
        <StatTile
          label="Mail nie wyszedł"
          value={String(failedCount)}
          hint={failedCount ? "panel jest jedynym śladem" : "wszystkie powiadomienia wysłane"}
        />
      </div>

      <Card>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/40" />}>
          <MessagesFilters />
        </Suspense>
      </Card>

      <Card
        title={`Wyniki (${page.total})`}
        description={
          all.length >= 500
            ? "Pokazujemy 500 najnowszych wiadomości — starsze zostają w bazie."
            : undefined
        }
      >
        <MessagesList
          messages={page.items}
          emptyMessage={
            all.length === 0
              ? "Nie ma jeszcze żadnej wiadomości. Trafią tu te wysłane od teraz — archiwalnych nie przenosimy."
              : "Brak wiadomości dla wybranych filtrów."
          }
        />
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          total={page.total}
          pageSize={MESSAGES_PAGE_SIZE}
          basePath="/admin/formularz"
          params={params}
        />
      </Card>
    </AdminLayout>
  );
}
