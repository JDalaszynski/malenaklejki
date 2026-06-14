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
  title: "małe Naklejki - Stwórz własne naklejki!",
  description: "Wydrukuj swoje własne naklejki na arkuszach A4 w prosty i radosny sposób.",
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
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
