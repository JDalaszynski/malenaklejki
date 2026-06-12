import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Analytics } from "@vercel/analytics/react";
import { InteractiveBackground } from "@/components/layout/InteractiveBackground";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
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
      className={`${nunito.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('mixed');
                } else if (localStorage.theme === 'light') {
                  document.documentElement.classList.remove('dark', 'mixed');
                } else if (localStorage.theme === 'mixed') {
                  document.documentElement.classList.add('mixed');
                  document.documentElement.classList.remove('dark');
                } else {
                  // Default theme is light
                  document.documentElement.classList.remove('dark', 'mixed');
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
