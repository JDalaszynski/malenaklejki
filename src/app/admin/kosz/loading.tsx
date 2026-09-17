import { Card } from "@/components/admin/AdminLayout";
import {
  AdminPageSkeleton,
  AdminTableSkeleton,
  FiltersCardSkeleton,
} from "@/components/admin/AdminSkeleton";

const HEADINGS = [
  "Numer",
  "Data",
  "Klient",
  "Kwota",
  "Zysk",
  "Płatność",
  "Base",
  "Faktura",
  "Mail realiz.",
  "Mail wysł.",
  "Metoda",
  " ",
];

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Kosz"
      subtitle="Zamówienia usunięte z listy. Nie wchodzą do raportów, ale wciąż można je przywrócić."
      label="Wczytywanie kosza…"
    >
      <FiltersCardSkeleton />

      <Card title="W koszu">
        <AdminTableSkeleton headings={HEADINGS} rows={5} />
      </Card>
    </AdminPageSkeleton>
  );
}
