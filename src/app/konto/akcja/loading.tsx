import { AuthShell } from "@/components/auth/AuthShell";
import { SkeletonBar, SkeletonScreen } from "@/components/layout/Skeleton";

/**
 * Strona z linku w mailu (potwierdzenie adresu, reset hasła). Sama w sobie
 * nie czeka na dane, ale bez tego pliku pokazałaby szkielet pulpitu konta
 * z `konto/loading.tsx` — ekran wczytywania z nadrzędnego segmentu obejmuje
 * wszystko, co jest pod nim.
 */
export default function Loading() {
  return (
    <AuthShell title="Bezpieczeństwo konta" subtitle="Kończymy to, co zaczęliśmy w e-mailu.">
      <SkeletonScreen label="Wczytywanie…">
        <div className="flex flex-col gap-4">
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-12 w-full rounded-xl mt-2" />
          <SkeletonBar className="h-12 w-full rounded-xl" />
        </div>
      </SkeletonScreen>
    </AuthShell>
  );
}
