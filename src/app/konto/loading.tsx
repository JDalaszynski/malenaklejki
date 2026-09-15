import { Panel } from "@/components/account/AccountLayout";
import { AccountPageSkeleton, OrderCardSkeleton } from "@/components/account/AccountSkeleton";
import { SkeletonBar } from "@/components/layout/Skeleton";

/**
 * Pulpit konta. Tytuł to powitanie po imieniu, a imię wchodzi z Firestore,
 * więc w nagłówku zostaje pasek zastępczy.
 */
export default function Loading() {
  return (
    <AccountPageSkeleton label="Wczytywanie pulpitu konta…">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm flex flex-col gap-2"
          >
            <SkeletonBar className="h-10 w-10 rounded-xl" />
            <SkeletonBar className="h-5 w-32 mt-1" />
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-2/3" />
          </div>
        ))}
      </div>

      <Panel title="Ostatnie zamówienia">
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      </Panel>
    </AccountPageSkeleton>
  );
}
