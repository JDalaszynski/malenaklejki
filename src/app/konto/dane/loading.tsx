import { Panel } from "@/components/account/AccountLayout";
import { AccountPageSkeleton, FormPanelSkeleton } from "@/components/account/AccountSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AccountPageSkeleton
      title="Dane i adresy"
      subtitle="Uzupełnij raz — formularz zamówienia wypełni się sam."
      label="Wczytywanie danych konta…"
    >
      <FormPanelSkeleton title="Dane kontaktowe" fields={4} />

      <FormPanelSkeleton
        title="Domyślny adres dostawy"
        description="Uzupełnij, jeśli zwykle zamawiasz kuriera pod ten sam adres."
        fields={4}
      />

      <FormPanelSkeleton
        title="Dane do faktury"
        description="Wypełnij, jeśli zamawiasz na firmę."
        fields={2}
      />

      <Panel title="Zgody">
        <div className="flex items-start gap-3">
          <SkeletonBar className="w-5 h-5 rounded mt-1 shrink-0" />
          <div className="flex-1">
            <SkeletonBar className="h-4 w-full max-w-lg" />
            <SkeletonBar className="h-4 w-48 mt-2" />
          </div>
        </div>
      </Panel>

      <div className="sm:max-w-xs">
        <SkeletonBar className="h-12 w-full rounded-xl" />
      </div>
    </AccountPageSkeleton>
  );
}
