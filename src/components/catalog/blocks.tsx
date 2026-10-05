import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { formatPrice, sheetCreatorPath, sheetHeading, sheetPath, type Faq } from "@/lib/sheets/schema";
import { SHEET_PRICE, type CatalogSheet } from "@/lib/sheets/types";
import { getStickersNoun } from "@/lib/utils/polish";
import { SheetImage } from "./SheetImage";

/**
 * Klocki stron gotowych zestawów: katalogu, stron tematycznych i strony
 * zestawu. Wygląd trzyma się landingów (`/etykiety-na-sloiki` jako wzorzec),
 * żeby nowe strony nie wprowadzały własnego designu.
 */

export const headingClass = "text-2xl sm:text-3xl font-black text-foreground font-heading";
export const paragraphClass = "text-sm sm:text-base text-muted-foreground font-medium leading-relaxed";
export const inlineLinkClass =
  "text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors";
export const primaryCtaClass =
  "group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300";
export const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300";
export const panelClass = "bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 shadow-sm";

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm font-bold text-muted-foreground/80 mb-4">
      <ol className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2">
        {items.map((item, index) => (
          <li
            key={item.name}
            className="flex items-center gap-1.5 sm:gap-2"
            aria-current={item.path === undefined ? "page" : undefined}
          >
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            {item.path !== undefined ? (
              <Link href={item.path} className="hover:text-primary transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-foreground font-extrabold">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TrustStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center text-center gap-1 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 py-5 px-2 shadow-sm"
        >
          <span className="text-lg sm:text-2xl font-black text-primary">{stat.value}</span>
          <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {stat.label}
          </span>
        </div>
      ))}
    </section>
  );
}

/** Tekst alternatywny obrazu zestawu — z nazwą, motywem i twardymi parametrami. */
export function sheetImageAlt(sheet: Pick<CatalogSheet, "name" | "subtitle" | "stickerCount">): string {
  return `Zestaw naklejek ${sheetHeading(sheet)}, ${sheet.stickerCount} ${getStickersNoun(
    sheet.stickerCount
  )} na folii winylowej, format A4`;
}

export function SheetCard({ sheet }: { sheet: CatalogSheet }) {
  return (
    <li className="flex flex-col rounded-3xl border border-border/40 bg-white dark:bg-[#003a3b] shadow-sm overflow-hidden">
      <Link
        href={sheetPath(sheet.slug)}
        className="group block bg-[#edf6f2] dark:bg-[#002c2e] p-4 sm:p-5"
        aria-label={`${sheetHeading(sheet)} - zobacz zestaw`}
      >
        <span className="relative block mx-auto w-full max-w-[15rem] aspect-[210/297] rounded-md bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,71,73,0.12)] transition-transform duration-300 group-hover:-translate-y-1">
          {sheet.previewUrl && (
            <SheetImage
              src={sheet.previewUrl}
              alt={sheetImageAlt(sheet)}
              sizes="(max-width: 640px) 60vw, 240px"
            />
          )}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex-1">
          <h3 className="text-lg font-black text-foreground leading-snug font-heading">
            <Link href={sheetPath(sheet.slug)} className="hover:text-primary transition-colors">
              {sheet.name}
            </Link>
          </h3>
          {sheet.subtitle && (
            <p className="mt-0.5 text-sm font-semibold text-muted-foreground leading-snug">{sheet.subtitle}</p>
          )}
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            {sheet.stickerCount} {getStickersNoun(sheet.stickerCount)} · arkusz A4 ·{" "}
            <span className="text-foreground font-black">{formatPrice(SHEET_PRICE)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={sheetPath(sheet.slug)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 h-11 text-sm font-extrabold text-primary-foreground hover:bg-primary/95 shadow-sm transition-all active:scale-[0.98]"
          >
            Zobacz zestaw
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
          <Link
            href={sheetCreatorPath(sheet.id)}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border px-4 h-11 text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-all whitespace-nowrap"
          >
            Dopasuj w kreatorze
          </Link>
        </div>
      </div>
    </li>
  );
}

export function SheetGrid({ sheets }: { sheets: CatalogSheet[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {sheets.map((sheet) => (
        <SheetCard key={sheet.id} sheet={sheet} />
      ))}
    </ul>
  );
}

const tableWrapClass = "overflow-x-auto rounded-2xl border border-border/60 shadow-sm";
const tableClass = "w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm";
const headCellClass =
  "p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground bg-[#edf6f2]/60 dark:bg-[#002c2e]/40";
const cellClass = "p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top";
const zebra = (index: number) => (index % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : "");

/** „Zestaw | Motywy | Liczba naklejek" — tabela, którą łatwo zacytować. */
export function SheetsTable({ sheets }: { sheets: CatalogSheet[] }) {
  return (
    <div className={tableWrapClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th scope="col" className={headCellClass}>Zestaw</th>
            <th scope="col" className={headCellClass}>Motywy</th>
            <th scope="col" className={`${headCellClass} whitespace-nowrap`}>Liczba naklejek</th>
          </tr>
        </thead>
        <tbody>
          {sheets.map((sheet, index) => (
            <tr key={sheet.id} className={zebra(index)}>
              <th scope="row" className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top">
                <Link href={sheetPath(sheet.slug)} className="hover:text-primary transition-colors">
                  {sheet.name}
                </Link>
              </th>
              <td className={cellClass}>{sheet.motifs.length > 0 ? sheet.motifs.join(", ") : sheet.subtitle}</td>
              <td className={`${cellClass} tabular-nums`}>{sheet.stickerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className={tableWrapClass}>
      <table className={tableClass}>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={zebra(index)}>
              <th
                scope="row"
                className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top w-2/5"
              >
                {row.label}
              </th>
              <td className={cellClass}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EDIT_STEPS = [
  {
    title: "Wybierz zestaw",
    text: "Każdy wzór to gotowy układ A4 - możesz go zamówić od razu, bez wgrywania czegokolwiek.",
  },
  {
    title: "Dopasuj po swojemu",
    text: "W kreatorze zmienisz rozmiar naklejek, usuniesz te, których nie chcesz, i dołożysz własne zdjęcie, logo albo imię.",
  },
  {
    title: "Zamów",
    text: "Płacisz BLIK-iem albo przez Przelewy24. Produkcja zajmuje 2-3 dni robocze, paczkę odbierasz w paczkomacie.",
  },
];

/** Trzy kroki: wybierz, dopasuj, zamów. */
export function EditSteps() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {EDIT_STEPS.map((step, index) => (
        <li key={step.title} className={`${panelClass} rounded-2xl p-5`}>
          <span className="flex w-9 h-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-black">
            {index + 1}
          </span>
          <p className="mt-3 text-base font-black text-foreground">{step.title}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqSection({ title, faqs }: { title: string; faqs: Faq[] }) {
  return (
    <section className="mt-12 space-y-6">
      <h2 className={headingClass}>{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-sm sm:text-base font-extrabold text-foreground list-none [&::-webkit-details-marker]:hidden">
              {faq.q}
              <span
                aria-hidden
                className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-black transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm font-semibold text-foreground/90">
          <span className="mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Check className="w-3 h-3" aria-hidden />
          </span>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}
