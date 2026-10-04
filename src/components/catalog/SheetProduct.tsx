import Link from "next/link";
import { ArrowRight, Clock, Droplets, ShieldCheck, Truck } from "lucide-react";

import { CATALOG_PATH, formatPrice, sheetHeading } from "@/lib/sheets/schema";
import { THEME_PAGES } from "@/lib/sheets/themes";
import { SHEET_PRICE, SHIPPING_PRICE, normalizeForSearch, type CatalogSheet } from "@/lib/sheets/types";
import { getStickersNoun } from "@/lib/utils/polish";
import { AddReadySheetToCart } from "./AddReadySheetToCart";
import {
  Breadcrumbs,
  EditSteps,
  SheetGrid,
  SpecTable,
  headingClass,
  inlineLinkClass,
  panelClass,
  paragraphClass,
  secondaryCtaClass,
  sheetImageAlt,
} from "./blocks";
import { SheetImage } from "./SheetImage";

/** Strona tematyczna arkusza, jeśli taka już istnieje. */
function themeOf(sheet: CatalogSheet) {
  const keys = sheet.categories.map(normalizeForSearch);
  return THEME_PAGES.find((theme) => keys.includes(normalizeForSearch(theme.category)));
}

/**
 * Treść strony gotowego arkusza: produkt z ceną, zakupem i opisem.
 * Ten sam widok pokazuje publiczna strona `/gotowe-arkusze/<slug>`
 * i podgląd w panelu.
 */
export function SheetProduct({ sheet, related }: { sheet: CatalogSheet; related: CatalogSheet[] }) {
  const theme = themeOf(sheet);
  const paragraphs = sheet.description.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const count = `${sheet.stickerCount} ${getStickersNoun(sheet.stickerCount)}`;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Kreator Zestawu Naklejek", path: "/" },
          { name: "Gotowe arkusze", path: CATALOG_PATH },
          ...(theme ? [{ name: theme.label, path: theme.path }] : []),
          { name: sheet.name },
        ]}
      />

      {/* Produkt */}
      <section className={`${panelClass} p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10`}>
        <div className="rounded-2xl bg-[#edf6f2] dark:bg-[#002c2e] p-4 sm:p-6 flex items-center justify-center">
          <div className="relative w-full max-w-[26rem] aspect-[210/297] rounded-lg bg-white overflow-hidden shadow-[0_14px_40px_rgba(0,71,73,0.16)]">
            <SheetImage
              src={sheet.productImageUrl}
              alt={sheetImageAlt(sheet)}
              sizes="(max-width: 768px) 88vw, 416px"
              hero
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {sheet.categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase"
                >
                  {category}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight tracking-tight text-foreground font-heading">
              {sheet.name}{" "}
              {sheet.subtitle && (
                <span className="mt-1.5 block text-base sm:text-lg font-extrabold leading-snug text-muted-foreground font-sans tracking-normal">
                  {sheet.subtitle}
                </span>
              )}
            </h1>
            <p className="mt-3 text-sm font-bold text-muted-foreground">
              {count} · arkusz A4 · folia winylowa
            </p>
          </div>

          <p className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground tracking-tight">{formatPrice(SHEET_PRICE)}</span>
            <span className="text-sm font-bold text-muted-foreground">brutto za arkusz</span>
          </p>

          <AddReadySheetToCart
            sheet={{
              id: sheet.id,
              slug: sheet.slug,
              name: sheet.name,
              category: sheet.category,
              version: sheet.version,
              stickerCount: sheet.stickerCount,
              printUrl: sheet.printUrl,
              cutLinesUrl: sheet.cutLinesUrl,
            }}
          />

          <ul className="grid grid-cols-1 gap-2 border-t border-border/50 pt-4 text-xs font-bold text-muted-foreground">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary shrink-0" aria-hidden />
              Produkcja 2-3 dni robocze
            </li>
            <li className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" aria-hidden />
              Odbiór w paczkomacie, dostawa {formatPrice(SHIPPING_PRICE)}
            </li>
            <li className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary shrink-0" aria-hidden />
              Folia odporna na wodę i promieniowanie UV
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden />W 100% polska produkcja
            </li>
          </ul>
        </div>
      </section>

      {/* Opis */}
      <section className="mt-12 space-y-4">
        <h2 className={headingClass}>Co jest na arkuszu {sheet.name}</h2>
        {paragraphs.map((text) => (
          <p key={text.slice(0, 40)} className={paragraphClass}>
            {text}
          </p>
        ))}
        {sheet.motifs.length > 0 && (
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Motywy na arkuszu</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {sheet.motifs.map((motif) => (
                <li
                  key={motif}
                  className="rounded-full border border-border/60 bg-white dark:bg-[#003a3b] px-3 py-1 text-xs font-bold text-foreground"
                >
                  {motif}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Parametry */}
      <section className="mt-12 space-y-5">
        <h2 className={headingClass}>Parametry arkusza</h2>
        <SpecTable
          rows={[
            { label: "Format", value: "Arkusz A4 (21 × 29,7 cm)" },
            { label: "Liczba naklejek", value: `${count}, każda wycięta osobno` },
            { label: "Materiał", value: "Folia winylowa o subtelnym połysku, mocny klej, który nie zostawia śladów" },
            { label: "Odporność", value: "Woda i promieniowanie UV. Mycie ręczne - folia nie nadaje się do zmywarki" },
            { label: "Forma zestawu", value: "Naklejki na arkuszu albo pojedyncze sztuki docięte osobno" },
            { label: "Cena", value: `${formatPrice(SHEET_PRICE)} brutto za arkusz` },
            { label: "Realizacja", value: `Produkcja 2-3 dni robocze, odbiór w paczkomacie (${formatPrice(SHIPPING_PRICE)})` },
          ]}
        />
        <p className={paragraphClass}>
          Więcej o samym materiale znajdziesz na stronie{" "}
          <Link href="/naklejki-foliowe" className={inlineLinkClass}>
            naklejek foliowych
          </Link>
          .
        </p>
      </section>

      {/* Edycja */}
      <section className="mt-12 space-y-5">
        <h2 className={headingClass}>Chcesz coś zmienić? Dopasuj arkusz przed zamówieniem</h2>
        <p className={paragraphClass}>
          Gotowy arkusz to punkt wyjścia, nie zamknięty zestaw. Otwórz go w kreatorze, a każdą naklejkę
          powiększysz, zmniejszysz albo usuniesz - w zwolnione miejsce dołożysz własne zdjęcie, logo albo
          imię. Cena arkusza się nie zmienia.
        </p>
        <EditSteps />
      </section>

      {/* Drugi arkusz */}
      <section className="mt-12 space-y-5">
        <h2 className={headingClass}>Dołóż drugi arkusz - dostawa liczona raz</h2>
        <p className={paragraphClass}>
          Dostawa do paczkomatu kosztuje {formatPrice(SHIPPING_PRICE)} za całe zamówienie, niezależnie od
          liczby arkuszy. Do tego wzoru możesz dołożyć inny{" "}
          <Link href={CATALOG_PATH} className={inlineLinkClass}>
            gotowy arkusz
          </Link>{" "}
          albo{" "}
          <Link href="/" className={inlineLinkClass}>
            arkusz z własnymi naklejkami
          </Link>{" "}
          - wszystko przyjedzie w jednej paczce.
        </p>
      </section>

      {/* Zwroty */}
      <section className="mt-12 space-y-3">
        <h2 className={headingClass}>Zwrot</h2>
        <p className={paragraphClass}>
          Arkusz {sheet.name} zamówiony bez zmian możesz zwrócić w ciągu 14 dni od odbioru, bez podawania
          przyczyny. Arkusz zmieniony w kreatorze powstaje według Twojej specyfikacji i zwrotowi nie podlega.
          Szczegóły opisuje{" "}
          <Link href="/regulamin#zwroty" className={inlineLinkClass}>
            regulamin sklepu
          </Link>
          .
        </p>
      </section>

      {related.length > 0 && (
        <section className="mt-12 space-y-6">
          <h2 className={headingClass}>Pasuje do tego arkusza</h2>
          <SheetGrid sheets={related} />
        </section>
      )}

      <section className={`mt-12 ${panelClass} p-6 sm:p-10 text-center space-y-4`}>
        <h2 className={headingClass}>Szukasz innego motywu?</h2>
        <p className={`${paragraphClass} max-w-2xl mx-auto`}>
          Przejrzyj pozostałe gotowe arkusze albo ułóż własny z dowolnych zdjęć i grafik.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href={CATALOG_PATH} className={secondaryCtaClass}>
            Wszystkie gotowe arkusze
          </Link>
          <Link href="/" className={secondaryCtaClass}>
            Ułóż własny arkusz
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

/** Tytuł strony arkusza: nazwa, motyw i twarde parametry. */
export function sheetPageTitle(sheet: CatalogSheet): string {
  return `${sheetHeading(sheet)}, arkusz A4`;
}
