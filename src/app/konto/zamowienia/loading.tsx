import { AccountPageSkeleton, OrderCardSkeleton } from "@/components/account/AccountSkeleton";

export default function Loading() {
  return (
    <AccountPageSkeleton
      title="Moje zamówienia"
      subtitle="Otwórz zamówienie, żeby zobaczyć szczegóły i zamówić te same arkusze ponownie."
      label="Wczytywanie listy zamówień…"
    >
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    </AccountPageSkeleton>
  );
}
