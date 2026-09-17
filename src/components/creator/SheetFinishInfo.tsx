"use client";

import { Popover } from "@base-ui/react/popover";
import {
  CloudSunRain,
  Info,
  Layers,
  Scissors,
  Sparkles,
  Sticker,
  type LucideIcon,
} from "lucide-react";

type DeliveryForm = "sheet" | "individual";

function SpecRow({
  icon: Icon,
  label,
  value,
  hint,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
        <Icon aria-hidden className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground">
          {label}
          {action}
        </dt>
        <dd className="text-[13px] font-extrabold text-foreground leading-snug">
          {value}
        </dd>
        <dd className="text-[11px] font-semibold text-muted-foreground/90 dark:text-muted-foreground leading-snug mt-0.5">
          {hint}
        </dd>
      </div>
    </div>
  );
}

/**
 * Przycisk "Wykończenie arkusza" pod podglądem arkusza. Dymek otwiera się po
 * najechaniu, kliknięciu (dotyk) i z klawiatury; wiersz "Forma" podąża za
 * wyborem w karcie "Forma zestawu naklejek".
 *
 * Treść trzyma się blog-agent/facts.md: połysk opisujemy jako "Powierzchnia",
 * odporność tylko na wodę i UV.
 */
export function SheetFinishInfo({
  deliveryForm,
  onChangeForm,
}: {
  deliveryForm: DeliveryForm;
  onChangeForm?: () => void;
}) {
  const isSheet = deliveryForm === "sheet";

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={120}
        closeDelay={180}
        className="group relative shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#004749]/10 dark:border-white/10 bg-white/70 dark:bg-white/5 py-1.5 pl-3 pr-2.5 text-[11px] font-extrabold text-foreground shadow-[0_1px_2px_rgba(0,71,73,0.06)] transition-colors cursor-pointer hover:border-primary/40 hover:bg-white dark:hover:bg-white/10 data-[popup-open]:border-primary/50 data-[popup-open]:bg-white dark:data-[popup-open]:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']"
      >
        Wykończenie arkusza
        <Info
          aria-hidden
          className="w-3.5 h-3.5 text-muted-foreground/60 dark:text-muted-foreground transition-colors group-hover:text-primary group-data-[popup-open]:text-primary"
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="top"
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="z-[70]"
        >
          <Popover.Popup className="relative w-[min(21rem,calc(100vw-1.5rem))] origin-[var(--transform-origin)] rounded-2xl border border-[#e2ebea] dark:border-[#1a4e4f] bg-white dark:bg-[#003a3b] p-4 text-left shadow-[0_20px_50px_-12px_rgba(0,71,73,0.3),0_4px_12px_-4px_rgba(0,71,73,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] outline-none transition-[opacity,transform] duration-150 ease-out data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 motion-reduce:transition-none">
            <Popover.Arrow className="data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180 data-[side=bottom]:top-[-8px]">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden>
                <path
                  d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
                  className="fill-white dark:fill-[#003a3b]"
                />
                <path
                  d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
                  className="fill-[#e2ebea] dark:fill-[#1a4e4f]"
                />
              </svg>
            </Popover.Arrow>

            <div className="pb-3 border-b border-[#004749]/[0.07] dark:border-white/10">
              <Popover.Title className="text-sm font-black text-foreground leading-tight">
                Wykończenie arkusza
              </Popover.Title>
              <Popover.Description className="text-[11px] font-semibold text-muted-foreground/90 dark:text-muted-foreground leading-snug mt-0.5">
                Tak wyprodukujemy Twoje naklejki
              </Popover.Description>
            </div>

            <dl className="pt-3 space-y-3">
              <SpecRow
                icon={Sparkles}
                label="Powierzchnia"
                value="Subtelny połysk"
                hint="Żywe kolory na delikatnie błyszczącej folii."
              />
              <SpecRow
                icon={isSheet ? Layers : Scissors}
                label="Forma"
                value={isSheet ? "Pozostawione na arkuszu" : "Pojedyncze sztuki"}
                hint={
                  isSheet ? (
                    <>
                      Nacięte po kształcie{" "}
                      <span className="whitespace-nowrap">(kiss-cut).</span>
                    </>
                  ) : (
                    <>
                      Każda naklejka docięta osobno do kształtu{" "}
                      <span className="whitespace-nowrap">(die-cut)</span> i
                      dostarczona luzem.
                    </>
                  )
                }
                action={
                  onChangeForm && (
                    <Popover.Close
                      onClick={onChangeForm}
                      className="-my-1 rounded-md px-1 py-0.5 text-[11px] font-extrabold normal-case tracking-normal text-primary cursor-pointer hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      Zmień
                    </Popover.Close>
                  )
                }
              />
              <SpecRow
                icon={Sticker}
                label="Materiał"
                value="Folia winylowa"
                hint="Mocny klej, który nie zostawia śladów po odklejeniu."
              />
              <SpecRow
                icon={CloudSunRain}
                label="Odporność"
                value="Woda i promieniowanie UV"
                hint="Nie nadaje się do zmywarki - myj ręcznie."
              />
            </dl>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
