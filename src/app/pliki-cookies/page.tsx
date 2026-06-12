"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CookiesPolicyPage() {
  const handleResetConsent = () => {
    localStorage.removeItem("cookies-accepted");
    localStorage.removeItem("cookies-preferences");
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full prose dark:prose-invert text-justify leading-relaxed">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-foreground">Polityka Cookies (Ciasteczek)</h1>
        <p className="text-xs text-muted-foreground mb-10 text-center font-bold">Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</p>

        <h2>§ 1. Czym są pliki cookies?</h2>
        <ol>
          <li>Pliki cookies (tzw. „ciasteczka”) to małe pliki tekstowe wysyłane przez serwis internetowy i zapisywane na urządzeniu końcowym użytkownika (np. komputerze, smartfonie, tablecie) podczas przeglądania stron www.</li>
          <li>Cookies zawierają zazwyczaj nazwę strony internetowej, z której pochodzą, czas przechowywania ich na urządzeniu oraz unikalny numer.</li>
        </ol>

        <h2>§ 2. Dlaczego używamy plików cookies?</h2>
        <p>Strona MałeNaklejki wykorzystuje pliki cookies w celu:</p>
        <ol>
          <li><strong>Zapewnienia bezpieczeństwa i funkcjonalności (Niezbędne):</strong> Umożliwiają poprawne poruszanie się po serwisie, działanie koszyka zakupowego, utrzymanie sesji klienta oraz obsługę procesu zamówienia i płatności Stripe. Bez tych plików sklep nie może działać poprawnie.</li>
          <li><strong>Analizy i statystyk (Analityczne):</strong> Pomagają nam zrozumieć, w jaki sposób użytkownicy korzystają ze strony (np. które zakładki odwiedzają najchętniej). Pozwala nam to ulepszać strukturę i zawartość serwisu.</li>
          <li><strong>Personalizacji i marketingu (Marketingowe):</strong> Służą do dostosowywania wyświetlanych treści oraz reklam do preferencji użytkownika, a także do analizy skuteczności prowadzonych kampanii reklamowych.</li>
        </ol>

        <h2>§ 3. Jakie pliki cookies stosujemy?</h2>
        <p>W ramach naszego serwisu stosujemy dwa główne rodzaje plików:</p>
        <ul>
          <li><strong>Cookies sesyjne (session cookies):</strong> Są plikami tymczasowymi, które przechowywane są w urządzeniu użytkownika do czasu wylogowania, opuszczenia strony internetowej lub wyłączenia przeglądarki.</li>
          <li><strong>Cookies stałe (persistent cookies):</strong> Przechowywane są w urządzeniu użytkownika przez czas określony w parametrach plików cookies lub do czasu ich usunięcia przez użytkownika.</li>
        </ul>
        <p>Wykorzystujemy również usługi podmiotów trzecich:</p>
        <ul>
          <li><strong>Stripe:</strong> Niezbędne pliki cookies służące do autoryzacji transakcji, przeciwdziałania oszustwom i sprawnej obsługi płatności.</li>
          <li><strong>Firebase / Google Analytics:</strong> Pliki analityczne do badania ruchu i zachowań użytkowników w celu ulepszania kreatora naklejek.</li>
        </ul>

        <h2>§ 4. Zarządzanie plikami cookies</h2>
        <ol>
          <li>Podczas pierwszej wizyty w naszym serwisie wyświetlany jest baner cookies, w którym możesz wyrazić zgodę na poszczególne kategorie plików cookies.</li>
          <li>W każdej chwili możesz zmienić swoje preferencje lub wycofać zgodę, klikając poniższy przycisk resetowania zgody:
            <div className="flex justify-center my-6 not-prose">
              <button
                onClick={handleResetConsent}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-black px-6 py-3 rounded-2xl shadow-md transition-all text-sm cursor-pointer border border-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Zmień preferencje cookies (wyświetl baner ponownie)
              </button>
            </div>
          </li>
          <li>
            Możesz również zarządzać plikami cookies bezpośrednio w ustawieniach swojej przeglądarki internetowej. Blokowanie wszystkich cookies może jednak uniemożliwić prawidłowe składanie zamówień w naszym sklepie.
          </li>
        </ol>
      </main>

      <Footer />
    </div>
  );
}
