import { DocLayout, DocSection } from "@/components/layout/DocLayout";
import { ResetConsentButton } from "@/components/cookies/ResetConsentButton";
import { Info, HelpCircle, Server, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka Cookies - MałeNaklejki",
  description: "Polityka plików cookies (ciasteczek) serwisu MałeNaklejki. Dowiedz się, jakich plików cookies używamy i jak możesz nimi zarządzać.",
  alternates: {
    canonical: "/pliki-cookies",
  },
};

export default function CookiesPolicyPage() {
  const sections: DocSection[] = [
    {
      id: "czym-sa-cookies",
      title: "§ 1. Czym są pliki cookies?",
      searchText: `pliki cookies ciasteczka to małe pliki tekstowe wysyłane przez serwis internetowy i zapisywane na urządzeniu końcowym użytkownika np komputerze smartfonie tablecie podczas przeglądania stron www. Cookies zawierają nazwę strony internetowej czas przechowywania unikalny numer.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Pliki cookies (tzw. „ciasteczka”) to małe pliki tekstowe wysyłane przez serwis internetowy i zapisywane na urządzeniu końcowym użytkownika (np. komputerze, smartfonie, tablecie) podczas przeglądania stron www.
          </p>
          <p>
            2. Cookies zawierają zazwyczaj nazwę strony internetowej, z której pochodzą, czas przechowywania ich na urządzeniu oraz unikalny numer.
          </p>
        </div>
      ),
    },
    {
      id: "dlaczego-uzywamy",
      title: "§ 2. Dlaczego używamy plików cookies?",
      searchText: `bezpieczeństwo i funkcjonalność Niezbędne koszyk sesja Przelewy24. analizy i statystyk Analityczne ulepszanie. personalizacja marketing marketingowe reklamy.`,
      content: (
        <div className="space-y-4">
          <p>Strona MałeNaklejki wykorzystuje pliki cookies w celu:</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border/80 p-5 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Zapewnienia bezpieczeństwa i funkcjonalności (Niezbędne)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Umożliwiają poprawne poruszanie się po serwisie, działanie koszyka zakupowego, utrzymanie sesji klienta oraz obsługę procesu zamówienia i płatności Przelewy24. Bez tych plików sklep nie może działać poprawnie.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex gap-3">
              <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Analizy i statystyk (Analityczne)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Pomagają nam zrozumieć, w jaki sposób użytkownicy korzystają ze strony (np. które zakładki odwiedzają najchętniej). Pozwala nam to ulepszać strukturę i zawartość serwisu.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl flex gap-3">
              <Server className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground text-sm">Personalizacji i marketingu (Marketingowe)</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Służą do dostosowywania wyświetlanych treści oraz reklam do preferencji użytkownika, a także do analizy skuteczności prowadzonych kampanii reklamowych.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "jakie-stosujemy",
      title: "§ 3. Jakie pliki cookies stosujemy?",
      searchText: `cookies sesyjne session cookies pliki tymczasowe wylogowanie wyłączenie przeglądarki. cookies stałe persistent cookies czas określony. podmioty trzecie Przelewy24 autoryzacja transakcji oszustwom płatności. Firebase Google Analytics 4 GA4 Vercel Analytics badanie ruchu kreator naklejek.`,
      content: (
        <div className="space-y-4">
          <p>W ramach naszego serwisu stosujemy dwa główne rodzaje plików:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Cookies sesyjne (session cookies):</strong> Są plikami tymczasowymi, które przechowywane są w urządzeniu użytkownika do czasu wylogowania, opuszczenia strony internetowej lub wyłączenia przeglądarki.
            </li>
            <li>
              <strong>Cookies stałe (persistent cookies):</strong> Przechowywane są w urządzeniu użytkownika przez czas określony w parametrach plików cookies lub do czasu ich usunięcia przez użytkownika.
            </li>
          </ul>
          <p className="pt-2">Wykorzystujemy również usługi podmiotów trzecich:</p>
          <div className="bg-muted/40 border border-border/80 p-5 rounded-2xl space-y-3 shadow-inner">
            <div>
              <span className="inline-block text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 mb-1">
                Przelewy24
              </span>
              <p className="text-xs text-foreground font-semibold">
                Niezbędne pliki cookies służące do autoryzacji transakcji, przeciwdziałania oszustwom i sprawnej obsługi płatności online.
              </p>
            </div>
            <div className="border-t border-border/60 my-2" />
            <div>
              <span className="inline-block text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 mb-1">
                Firebase
              </span>
              <p className="text-xs text-foreground font-semibold">
                Pliki sesyjne służące do bezpiecznego przesyłania plików graficznych i zapisu danych w kreatorze naklejek.
              </p>
            </div>
            <div className="border-t border-border/60 my-2" />
            <div>
              <span className="inline-block text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 mb-1">
                Google Analytics 4
              </span>
              <p className="text-xs text-foreground font-semibold">
                Pliki analityczne wykorzystywane do badania liczby odwiedzin, źródeł ruchu oraz aktywności użytkowników na stronie w celu optymalizacji kreatora. Działają zgodnie z ustawieniami zgód (Consent Mode V2).
              </p>
            </div>
            <div className="border-t border-border/60 my-2" />
            <div>
              <span className="inline-block text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 mb-1">
                Vercel Analytics
              </span>
              <p className="text-xs text-foreground font-semibold">
                Anonimowe statystyki wydajnościowe strony oraz liczby odwiedzin służące do monitorowania sprawności działania platformy.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "zarzadzanie-cookies",
      title: "§ 4. Zarządzanie plikami cookies",
      searchText: `zarządzanie plikami cookies baner cookies wyrażenie zgody kategorie preferencje wycofanie zgody resetowanie zgody baner ponownie. ustawienia przeglądarki blokowanie.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Podczas pierwszej wizyty w naszym serwisie wyświetlany jest baner cookies, w którym możesz wyrazić zgodę na poszczególne kategorie plików cookies.
          </p>
          <p>
            2. W każdej chwili możesz zmienić swoje preferencje lub wycofać zgodę, klikając poniższy przycisk resetowania zgody:
          </p>
          <div className="flex justify-center my-6 not-prose">
            <ResetConsentButton label="Zmień preferencje cookies (wyświetl baner ponownie)" />
          </div>
          <p>
            3. Możesz również zarządzać plikami cookies bezpośrednio w ustawieniach swojej przeglądarki internetowej. Blokowanie wszystkich cookies może jednak uniemożliwić prawidłowe składanie zamówień w naszym sklepie.
          </p>
        </div>
      ),
    },
  ];

  return (
    <DocLayout
      title="Polityka Cookies (Ciasteczek)"
      description="Zasady stosowania plików cookies w serwisie MałeNaklejki. Dowiedz się, do czego służą ciasteczka oraz jak możesz kontrolować ich zapisywanie."
      lastUpdated="14 czerwca 2026 r."
      activeTab="pliki-cookies"
      sections={sections}
    />
  );
}
