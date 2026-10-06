import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, LayoutGrid, ShieldCheck } from "lucide-react";

import { CatalogListTracker } from "@/components/catalog/CatalogListTracker";
import {
  Breadcrumbs,
  FaqSection,
  SheetGrid,
  SheetsTable,
  TrustStats,
  headingClass,
  inlineLinkClass,
  panelClass,
  paragraphClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "@/components/catalog/blocks";
import { EditableCallout, EditablePanel } from "@/components/catalog/EditableSet";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSheets } from "@/lib/sheets/public";
import {
  CATALOG_PATH,
  EDIT_CTA_LABEL,
  SITE_URL,
  breadcrumbSchema,
  faqSchema,
  formatPrice,
  itemListSchema,
  type Faq,
} from "@/lib/sheets/schema";
import { THEME_PAGES } from "@/lib/sheets/themes";
import { SHEET_PRICE, SHIPPING_PRICE, type CatalogSheet } from "@/lib/sheets/types";
import { getDesignsNoun } from "@/lib/utils/polish";

/**
 * Katalog gotowych zestawów.
 *
 * Leksyk tej strony to „gotowe / wzory / zestaw / arkusz" — fraza „naklejki na
 * zamówienie z własnym nadrukiem" należy do strony głównej i tu jej nie ma
 * w tytule ani w H1 (zero kanibalizacji, `landing-agent/strategy.md`).
 * Liczby wyłącznie z `blog-agent/facts.md`.
 */

const PAGE_NAME = "Gotowe zestawy naklejek";
const TITLE = "Gotowe zestawy naklejek - wzory na folii winylowej, 49 zł";
const DESCRIPTION =
  "Gotowe zestawy naklejek: kilkadziesiąt naklejek na arkuszu A4 z folii winylowej odpornej na wodę i UV. 49,00 zł brutto. Każdy zestaw zmienisz: usuniesz naklejki i dodasz własne.";
/** Data ostatniej realnej zmiany treści strony (nie listy zestawów). */
const UPDATED = { label: "6 października 2026", iso: "2026-10-06T00:00:00+02:00" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CATALOG_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${CATALOG_PATH}`, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

function buildFaqs(sheets: CatalogSheet[]): Faq[] {
  const counts = sheets.map((sheet) => sheet.stickerCount);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const range = min === max ? `${min}` : `od ${min} do ${max}`;

  return [
    {
      q: "Czy można kupić gotowe naklejki bez własnej grafiki?",
      a: `Tak. Gotowy zestaw zamawiasz bez wgrywania czegokolwiek: wybierasz wzór, dodajesz go do koszyka i płacisz ${formatPrice(
        SHEET_PRICE
      )} brutto za zestaw, czyli jeden arkusz A4. Własne zdjęcia i grafiki są potrzebne tylko wtedy, gdy chcesz ułożyć własny zestaw od zera w kreatorze.`,
    },
    {
      q: "Ile naklejek jest w gotowym zestawie?",
      a: `W obecnych wzorach jest ${range} naklejek na jednym arkuszu A4. Dokładną liczbę i listę motywów podajemy przy każdym zestawie. Cena nie zależy od liczby naklejek - płacisz za zestaw.`,
    },
    {
      q: "Czy mogę zmienić gotowy zestaw przed zamówieniem?",
      a: `Tak, każdy gotowy zestaw jest w pełni edytowalny. Przycisk „${EDIT_CTA_LABEL}” otwiera go w kreatorze, gdzie usuniesz naklejki, których nie chcesz, zmienisz rozmiar pozostałych i dodasz własne zdjęcia, logo albo grafiki. Cena zestawu zostaje taka sama.`,
    },
    {
      q: "Czy mogę dodać własne naklejki do gotowego zestawu?",
      a: "Tak. Po otwarciu zestawu w kreatorze wgrywasz własne zdjęcie albo grafikę, a kreator usuwa tło i wyznacza linię cięcia. Gotowe zestawy wypełniają prawie cały arkusz A4, więc żeby zrobić miejsce na swoje, najpierw usuń kilka naklejek.",
    },
    {
      q: "Czy mogę zamówić gotowy zestaw i własny zestaw naklejek w jednej paczce?",
      a: `Tak. W jednym zamówieniu łączysz dowolne zestawy, gotowe i własne. Dostawa do paczkomatu kosztuje ${formatPrice(
        SHIPPING_PRICE
      )} i jest liczona raz za całe zamówienie.`,
    },
    {
      q: "Czy gotowe naklejki są wodoodporne?",
      a: "Tak. Wszystkie zestawy drukujemy na folii winylowej odpornej na wodę i promieniowanie UV, z mocnym klejem, który nie zostawia śladów. Folia nie nadaje się do zmywarki - oklejone przedmioty myj ręcznie.",
    },
    {
      q: "Czy gotowy zestaw można zwrócić?",
      a: "Tak. Gotowy zestaw zamówiony bez zmian możesz zwrócić w ciągu 14 dni od odbioru. Zestaw zmieniony w kreatorze powstaje według Twojej specyfikacji, więc zwrotowi nie podlega.",
    },
    {
      q: "Ile trwa realizacja zamówienia?",
      a: "Produkcja zajmuje 2-3 dni robocze od zaksięgowania płatności. Gotową paczkę wysyłamy do wybranego paczkomatu.",
    },
  ];
}

export default async function CatalogPage() {
  const sheets = await getCatalogSheets();
  // Katalog istnieje tylko przy trybie „Włączony" i tylko z zestawami do pokazania.
  if (sheets.length === 0) notFound();

  const faqs = buildFaqs(sheets);
  const themes = THEME_PAGES.filter((theme) => theme.path !== CATALOG_PATH);

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd data={breadcrumbSchema([{ name: "Strona główna", path: "" }, { name: PAGE_NAME }])} />
      <JsonLd data={itemListSchema(sheets, { name: PAGE_NAME, path: CATALOG_PATH })} />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: PAGE_NAME,
          url: `${SITE_URL}${CATALOG_PATH}`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          dateModified: UPDATED.iso,
        }}
      />
      <CatalogListTracker sheets={sheets} list="katalog" />

      <Header />

      <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <Breadcrumbs items={[{ name: "Kreator Zestawu Naklejek", path: "/" }, { name: "Gotowe zestawy" }]} />

        {/* Hero */}
        <section className={`${panelClass} p-6 sm:p-10 md:p-12 space-y-5`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <LayoutGrid className="w-4 h-4" aria-hidden />
            Wzory do zamówienia od ręki
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Gotowe zestawy naklejek
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Wybierz <strong>gotowy zestaw naklejek</strong> zamiast szukać grafik. Każdy to jeden arkusz A4
            z kilkudziesięcioma naklejkami wokół jednego tematu, drukowany na{" "}
            <strong>folii winylowej odpornej na wodę i UV</strong>. Stała cena{" "}
            <strong>{formatPrice(SHEET_PRICE)} brutto za zestaw</strong>, produkcja w{" "}
            <strong>2-3 dni robocze</strong> i odbiór w paczkomacie.
          </p>

          <EditableCallout detailsHref="#zmiany" />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="#wzory" className={primaryCtaClass}>
              Zobacz {sheets.length} {getDesignsNoun(sheets.length)}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </a>
            <Link href="/" className={secondaryCtaClass}>
              Ułóż zestaw z własnych grafik
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden /> Ostatnia aktualizacja: {UPDATED.label}
            </span>
          </div>
        </section>

        <TrustStats
          stats={[
            { value: "49 zł", label: "Brutto za zestaw" },
            { value: `${sheets.length}`, label: "Wzorów do wyboru" },
            { value: "Woda i UV", label: "Folia winylowa" },
            { value: "2-3 dni", label: "Produkcja robocze" },
          ]}
        />

        {/* Siatka zestawów */}
        <section id="wzory" className="mt-12 space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <h2 className={headingClass}>Wzory naklejek do wyboru</h2>
            <p className={paragraphClass}>
              Zamów zestaw tak, jak jest, albo wybierz „{EDIT_CTA_LABEL}” - usuniesz naklejki, których nie
              chcesz, i dodasz własne.
            </p>
          </div>
          {themes.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <li key={theme.path}>
                  <Link
                    href={theme.path}
                    className="inline-flex items-center rounded-full border border-border bg-white dark:bg-[#003a3b] px-4 py-2 text-sm font-extrabold text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {theme.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <SheetGrid sheets={sheets} />
        </section>

        {/* Edycja */}
        <section id="zmiany" className="mt-12 space-y-5 scroll-mt-24">
          <div className="space-y-2">
            <h2 className={headingClass}>Gotowy zestaw możesz zmienić po swojemu</h2>
            <p className={paragraphClass}>
              Każdy zestaw jest w pełni edytowalny. Otwierasz go w tym samym kreatorze, w którym układa się
              własne naklejki, i zamawiasz dopiero wtedy, gdy jest taki, jak chcesz.
            </p>
          </div>
          <EditablePanel cta={{ href: "#wzory", label: "Wybierz zestaw do zmiany" }} />
        </section>

        {/* Tabela wzorów */}
        <section className="mt-12 space-y-5">
          <h2 className={headingClass}>Co jest w którym zestawie</h2>
          <p className={paragraphClass}>
            Zestawienie wszystkich wzorów: motywy i dokładna liczba naklejek w każdym zestawie.
          </p>
          <SheetsTable sheets={sheets} />
        </section>

        {/* Ceny */}
        <section className="mt-12 space-y-5">
          <h2 className={headingClass}>Ile kosztują gotowe naklejki</h2>
          <p className={paragraphClass}>
            Zestaw na arkuszu A4 kosztuje {formatPrice(SHEET_PRICE)} brutto, bez względu na wzór i liczbę naklejek.
            Dostawa do paczkomatu to {formatPrice(SHIPPING_PRICE)} za całe zamówienie, więc drugi i trzeci
            zestaw - gotowy albo{" "}
            <Link href="/" className={inlineLinkClass}>
              z własnymi naklejkami
            </Link>{" "}
            - jedzie w tej samej paczce bez dopłaty za wysyłkę.
          </p>
        </section>

        <FaqSection title="Gotowe zestawy naklejek - najczęstsze pytania" faqs={faqs} />

        {/* Final CTA */}
        <section className={`mt-12 ${panelClass} p-6 sm:p-10 text-center space-y-4`}>
          <h2 className={headingClass}>Nie ma tu Twojego tematu?</h2>
          <p className={`${paragraphClass} max-w-2xl mx-auto`}>
            Wgraj własne zdjęcia albo grafiki, a kreator usunie tło, wyznaczy linię cięcia i ułoży arkusz A4.
            Ta sama folia, ta sama cena.
          </p>
          <Link href="/" className={primaryCtaClass}>
            Otwórz kreator naklejek
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
