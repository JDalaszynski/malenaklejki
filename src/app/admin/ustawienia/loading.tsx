import { Card } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { SkeletonBar, SkeletonField } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AdminPageSkeleton
      title="Ustawienia sklepu"
      subtitle="Przerwa urlopowa: baner nad nagłówkiem, termin wysyłki w koszyku i — jeśli chcesz — wstrzymanie zamówień."
      label="Wczytywanie ustawień sklepu…"
    >
      <Card
        title="Przerwa urlopowa"
        description="Jeden włącznik dla baneru na stronie, terminu wysyłki w koszyku i informacji w mailach."
        actions={<SkeletonBar className="h-7 w-28 rounded-full" />}
      >
        <div className="flex flex-col gap-4">
          <SkeletonBar className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <SkeletonField key={index} />
            ))}
          </div>
        </div>
      </Card>

      <Card
        title="Treść komunikatu"
        description="Zostaw pola puste, a teksty ułożą się same z ustawionych dat."
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <SkeletonField key={index} />
            ))}
          </div>
          <SkeletonField />
          <SkeletonField />
        </div>
      </Card>

      <Card
        title="Zamówienia w czasie przerwy"
        description="Domyślnie sklep sprzedaje dalej, a paczki czekają na powrót."
      >
        <SkeletonBar className="h-20 w-full rounded-2xl" />
      </Card>

      <Card
        title="Podgląd"
        description="Tak wygląda pasek nad nagłówkiem sklepu. Podgląd pokazujemy niezależnie od włącznika i dat."
      >
        <SkeletonBar className="h-14 w-full rounded-2xl" />
      </Card>

      <div className="sm:max-w-xs">
        <SkeletonBar className="h-12 w-full rounded-xl" />
      </div>
    </AdminPageSkeleton>
  );
}
