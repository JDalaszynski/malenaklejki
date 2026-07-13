import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import { InteractiveBackground } from "@/components/layout/InteractiveBackground";
import Script from "next/script";
import { JsonLd } from "@/components/seo/JsonLd";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.malenaklejki.pl"),
  title: "Naklejki z własnym nadrukiem | Zamów od 1 szt. online — MałeNaklejki",
  description:
    "Zaprojektuj personalizowane naklejki w kreatorze online — cięcie po konturze, druk na trwałym winylu, od 49 zł/arkusz A4. Wysyłka w 3 dni robocze. Generator AI w cenie!",
  icons: {
    icon: "/images/logo/favicon.png?v=2",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Naklejki z własnym nadrukiem | Zamów od 1 szt. online — MałeNaklejki",
    description:
      "Zaprojektuj personalizowane naklejki w kreatorze online — cięcie po konturze, druk na trwałym winylu, od 49 zł/arkusz A4. Wysyłka w 3 dni robocze.",
    url: "https://www.malenaklejki.pl",
    siteName: "MałeNaklejki",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/images/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "MałeNaklejki — kreator personalizowanych naklejek na arkuszach A4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naklejki z własnym nadrukiem | Zamów od 1 szt. — MałeNaklejki",
    description:
      "Zaprojektuj personalizowane naklejki w kreatorze online — cięcie po konturze, druk na trwałym winylu, od 49 zł/arkusz A4. Generator AI w cenie!",
    images: ["/images/og-main.jpg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-toggle"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
               try {
                if (localStorage.theme === 'dark' || (localStorage.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <Script
            id="ga-consent"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                
                let consentMode = {
                  analytics_storage: 'denied',
                  ad_storage: 'denied',
                  personalization_storage: 'denied'
                };
                
                try {
                  const storedPrefs = localStorage.getItem('cookies-preferences');
                  if (storedPrefs) {
                    const prefs = JSON.parse(storedPrefs);
                    if (prefs.analytical) consentMode.analytics_storage = 'granted';
                    if (prefs.marketing) consentMode.ad_storage = 'granted';
                  } else if (localStorage.getItem('cookies-accepted') === 'true') {
                    consentMode.analytics_storage = 'granted';
                    consentMode.ad_storage = 'granted';
                  }
                } catch (e) {
                  console.error('Failed to parse cookie preferences for GA:', e);
                }

                gtag('consent', 'default', {
                  'analytics_storage': consentMode.analytics_storage,
                  'ad_storage': consentMode.ad_storage,
                  'personalization_storage': consentMode.personalization_storage,
                  'wait_for_update': 500
                });

                gtag('js', new Date());
              `,
            }}
          />
        )}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MałeNaklejki",
            url: "https://www.malenaklejki.pl",
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MałeNaklejki",
            url: "https://www.malenaklejki.pl",
            logo: "https://www.malenaklejki.pl/images/logo/favicon.png",
            description:
              "Kreator personalizowanych naklejek z własnym nadrukiem na arkuszach A4. Cięcie po konturze, druk na trwałym winylu, wysyłka w 3 dni robocze.",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              url: "https://www.malenaklejki.pl/kontakt",
              availableLanguage: "Polish",
            },
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans relative" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <InteractiveBackground />
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
