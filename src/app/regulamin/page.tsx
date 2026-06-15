import { DocLayout, DocSection } from "@/components/layout/DocLayout";
import { Building2, Mail, Phone, ShieldCheck, MapPin } from "lucide-react";

export const metadata = {
  title: "Regulamin - MałeNaklejki",
};

export default function RegulaminPage() {
  const sections: DocSection[] = [
    {
      id: "postanowienia-ogolne",
      title: "§ 1. Postanowienia ogólne",
      searchText: `Sklep internetowy działający pod adresem MałeNaklejki prowadzony jest przez: Firma Jakub Dalaszyński ul. Geodetów 41, 64-100 Trzebiny NIP 6972414844 REGON 544772342 Adres e-mail kontakt@malenaklejki.pl Telefon 695527166 zwany dalej Sprzedawcą. Regulamin określa zasady korzystania ze Sklepu, składania zamówień na produkty personalizowane naklejki na arkuszach A4, sposoby płatności, dostawy, procedury reklamacyjne. Wszystkie ceny w Sklepie są cenami brutto VAT w złotych polskich PLN bez kosztów dostawy.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Sklep internetowy działający pod adresem <strong>MałeNaklejki</strong> prowadzony jest przez:
          </p>
          <div className="bg-muted/40 border border-border/80 p-5 rounded-2xl my-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold not-prose shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Building2 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Firma</p>
                <p className="text-foreground font-black text-sm">Jakub Dalaszyński</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <MapPin className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Adres siedziby</p>
                <p className="text-foreground font-black text-sm">ul. Geodetów 41, 64-100 Trzebiny</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">NIP / REGON</p>
                <p className="text-foreground font-black text-sm">NIP: 6972414844 / REGON: 544772342</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Mail className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Adres e-mail</p>
                <a href="mailto:kontakt@malenaklejki.pl" className="text-primary hover:underline font-black text-sm">
                  kontakt@malenaklejki.pl
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Phone className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Telefon kontaktowy</p>
                <a href="tel:+48695527166" className="text-primary hover:underline font-black text-sm">
                  +48 695 527 166
                </a>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-bold italic mt-2">
            Zwanym dalej <strong>„Sprzedawcą”</strong>.
          </p>
          <p>
            2. Niniejszy Regulamin określa zasady korzystania ze Sklepu, składania zamówień na produkty personalizowane (naklejki na arkuszach A4), sposoby płatności, dostawy, a także procedury reklamacyjne.
          </p>
          <p>
            3. Wszystkie ceny podane w Sklepie są cenami brutto (zawierają podatek VAT) i są wyrażone w złotych polskich (PLN). Ceny nie zawierają kosztów dostawy.
          </p>
        </div>
      ),
    },
    {
      id: "definicje",
      title: "§ 2. Definicje",
      searchText: `Klient osoba fizyczna prawna jednostka organizacyjna składająca zamówienie. Konsument osoba fizyczna dokonująca czynności prawnej niezwiązanej z działalnością gospodarczą. Produkt Naklejka nieprefabrykowany towar personalizowany arkusz A4 z naklejkami o określonej szerokości wysokości kącie obrotu linii cięcia. Kreator narzędzie internetowe wgranie własnej grafiki edycja usuwanie tła sztuczna inteligencja kadrowanie wybór konturu cięcia. Generator AI funkcja sklepu generowanie grafik na podstawie opisów tekstowych promptów.`,
      content: (
        <ul className="space-y-4">
          <li>
            <strong>Klient</strong> – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, składająca zamówienie w Sklepie.
          </li>
          <li>
            <strong>Konsument</strong> – osoba fizyczna dokonująca ze Sprzedawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.
          </li>
          <li>
            <strong>Produkt / Naklejka</strong> – nieprefabrykowany towar personalizowany (arkusz A4 z naklejkami o określonej przez Klienta szerokości, wysokości, kącie obrotu oraz linii cięcia) wyprodukowany według specyfikacji Klienta.
          </li>
          <li>
            <strong>Kreator</strong> – narzędzie internetowe dostępne w Sklepie umożliwiające Klientowi wgranie własnej grafiki, edycję (usuwanie tła za pomocą sztucznej inteligencji, kadrowanie), wybór konturu cięcia oraz pozycjonowanie na arkuszu.
          </li>
          <li>
            <strong>Generator AI</strong> – opcjonalna funkcja Sklepu umożliwiająca generowanie grafik na podstawie opisów tekstowych (promptów) przy użyciu sztucznej inteligencji, z możliwością ich późniejszego umieszczenia na arkuszu jako Naklejki.
          </li>
        </ul>
      ),
    },
    {
      id: "prawa-autorskie",
      title: "§ 3. Zasady korzystania z Kreatora i prawa autorskie",
      searchText: `prawa autorskie licencje zgody na wykorzystanie pliku naklejek. zabrania się wgrywania treści o charakterze bezprawnym nawołujących do nienawiści wulgarnych naruszających dobra osobiste zastrzeżone znaki towarowe. odmowa realizacji zamówienia. odpowiedzialność za roszczenia osób trzecich. generator AI grafiki generowane automatycznie.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Klient przesyłający grafikę/zdjęcie do Kreatora oświadcza, że posiada wszelkie prawa autorskie, licencje lub zgody na wykorzystanie tego pliku w celu produkcji Naklejek.
          </p>
          <p>
            2. Zabrania się wgrywania treści o charakterze bezprawnym, nawołujących do nienawiści, wulgarnych, naruszających dobra osobiste osób trzecich lub zastrzeżone znaki towarowe bez posiadania odpowiedniej licencji. Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku podejrzenia naruszenia prawa.
          </p>
          <p>
            3. Klient ponosi wyłączną odpowiedzialność za wszelkie roszczenia osób trzecich wynikające z naruszenia ich praw (w tym praw autorskich) w związku z grafikami przesłanymi do realizacji.
          </p>
          <p>
            4. W przypadku korzystania z Generatora AI, Klient przyjmuje do wiadomości, że uzyskane grafiki generowane są automatycznie. Klient ponosi odpowiedzialność za zgodność wygenerowanych obrazów z prawem oraz regulaminem.
          </p>
        </div>
      ),
    },
    {
      id: "wymagania-techniczne",
      title: "§ 4. Wymagania techniczne i jakość wydruku",
      searchText: `jakość wgranej grafiki wskaźnik DPI punkty na cal. niska rozdzielczość poniżej 150 DPI nieostry rozpikselowany rozmazany druk. drobne napisy detale nieczytelny tekst skala w Kreatorze. kolory różnice w kalibracji ekranów CMYK RGB.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Sklep informuje Klienta w czasie rzeczywistym o jakości wgranej grafiki przy użyciu wskaźnika DPI (punkty na cal) na podstawie wymiarów Naklejki zdefiniowanych przez Klienta.
          </p>
          <p>
            2. Załadowanie grafiki o niskiej rozdzielczości (poniżej 150 DPI) może skutkować nieostrym, rozpikselowanym lub rozmazanym drukiem. Sprzedawca nie ponosi odpowiedzialności za niższą jakość druku wynikającą z niskiej rozdzielczości plików dostarczonych przez Klienta.
          </p>
          <p>
            3. Zmniejszenie rozmiaru Naklejki z drobnymi napisami lub detalami może sprawić, że tekst stanie się nieczytelny w druku fizycznym. Klient jest świadomy tego ryzyka przy dokonywaniu skali w Kreatorze.
          </p>
          <p>
            4. Kolory widoczne na monitorze Klienta mogą nieznacznie odbiegać od gotowego wydruku z uwagi na różnice w kalibracji ekranów oraz specyfikę druku w przestrzeni CMYK w porównaniu do przestrzeni RGB.
          </p>
        </div>
      ),
    },
    {
      id: "zamowienia-platnosci",
      title: "§ 5. Zamówienia i płatności",
      searchText: `zamówienie złożone kupuję i płacę pełna płatność. Przelewy24 płatności elektroniczne operator. cena podstawowa arkusza A4 z naklejkami 49,00 zł brutto. faktura VAT NIP dane firmy koszyk.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Zamówienie uważa się za złożone w momencie kliknięcia przycisku „Kupuję i płacę” oraz dokonania pełnej płatności.
          </p>
          <p>
            2. Metodą płatności w Sklepie są płatności elektroniczne obsługiwane za pośrednictwem operatora <strong>Przelewy24</strong>.
          </p>

          <p>
            3. Wystawienie faktury VAT następuje po zaznaczeniu odpowiedniej opcji w koszyku i podaniu prawidłowych danych firmy (w tym numeru NIP).
          </p>
        </div>
      ),
    },
    {
      id: "dostawa-realizacja",
      title: "§ 6. Dostawa i realizacja",
      searchText: `dostawa na terenie Rzeczypospolitej Polskiej. paczkomat InPost kurier pod drzwi koszty. czas realizacji wysyłki maksymalnie 3 dni robocze od zaksięgowania wpłaty.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Dostawa zamówień odbywa się na terenie Rzeczypospolitej Polskiej.
          </p>
          <p>
            2. Klient ma do wyboru następujące formy i koszty dostawy:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-semibold text-primary">
            <li>
              <span className="text-foreground font-medium">Paczkomat InPost</span>
            </li>
            <li>
              <span className="text-foreground font-medium">Kurier pod drzwi</span>
            </li>
          </ul>
          <p>
            3. Czas realizacji i wysyłki zamówienia wynosi maksymalnie <strong>3 dni robocze</strong> od momentu zaksięgowania wpłaty.
          </p>
        </div>
      ),
    },
    {
      id: "brak-zwrotow",
      title: "§ 7. Brak prawa odstąpienia od umowy (Brak zwrotów)",
      searchText: `brak prawa odstąpienia od umowy brak zwrotów ustawa o prawach konsumenta rzecz nieprefabrykowana wyprodukowana według specyfikacji zaspokojenie zindywidualizowanych potrzeb. indywidualne zamówienie grafika wymiary zwroty bez podania przyczyny nie są przyjmowane.`,
      content: (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 p-5 rounded-2xl my-4 text-sm font-semibold">
            <p className="text-destructive font-black uppercase tracking-wider mb-2">Ważna Informacja</p>
            <p className="text-foreground leading-relaxed">
              Zgodnie z art. 38 pkt 3 Ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość (zwrot towaru w ciągu 14 dni) <strong>nie przysługuje konsumentowi</strong> w odniesieniu do umów, w których przedmiotem świadczenia jest rzecz nieprefabrykowana, wyprodukowana według specyfikacji konsumenta lub służąca zaspokojeniu jego zindywidualizowanych potrzeb.
            </p>
          </div>
          <p>
            Ponieważ wszystkie Naklejki oferowane w Sklepie są wykonywane na indywidualne zamówienie Klienta według przesłanych grafik i określonych wymiarów, <strong>zwroty bez podania przyczyny nie są przyjmowane</strong>. Prosimy o przemyślane zakupy oraz uważne sprawdzanie kadru i wymiarów w Kreatorze przed opłaceniem koszyka.
          </p>
        </div>
      ),
    },
    {
      id: "reklamacje",
      title: "§ 8. Reklamacje i gwarancja",
      searchText: `reklamacja gwarancja produkt wadliwy pod względem technicznym uszkodzenia mechaniczne w transporcie błędy w cięciu plamy drukarskie. zgłoszenie drogą mailową zdjęcia wadliwy produkt. termin 14 dni wyprodukuje i wyśle poprawny produkt zwrot środków.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Mimo braku prawa zwrotu towaru bez podania przyczyny, Klient zachowuje pełne prawo do zgłoszenia reklamacji w przypadku otrzymania produktu wadliwego pod względem technicznym (np. uszkodzenia mechaniczne powstałe w transporcie, błędy w cięciu z winy maszyn produkcyjnych, plamy drukarskie).
          </p>
          <p>
            2. Reklamację należy zgłosić drogą mailową na adres podany w § 1 ust. 1, załączając opis wady oraz zdjęcia przedstawiające wadliwy produkt.
          </p>
          <p>
            3. Sprzedawca ustosunkuje się do reklamacji w terminie <strong>14 dni</strong> od jej otrzymania. W przypadku uznania reklamacji, Sprzedawca na swój koszt wyprodukuje i wyśle poprawny produkt lub zwróci środki Klientowi.
          </p>
        </div>
      ),
    },
    {
      id: "dane-osobowe",
      title: "§ 9. Dane osobowe i pliki cookies",
      searchText: `dane osobowe pliki cookies administrator danych sprzedawca. realizacja zamówienia rozliczenia finansowo-księgowe dochodzenie roszczeń RODO Polityka Prywatności.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Administratorem danych osobowych Klientów jest Sprzedawca.
          </p>
          <p>
            2. Dane osobowe Klienta przetwarzane są wyłącznie w celu realizacji zamówienia, rozliczeń finansowo-księgowych oraz ewentualnego dochodzenia roszczeń, zgodnie z Ogólnym Rozporządzeniem o Ochronie Danych (RODO). Szczegółowe zasady przetwarzania danych określa Polityka Prywatności.
          </p>
        </div>
      ),
    },
    {
      id: "postanowienia-koncowe",
      title: "§ 10. Postanowienia końcowe",
      searchText: `zmiana regulaminu ważne przyczyny techniczne prawne organizacyjne. kodeks cywilny ustawa o prawach konsumenta przepisy prawa polskiego.`,
      content: (
        <div className="space-y-4">
          <p>
            1. Sprzedawca zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn technicznych, prawnych lub organizacyjnych. Do zamówień złożonych przed dniem wejścia w życie zmian stosuje się Regulamin w brzmieniu dotychczasowym.
          </p>
          <p>
            2. W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy Kodeksu Cywilnego, Ustawy o prawach konsumenta oraz inne właściwe przepisy prawa polskiego.
          </p>
        </div>
      ),
    },
  ];

  return (
    <DocLayout
      title="Regulamin Sklepu Internetowego MałeNaklejki"
      description="Regulamin określający warunki korzystania ze sklepu internetowego oraz zasady składania zamówień na spersonalizowane naklejki na arkuszach A4."
      lastUpdated="14 czerwca 2026 r."
      activeTab="regulamin"
      sections={sections}
    />
  );
}
