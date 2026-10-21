import type { Metadata } from "next";

/**
 * Wspólne dla całej witryny pola Open Graph i X. Bez tytułu, opisu i adresu:
 * podstrona bez własnego `openGraph` dziedziczy to, co jest w układzie, więc
 * tytuł i adres strony głównej trafiały do udostępnień kontaktu czy regulaminu.
 * Metadane łączą się płytko, dlatego strona z własnym `openGraph` rozwija ten
 * obiekt zamiast zaczynać od zera.
 */
export const SITE_OPEN_GRAPH = {
  siteName: "MałeNaklejki",
  locale: "pl_PL",
  type: "website",
  images: [
    {
      url: "/images/og-main.jpg",
      width: 1200,
      height: 630,
      alt: "MałeNaklejki - kreator personalizowanych naklejek na arkuszach A4",
    },
  ],
} satisfies Metadata["openGraph"];

export const SITE_TWITTER = {
  card: "summary_large_image",
  images: ["/images/og-main.jpg"],
} satisfies Metadata["twitter"];
