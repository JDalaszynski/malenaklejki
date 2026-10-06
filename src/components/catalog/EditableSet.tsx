import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Coffee,
  Flower2,
  ImagePlus,
  Leaf,
  Moon,
  PencilRuler,
  Scaling,
  Snowflake,
  Star,
  Sun,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { formatPrice } from "@/lib/sheets/schema";
import { SHEET_PRICE } from "@/lib/sheets/types";
import { inlineLinkClass, panelClass } from "./blocks";

/**
 * „W pełni edytowalne" — wyróżnik gotowych zestawów
 * (`landing-agent/strategia-gotowe-zestawy.md`, zasada 4).
 *
 * Trzy miejsca mówią to samo tymi samymi słowami: zapowiedź w pierwszym
 * ekranie (`EditableCallout`), przycisk przy każdym zestawie
 * (`EDIT_CTA_LABEL`) i pełne wyjaśnienie z rysunkiem (`EditablePanel`).
 * Zakres zmian opisany tu musi zgadzać się z kreatorem i `blog-agent/facts.md`.
 */

const CHANGES: { icon: LucideIcon; short: string; title: string; text: string }[] = [
  {
    icon: Trash2,
    short: "Usuniesz naklejki",
    title: "Usuniesz naklejki, których nie chcesz",
    text: "Wybierz naklejkę na arkuszu i usuń ją. W zwolnionym miejscu zmieścisz coś swojego.",
  },
  {
    icon: ImagePlus,
    short: "Dodasz własne",
    title: "Dodasz własne naklejki",
    text: "Wgraj zdjęcie, logo albo dowolną grafikę. Kreator usunie tło i wyznaczy linię cięcia.",
  },
  {
    icon: Scaling,
    short: "Zmienisz rozmiar",
    title: "Zmienisz rozmiar każdej naklejki",
    text: "Każdą naklejkę powiększysz, zmniejszysz albo powielisz, jeśli chcesz mieć jej więcej.",
  },
];

/** Zapowiedź w pierwszym ekranie: jedno zdanie i trzy możliwości. */
export function EditableCallout({ detailsHref }: { detailsHref?: string }) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
      <p className="flex items-center gap-2.5 text-base sm:text-lg font-black text-foreground leading-snug">
        <span className="flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PencilRuler className="w-4 h-4" aria-hidden />
        </span>
        Każdy zestaw zmienisz po swojemu
      </p>
      <p className="mt-2 text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
        Zamów go tak, jak jest, albo otwórz w kreatorze i zrób z niego własny. Cena zostaje ta sama.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {CHANGES.map(({ icon: Icon, short }) => (
          <li
            key={short}
            className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#003a3b] border border-primary/15 px-3 py-1.5 text-xs sm:text-sm font-extrabold text-foreground"
          >
            <Icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
            {short}
          </li>
        ))}
      </ul>
      {detailsHref && (
        <a href={detailsHref} className={`mt-3 inline-block text-sm ${inlineLinkClass}`}>
          Zobacz, co możesz zmienić
        </a>
      )}
    </div>
  );
}

const STICKER = "flex w-full aspect-square items-center justify-center rounded-full text-white shadow-[0_1px_4px_rgba(0,71,73,0.28)]";
const HANDLE = "absolute w-1.5 h-1.5 rounded-[2px] bg-white border border-[#02af7a]";

function Sticker({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <span className={STICKER} style={{ backgroundColor: color }}>
      <Icon className="w-1/2 h-1/2" strokeWidth={2.25} />
    </span>
  );
}

function Tag({ top, icon: Icon, tone = "primary", children }: { top: string; icon: LucideIcon; tone?: "primary" | "remove"; children: ReactNode }) {
  return (
    <span className="absolute left-0 flex -translate-y-1/2 items-center" style={{ top }}>
      <span className="w-3 sm:w-4 h-px bg-foreground/30" />
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#003a3b] border border-border/60 shadow-sm px-2.5 py-1 text-[11px] sm:text-xs font-extrabold text-foreground whitespace-nowrap">
        <Icon className={`w-3.5 h-3.5 shrink-0 ${tone === "remove" ? "text-destructive" : "text-primary"}`} />
        {children}
      </span>
    </span>
  );
}

/**
 * Rysunek arkusza w trakcie zmian: jedna naklejka do usunięcia, miejsce na
 * własne zdjęcie i naklejka z uchwytami rozmiaru. Czysta dekoracja — to samo
 * mówi lista obok, więc czytniki ekranu go pomijają.
 */
function SheetEditIllustration() {
  return (
    <div
      aria-hidden
      className="flex h-full items-center justify-center rounded-2xl bg-[#edf6f2] dark:bg-[#002c2e] px-4 py-7 sm:p-8 select-none"
    >
      <div className="flex">
        <div className="grid w-36 sm:w-44 shrink-0 aspect-[210/297] grid-cols-3 grid-rows-4 place-items-center gap-2 rounded-lg bg-white p-2.5 sm:p-3 shadow-[0_14px_40px_rgba(0,71,73,0.16)]">
          <Sticker icon={Leaf} color="#02af7a" />
          <Sticker icon={Star} color="#f2b33d" />
          {/* Do usunięcia */}
          <span className="relative w-full">
            <span className={`${STICKER} opacity-35`} style={{ backgroundColor: "#ff6b6b" }}>
              <Coffee className="w-1/2 h-1/2" strokeWidth={2.25} />
            </span>
            <span className="absolute -inset-1 rounded-full border-[1.5px] border-dashed border-destructive" />
            <span className="absolute -top-1.5 -right-1.5 flex w-5 h-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm">
              <Trash2 className="w-3 h-3" />
            </span>
          </span>

          <Sticker icon={Snowflake} color="#5aa9e6" />
          {/* Miejsce na własną grafikę */}
          <span className="col-span-2 row-span-2 flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[#02af7a] bg-[#02af7a]/[0.07] text-[#02af7a]">
            <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] sm:text-[10px] font-black leading-none text-[#004749]">Twoje zdjęcie</span>
          </span>
          <Sticker icon={Moon} color="#7a6fd6" />

          <Sticker icon={Sun} color="#f08a4b" />
          <Sticker icon={Cloud} color="#4cc3c7" />
          {/* Zaznaczona — uchwyty rozmiaru */}
          <span className="relative w-full">
            <Sticker icon={Flower2} color="#e86fa6" />
            <span className="absolute -inset-1 rounded-[3px] border-[1.5px] border-[#02af7a]" />
            <span className={`${HANDLE} -top-1.5 -left-1.5`} />
            <span className={`${HANDLE} -top-1.5 -right-1.5`} />
            <span className={`${HANDLE} -bottom-1.5 -left-1.5`} />
            <span className={`${HANDLE} -bottom-1.5 -right-1.5`} />
          </span>
        </div>

        <div className="relative w-[8.25rem] sm:w-[9.5rem] shrink-0">
          <Tag top="13%" icon={Trash2} tone="remove">Usuniesz</Tag>
          <Tag top="50%" icon={ImagePlus}>Dodasz własną</Tag>
          <Tag top="87%" icon={Scaling}>Zmienisz rozmiar</Tag>
        </div>
      </div>
    </div>
  );
}

/**
 * Pełne wyjaśnienie: co da się zmienić w gotowym zestawie, ile to kosztuje
 * i co zmiana oznacza dla zwrotu. `cta` prowadzi do kreatora (strona zestawu)
 * albo do listy wzorów (katalog, strona tematyczna).
 */
export function EditablePanel({ cta }: { cta: { href: string; label: string } }) {
  return (
    <div className={`${panelClass} p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-6 md:gap-10`}>
      <SheetEditIllustration />

      <div className="space-y-5 self-center">
        <ul className="space-y-4">
          {CHANGES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex w-9 h-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="w-4 h-4" aria-hidden />
              </span>
              <div>
                <p className="text-base font-black text-foreground leading-snug">{title}</p>
                <p className="mt-0.5 text-sm font-medium text-muted-foreground leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="rounded-2xl bg-[#edf6f2] dark:bg-[#002c2e] px-4 py-3 text-sm font-bold text-foreground leading-relaxed">
          Cena zostaje ta sama: {formatPrice(SHEET_PRICE)} brutto za zestaw, bez względu na to, ile zmienisz.
        </p>

        <Link
          href={cta.href}
          className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm sm:text-base font-black text-primary-foreground shadow-sm hover:bg-primary/95 transition-all active:scale-[0.98]"
        >
          <PencilRuler className="w-4 h-4" aria-hidden />
          {cta.label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
        </Link>

        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
          Zestaw zamówiony bez zmian możesz zwrócić w ciągu 14 dni. Zestaw zmieniony w kreatorze powstaje
          według Twojej specyfikacji, więc zwrotowi nie podlega.
        </p>
      </div>
    </div>
  );
}
