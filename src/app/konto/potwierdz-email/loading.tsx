import { AuthShell } from "@/components/auth/AuthShell";
import { SkeletonBar, SkeletonScreen } from "@/components/layout/Skeleton";

export default function Loading() {
  return (
    <AuthShell
      title="Potwierdź adres e-mail"
      subtitle="Ostatni krok, żeby odblokować historię zamówień."
    >
      <SkeletonScreen label="Wczytywanie potwierdzenia adresu…">
        <div className="flex flex-col items-center text-center gap-5">
          <SkeletonBar className="w-16 h-16 rounded-full" />
          <div className="w-full max-w-sm">
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-full mt-2" />
            <SkeletonBar className="h-4 w-2/3 mx-auto mt-2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <SkeletonBar className="h-12 w-full sm:w-52 rounded-xl" />
            <SkeletonBar className="h-12 w-full sm:w-40 rounded-xl" />
          </div>
        </div>
      </SkeletonScreen>
    </AuthShell>
  );
}
