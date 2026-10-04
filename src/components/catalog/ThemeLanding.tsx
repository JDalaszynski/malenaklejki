import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Sparkles } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CATALOG_PATH,
  SITE_URL,
  breadcrumbSchema,
  faqSchema,
  formatPrice,
  itemListSchema,
  type Faq,
} from "@/lib/sheets/schema";
import { SHEET_PRICE, SHIPPING_PRICE, type CatalogSheet } from "@/lib/sheets/types";
import { getDesignsNoun } from "@/lib/utils/polish";
import { CatalogListTracker } from "./CatalogListTracker";
import {
  Breadcrumbs,
  EditSteps,
  FaqSection,
  OrderTotalsTable,
  SheetGrid,
  SheetsTable,
  TrustStats,
  headingClass,
  inlineLinkClass,
  panelClass,
  paragraphClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./blocks";

/**
 * Treść strony tematycznej — wszystko, co jest pisane ręcznie. Listę arkuszy
 * strona bierze z panelu (temat arkusza), więc nowy wzór pojawia się na niej
 * bez ruszania kodu.
 */
export type ThemeContent = {
  /** Adres strony, np. `/naklejki-swiateczne` — ten sam co w `THEME_PAGES`. */
  path: string;
  /** Krótka nazwa do okruszków i nawigacji, np. „Naklejki świąteczne". */
  name: string;
  /** Etykieta nad nagłówkiem. */
  badge: string;
  /** H1 z frazą główną, np. „Naklejki świąteczne - gotowe arkusze A4". */
  h1: string;
  /** Pierwszy akapit (BLUF): bezpośrednia odpowiedź i twarde fakty. */
  intro: ReactNode;
  /** Nagłówek nad siatką arkuszy. */
  gridHeading: string;
  /** Zastosowania tematu — 3-5 akapitów z linkami do wpisów. */
  uses: { heading: string; items: { title: string; text: ReactNode }[] };
  /** Dodatkowe sekcje, np. podtemat z własną listą arkuszy. */
  sections?: { id?: string; heading: string; body: ReactNode; sheets?: CatalogSheet[] }[];
  /** Jedna tablica dla widocznego FAQ i schematu. */
  faqs: Faq[];
  faqHeading: string;
  /** Data ostatniej realnej zmiany treści. */
  updated: { label: string; iso: string };
};

/**
 * Strona tematyczna gotowych arkuszy (strona kategorii sklepu): siatka
 * arkuszy stoi nad treścią, pod nią tabela, edycja, rachunek zamówienia,
 * zastosowania i FAQ. Anatomia wg `landing-agent/strategia-gotowe-arkusze.md` §6.
 */
export function ThemeLanding({ content, sheets }: { content: ThemeContent; sheets: CatalogSheet[] }) {
  const list = `temat: ${content.name}` as const;

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Strona główna", path: "" },
          { name: "Gotowe arkusze", path: CATALOG_PATH },
          { name: content.name },
        ])}
      />
      <JsonLd data={itemListSchema(sheets, { name: content.h1, path: content.path })} />
      <JsonLd data={faqSchema(content.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: content.h1,
          url: `${SITE_URL}${content.path}`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          dateModified: content.updated.iso,
        }}
      />
      <CatalogListTracker sheets={sheets} list={list} />

      <Header />

      <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { name: "Kreator Zestawu Naklejek", path: "/" },
            { name: "Gotowe arkusze", path: CATALOG_PATH },
            { name: content.name },
          ]}
        />

        {/* Hero */}
        <section className={`${panelClass} p-6 sm:p-10 md:p-12 space-y-5`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-4 h-4" aria-hidden />
            {content.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            {content.h1}
          </h1>
          <div className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">{content.intro}</div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="#wzory" className={primaryCtaClass}>
              Zobacz {sheets.length} {getDesignsNoun(sheets.length)}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </a>
            <Link href={CATALOG_PATH} className={secondaryCtaClass}>
              Wszystkie gotowe arkusze
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden /> Ostatnia aktualizacja: {content.updated.label}
            </span>
          </div>
        </section>

        <TrustStats
          stats={[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: `${sheets.length}`, label: "Wzorów w temacie" },
            { value: "Woda i UV", label: "Folia winylowa" },
            { value: "2-3 dni", label: "Produkcja robocze" },
          ]}
        />

        <section id="wzory" className="mt-12 space-y-6 scroll-mt-24">
          <h2 className={headingClass}>{content.gridHeading}</h2>
          <SheetGrid sheets={sheets} />
        </section>

        <section className="mt-12 space-y-5">
          <h2 className={headingClass}>Co jest na którym arkuszu</h2>
          <SheetsTable sheets={sheets} />
        </section>

        {content.sections?.map((section) => (
          <section key={section.heading} id={section.id} className="mt-12 space-y-5 scroll-mt-24">
            <h2 className={headingClass}>{section.heading}</h2>
            <div className={`${paragraphClass} space-y-4`}>{section.body}</div>
            {section.sheets && section.sheets.length > 0 && <SheetGrid sheets={section.sheets} />}
          </section>
        ))}

        <section className="mt-12 space-y-5">
          <h2 className={headingClass}>Każdy arkusz możesz zmienić przed zamówieniem</h2>
          <EditSteps />
        </section>

        <section className="mt-12 space-y-5">
          <h2 className={headingClass}>Ile kosztuje zamówienie</h2>
          <p className={paragraphClass}>
            Arkusz A4 to {formatPrice(SHEET_PRICE)} brutto. Dostawa do paczkomatu kosztuje{" "}
            {formatPrice(SHIPPING_PRICE)} za całe zamówienie, więc kolejny arkusz - gotowy albo{" "}
            <Link href="/" className={inlineLinkClass}>
              ułożony z własnych grafik
            </Link>{" "}
            - dokładasz bez dopłaty za wysyłkę.
          </p>
          <OrderTotalsTable />
        </section>

        <section className="mt-12 space-y-6">
          <h2 className={headingClass}>{content.uses.heading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.uses.items.map((item) => (
              <div key={item.title} className={`${panelClass} rounded-2xl p-5`}>
                <h3 className="text-base font-black text-foreground">{item.title}</h3>
                <div className="mt-1.5 text-sm font-medium text-muted-foreground leading-relaxed">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <FaqSection title={content.faqHeading} faqs={content.faqs} />

        <section className={`mt-12 ${panelClass} p-6 sm:p-10 text-center space-y-4`}>
          <h2 className={headingClass}>Wolisz własny motyw?</h2>
          <p className={`${paragraphClass} max-w-2xl mx-auto`}>
            Wgraj swoje zdjęcia albo grafiki, a kreator usunie tło, wyznaczy linię cięcia i ułoży arkusz A4.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/" className={primaryCtaClass}>
              Otwórz kreator naklejek
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>
            <Link href={CATALOG_PATH} className={secondaryCtaClass}>
              Wszystkie gotowe arkusze
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
