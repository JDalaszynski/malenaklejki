import type { Metadata } from "next";

// Strona koszyka jest komponentem klienckim, więc metadane siedzą tutaj;
// bez nich dziedziczyła tytuł i opis strony głównej.
export const metadata: Metadata = {
  title: "Koszyk - MałeNaklejki",
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
