import { SHEET_PRICE, SHIPPING_PRICE, type CatalogSheet } from "./types";

/**
 * Adresy i dane strukturalne katalogu gotowych arkuszy.
 *
 * Jedno miejsce na cenę, dostawę i politykę zwrotów: te same wartości idą na
 * stronę, do JSON-LD i (docelowo) do pliku produktowego Google — rozjazd
 * między nimi to najczęstszy powód odrzucenia produktu w Merchant Center.
 * Liczby pochodzą z `blog-agent/facts.md`.
 */

export const SITE_URL = "https://www.malenaklejki.pl";
export const CATALOG_PATH = "/gotowe-arkusze";

export function sheetPath(slug: string): string {
  return `${CATALOG_PATH}/${slug}`;
}

/** Adres kreatora z wczytanym wzorem. */
export function sheetCreatorPath(id: string): string {
  return `/?arkusz=${id}`;
}

export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} zł`;
}

/** Nazwa z opisowym podtytułem: „Jesienna Kawka - naklejki jesienne z kawą i dyniami". */
export function sheetHeading(sheet: Pick<CatalogSheet, "name" | "subtitle">): string {
  return sheet.subtitle ? `${sheet.name} - ${sheet.subtitle}` : sheet.name;
}

const ORGANIZATION = { "@id": `${SITE_URL}/#organization` };

const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: SHIPPING_PRICE.toFixed(2),
    currency: "PLN",
  },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "PL" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    // Produkcja 2-3 dni robocze; czas przewozu jak w danych strony głównej.
    handlingTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 3, unitCode: "d" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "d" },
  },
};

/**
 * Gotowy arkusz zamówiony bez zmian nie jest rzeczą wykonaną według
 * specyfikacji klienta, więc podlega zwrotowi w 14 dni (regulamin §7).
 */
const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "PL",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  merchantReturnLink: `${SITE_URL}/regulamin#zwroty`,
};

export function productSchema(sheet: CatalogSheet) {
  const url = `${SITE_URL}${sheetPath(sheet.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: sheetHeading(sheet),
    description: sheet.description,
    image: sheet.productImageUrl,
    sku: sheet.id,
    mpn: sheet.id,
    brand: { "@type": "Brand", name: "MałeNaklejki" },
    category: sheet.categories.length > 0 ? `Gotowe arkusze naklejek > ${sheet.categories[0]}` : "Gotowe arkusze naklejek",
    material: "Folia winylowa",
    size: "A4 (21 × 29,7 cm)",
    offers: {
      "@type": "Offer",
      url,
      price: SHEET_PRICE.toFixed(2),
      priceCurrency: "PLN",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: ORGANIZATION,
      shippingDetails: SHIPPING_DETAILS,
      hasMerchantReturnPolicy: RETURN_POLICY,
    },
  };
}

/** Lista arkuszy na katalogu i stronie tematycznej. */
export function itemListSchema(sheets: CatalogSheet[], page: { name: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    url: `${SITE_URL}${page.path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sheets.length,
      itemListElement: sheets.map((sheet, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: sheetHeading(sheet),
        url: `${SITE_URL}${sheetPath(sheet.slug)}`,
      })),
    },
  };
}

/** Ostatni element okruszków to bieżąca strona — bez adresu. */
export function breadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path !== undefined ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}

export type Faq = { q: string; a: string };

/** Ta sama tablica zasila widoczne FAQ i schemat — nie mogą się rozjechać. */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
