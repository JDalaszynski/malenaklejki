import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SheetProduct, sheetPageTitle } from "@/components/catalog/SheetProduct";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCatalogSheetBySlug, getCatalogSheets } from "@/lib/sheets/public";
import { CATALOG_PATH, breadcrumbSchema, formatPrice, productSchema, sheetPath } from "@/lib/sheets/schema";
import { SHEET_PRICE, normalizeForSearch } from "@/lib/sheets/types";
import { getStickersNoun } from "@/lib/utils/polish";

/**
 * Strona gotowego zestawu — produkt z ceną i „Dodaj do koszyka".
 *
 * Statyczna, generowana z zestawów opublikowanych w panelu; zapis zestawu
 * i zmiana trybu widoczności odświeżają ją od razu (`refreshSheetViews`).
 * Poza trybem „Włączony" żadna strona zestawu nie istnieje.
 */
export async function generateStaticParams() {
  return (await getCatalogSheets()).map((sheet) => ({ slug: sheet.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sheet = await getCatalogSheetBySlug(slug);
  if (!sheet) return {};

  const title = sheetPageTitle(sheet);
  const count = `${sheet.stickerCount} ${getStickersNoun(sheet.stickerCount)}`;
  const description = `${sheet.name}: ${count} na arkuszu A4 z folii winylowej odpornej na wodę i UV. ${formatPrice(
    SHEET_PRICE
  )} brutto, zamów od razu albo dopasuj zestaw w kreatorze.`;

  return {
    title,
    description,
    alternates: { canonical: sheetPath(sheet.slug) },
    openGraph: {
      title,
      description,
      url: sheetPath(sheet.slug),
      type: "website",
      images: [{ url: sheet.productImageUrl, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [sheet.productImageUrl] },
  };
}

export default async function SheetPage({ params }: Props) {
  const { slug } = await params;
  const sheets = await getCatalogSheets();
  const sheet = sheets.find((item) => item.slug === slug);
  if (!sheet) notFound();

  // Najpierw zestawy z tego samego tematu, potem najnowsze z pozostałych.
  const themes = sheet.categories.map(normalizeForSearch);
  const others = sheets.filter((item) => item.id !== sheet.id);
  const sameTheme = others.filter((item) => item.categories.some((c) => themes.includes(normalizeForSearch(c))));
  const related = [...sameTheme, ...others.filter((item) => !sameTheme.includes(item))].slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd data={productSchema(sheet)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Strona główna", path: "" },
          { name: "Gotowe zestawy", path: CATALOG_PATH },
          { name: sheet.name },
        ])}
      />

      <Header />
      <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <SheetProduct sheet={sheet} related={related} />
      </main>
      <Footer />
    </div>
  );
}
