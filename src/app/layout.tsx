import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import { InteractiveBackground } from "@/components/layout/InteractiveBackground";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://malenaklejki.pl"),
  title: "małeNaklejki - Stwórz własne naklejki!",
  description: "Wydrukuj swoje własne naklejki na arkuszach A4 w prosty i przyjemny sposób.",
  icons: {
    icon: "/images/logo/favicon.png?v=2",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "małeNaklejki - Stwórz własne naklejki!",
    description: "Wydrukuj swoje własne naklejki na arkuszach A4 w prosty i przyjemny sposób.",
    url: "https://malenaklejki.pl",
    siteName: "małeNaklejki",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/images/logo/favicon.png?v=2",
        width: 512,
        height: 512,
        alt: "małeNaklejki - Kreator Naklejek A4",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "małeNaklejki - Stwórz własne naklejki!",
    description: "Wydrukuj swoje własne naklejki na arkuszach A4 w prosty i przyjemny sposób.",
    images: ["/images/logo/favicon.png?v=2"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
               try {
                if (localStorage.theme === 'dark' || ((!localStorage.theme || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans relative">
        <InteractiveBackground />
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
