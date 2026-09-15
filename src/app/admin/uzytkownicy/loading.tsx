import { Card } from "@/components/admin/AdminLayout";
import {
  AdminPageSkeleton,
  AdminTableSkeleton,
  FiltersCardSkeleton,
  StatTileSkeleton,
} from "@/components/admin/AdminSkeleton";

const HEADINGS = ["Klient", "Kontakt", "Zarejestrowany", "Zamówienia", "Wydane", "Status", " "];

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Użytkownicy"
      subtitle="Konta klientów: dane z rejestracji, powiązane zamówienia i dostęp do logowania."
      label="Wczytywanie listy użytkowników…"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTileSkeleton hero />
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <FiltersCardSkeleton selects={4} gridClassName="grid-cols-2 sm:grid-cols-4" />

      <Card title="Wyniki">
        <AdminTableSkeleton headings={HEADINGS} rows={8} />
      </Card>
    </AdminPageSkeleton>
  );
}
