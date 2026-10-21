import type { Metadata } from "next";

// Strona jest komponentem klienckim, więc metadane siedzą tutaj;
// bez nich dziedziczyła tytuł i opis strony głównej.
export const metadata: Metadata = {
  title: "Dziękujemy za zamówienie - MałeNaklejki",
  robots: { index: false, follow: false },
};

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
