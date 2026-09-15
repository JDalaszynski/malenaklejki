import { Panel } from "@/components/account/AccountLayout";
import { AccountPageSkeleton } from "@/components/account/AccountSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

/** Wiersz „ikona + nazwa + stan + akcja" z listy sposobów logowania. */
function MethodSkeleton({ last = false }: { last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        last ? "" : "border-b border-border/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <SkeletonBar className="w-5 h-5 rounded shrink-0" />
        <div>
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-4 w-48 mt-2" />
        </div>
      </div>
      <SkeletonBar className="h-4 w-16 shrink-0" />
    </div>
  );
}

export default function Loading() {
  return (
    <AccountPageSkeleton
      title="Bezpieczeństwo"
      subtitle="Hasło, adres e-mail i dostęp do konta."
      label="Wczytywanie ustawień bezpieczeństwa…"
    >
      <Panel
        title="Sposoby logowania"
        description="Do jednego konta możesz mieć hasło i konto Google jednocześnie."
      >
        <div className="flex flex-col gap-3">
          <MethodSkeleton />
          <MethodSkeleton />
          <MethodSkeleton last />
        </div>
      </Panel>

      <Panel title="Sesje" description="Nie pamiętasz, gdzie się logowałeś? Zamknij wszystko naraz.">
        <SkeletonBar className="h-4 w-full max-w-md" />
        <SkeletonBar className="h-12 w-56 rounded-xl mt-4" />
      </Panel>

      <Panel title="Usunięcie konta">
        <SkeletonBar className="h-4 w-full max-w-lg" />
        <SkeletonBar className="h-4 w-2/3 max-w-md mt-2" />
        <SkeletonBar className="h-12 w-48 rounded-xl mt-4" />
      </Panel>
    </AccountPageSkeleton>
  );
}
