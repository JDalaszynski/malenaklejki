import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Regulamin - MałeNaklejki",
};

export default function RegulaminPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full prose dark:prose-invert text-justify leading-relaxed">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-foreground">Regulamin Sklepu Internetowego MałeNaklejki</h1>
        <p className="text-xs text-muted-foreground mb-10 text-center font-bold">Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}</p>

        <h2>§ 1. Postanowienia ogólne</h2>
        <ol>
          <li>Sklep internetowy działający pod adresem <strong>MałeNaklejki</strong> prowadzony jest przez:
            <div className="bg-card border border-border/60 p-4 rounded-2xl my-4 space-y-1 text-sm font-semibold not-prose">
              <p>Firma: <span className="text-primary font-bold">Jakub Dalaszyński</span></p>
              <p>NIP: <span className="text-primary font-bold">6972414844</span></p>
              <p>REGON: <span className="text-primary font-bold">544772342</span></p>
              <p>Adres e-mail: <span className="text-primary font-bold">kontakt@malenaklejki.pl</span></p>
              <p>Telefon: <span className="text-primary font-bold">695527166</span></p>
            </div>
            zwany dalej <strong>„Sprzedawcą”</strong>.
          </li>
          <li>Niniejszy Regulamin określa zasady korzystania ze Sklepu, składania zamówień na produkty personalizowane (naklejki na arkuszach A4), sposoby płatności, dostawy, a także procedury reklamacyjne.</li>
          <li>Wszystkie ceny podane w Sklepie są cenami brutto (zawierają podatek VAT) i są wyrażone w złotych polskich (PLN). Ceny nie zawierają kosztów dostawy.</li>
        </ol>

        <h2>§ 2. Definicje</h2>
        <ol>
          <li><strong>Klient</strong> – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, składająca zamówienie w Sklepie.</li>
          <li><strong>Konsument</strong> – osoba fizyczna dokonująca ze Sprzedawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.</li>
          <li><strong>Produkt / Naklejka</strong> – nieprefabrykowany towar personalizowany (arkusz A4 z naklejkami o określonej przez Klienta szerokości, wysokości, kącie obrotu oraz linii cięcia) wyprodukowany według specyfikacji Klienta.</li>
          <li><strong>Kreator</strong> – narzędzie internetowe dostępne w Sklepie umożliwiające Klientowi wgranie własnej grafiki, edycję (usuwanie tła za pomocą sztucznej inteligencji, kadrowanie), wybór konturu cięcia oraz pozycjonowanie na arkuszu.</li>
          <li><strong>Generator AI</strong> – opcjonalna funkcja Sklepu umożliwiająca generowanie grafik na podstawie opisów tekstowych (promptów) przy użyciu sztucznej inteligencji, z możliwością ich późniejszego umieszczenia na arkuszu jako Naklejki.</li>
        </ol>

        <h2>§ 3. Zasady korzystania z Kreatora i prawa autorskie</h2>
        <ol>
          <li>Klient przesyłający grafikę/zdjęcie do Kreatora oświadcza, że posiada wszelkie prawa autorskie, licencje lub zgody na wykorzystanie tego pliku w celu produkcji Naklejek.</li>
          <li>Zabrania się wgrywania treści o charakterze bezprawnym, nawołujących do nienawiści, wulgarnych, naruszających dobra osobiste osób trzecich lub zastrzeżone znaki towarowe bez posiadania odpowiedniej licencji. Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku podejrzenia naruszenia prawa.</li>
          <li>Klient ponosi wyłączną odpowiedzialność za wszelkie roszczenia osób trzecich wynikające z naruszenia ich praw (w tym praw autorskich) w związku z grafikami przesłanymi do realizacji.</li>
          <li>W przypadku korzystania z Generatora AI, Klient przyjmuje do wiadomości, że uzyskane grafiki generowane są automatycznie. Klient ponosi odpowiedzialność za zgodność wygenerowanych obrazów z prawem oraz regulaminem.</li>
        </ol>

        <h2>§ 4. Wymagania techniczne i jakość wydruku</h2>
        <ol>
          <li>Sklep informuje Klienta w czasie rzeczywistym o jakości wgranej grafiki przy użyciu wskaźnika DPI (punkty na cal) na podstawie wymiarów Naklejki zdefiniowanych przez Klienta.</li>
          <li>Załadowanie grafiki o niskiej rozdzielczości (poniżej 150 DPI) może skutkować nieostrym, rozpikselowanym lub rozmazanym drukiem. Sprzedawca nie ponosi odpowiedzialności za niższą jakość druku wynikającą z niskiej rozdzielczości plików dostarczonych przez Klienta.</li>
          <li>Zmniejszenie rozmiaru Naklejki z drobnymi napisami lub detalami może sprawić, że tekst stanie się nieczytelny w druku fizycznym. Klient jest świadomy tego ryzyka przy dokonywaniu skali w Kreatorze.</li>
          <li>Kolory widoczne na monitorze Klienta mogą nieznacznie odbiegać od gotowego wydruku z uwagi na różnice w kalibracji ekranów oraz specyfikę druku w przestrzeni CMYK w porównaniu do przestrzeni RGB.</li>
        </ol>

        <h2>§ 5. Zamówienia i płatności</h2>
        <ol>
          <li>Zamówienie uważa się za złożone w momencie kliknięcia przycisku „Kupuję i płacę” oraz dokonania pełnej płatności.</li>
          <li>Metodą płatności w Sklepie są płatności elektroniczne obsługiwane za pośrednictwem operatora <strong>Stripe</strong>.</li>
          <li>Cena podstawowa jednego arkusza A4 z naklejkami wynosi <strong>49,00 zł brutto</strong>.</li>
          <li>Wystawienie faktury VAT następuje po zaznaczeniu odpowiedniej opcji w koszyku i podaniu prawidłowych danych firmy (w tym numeru NIP).</li>
        </ol>

        <h2>§ 6. Dostawa i realizacja</h2>
        <ol>
          <li>Dostawa zamówień odbywa się na terenie Rzeczypospolitej Polskiej.</li>
          <li>Klient ma do wyboru następujące formy i koszty dostawy:
            <ul>
              <li>Paczkomat InPost</li>
              <li>Kurier pod drzwi</li>
            </ul>
          </li>
          <li>Czas realizacji i wysyłki zamówienia wynosi maksymalnie <strong>3 dni robocze</strong> od momentu zaksięgowania wpłaty.</li>
        </ol>

        <h2>§ 7. Brak prawa odstąpienia od umowy (Brak zwrotów)</h2>
        <ol>
          <li>
            Zgodnie z art. 38 pkt 3 Ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość (zwrot towaru w ciągu 14 dni) <strong>nie przysługuje konsumentowi</strong> w odniesieniu do umów, w których przedmiotem świadczenia jest rzecz nieprefabrykowana, wyprodukowana według specyfikacji konsumenta lub służąca zaspokojeniu jego zindywidualizowanych potrzeb.
          </li>
          <li>
            Ponieważ wszystkie Naklejki oferowane w Sklepie są wykonywane na indywidualne zamówienie Klienta według przesłanych grafik i określonych wymiarów, <strong>zwroty bez podania przyczyny nie są przyjmowane</strong>. Prosimy o przemyślane zakupy oraz uważne sprawdzanie kadru i wymiarów w Kreatorze przed opłaceniem koszyka.
          </li>
        </ol>

        <h2>§ 8. Reklamacje i gwarancja</h2>
        <ol>
          <li>
            Mimo braku prawa zwrotu towaru bez podania przyczyny, Klient zachowuje pełne prawo do zgłoszenia reklamacji w przypadku otrzymania produktu wadliwego pod względem technicznym (np. uszkodzenia mechaniczne powstałe w transporcie, błędy w cięciu z winy maszyn produkcyjnych, plamy drukarskie).
          </li>
          <li>
            Reklamację należy zgłosić drogą mailową na adres podany w § 1 ust. 1, załączając opis wady oraz zdjęcia przedstawiające wadliwy produkt.
          </li>
          <li>
            Sprzedawca ustosunkuje się do reklamacji w terminie <strong>14 dni</strong> od jej otrzymania. W przypadku uznania reklamacji, Sprzedawca na swój koszt wyprodukuje i wyśle poprawny produkt lub zwróci środki Klientowi.
          </li>
        </ol>

        <h2>§ 9. Dane osobowe i pliki cookies</h2>
        <ol>
          <li>Administratorem danych osobowych Klientów jest Sprzedawca.</li>
          <li>Dane osobowe Klienta przetwarzane są wyłącznie w celu realizacji zamówienia, rozliczeń finansowo-księgowych oraz ewentualnego dochodzenia roszczeń, zgodnie z Ogólnym Rozporządzeniem o Ochronie Danych (RODO). Szczegółowe zasady przetwarzania danych określa Polityka Prywatności.</li>
        </ol>

        <h2>§ 10. Postanowienia końcowe</h2>
        <ol>
          <li>Sprzedawca zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn technicznych, prawnych lub organizacyjnych. Do zamówień złożonych przed dniem wejścia w życie zmian stosuje się Regulamin w brzmieniu dotychczasowym.</li>
          <li>W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy Kodeksu Cywilnego, Ustawy o prawach konsumenta oraz inne właściwe przepisy prawa polskiego.</li>
        </ol>
      </main>

      <Footer />
    </div>
  );
}
