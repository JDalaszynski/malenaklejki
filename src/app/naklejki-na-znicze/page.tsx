import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Flame,
  Camera,
  Type,
  Shapes,
  Users,
  Building2,
  Droplets,
  Printer,
  Layers,
  Hand,
  Receipt,
  Truck,
  ShieldCheck,
  Clock,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/naklejki-na-znicze";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;
const OG_IMAGE = "/images/og-main.jpg";

const TITLE = "Naklejki na znicze ze zdjęciem - na zamówienie od 49 zł";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Naklejki na znicze ze zdjęciem, imieniem i dedykacją na wodoodpornej folii. Stała cena 49,00 zł brutto za arkusz A4, od 1 sztuki, produkcja 2-3 dni robocze.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: TITLE,
    description:
      "Naklejka ze zdjęciem bliskiej osoby, imieniem lub dedykacją na własny znicz. Folia winylowa odporna na wodę i UV, 49,00 zł brutto za arkusz A4, bez minimalnego nakładu.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Kreator naklejek MałeNaklejki - arkusz A4 z naklejkami do zamówienia.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Naklejki na znicze ze zdjęciem i dedykacją na wodoodpornej folii winylowej. Stała cena 49,00 zł brutto za arkusz A4, produkcja 2-3 dni robocze.",
    images: [OG_IMAGE],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Ile kosztuje naklejka na znicz?",
    a: "Arkusz A4 z naklejkami kosztuje stałe 49,00 zł brutto, niezależnie od liczby wzorów, a koszt jednej naklejki zależy od jej rozmiaru. Naklejka ze zdjęciem 5 x 7 cm to orientacyjnie ok. 4 zł, a mała naklejka 4 x 4 cm z imieniem i datami - od 1,63 do 2,04 zł. Do tego dochodzi dostawa do paczkomatu za 19,99 zł, liczona raz za całe zamówienie.",
  },
  {
    q: "Jak zrobić znicz ze zdjęciem samodzielnie?",
    a: "Kup dowolny znicz o gładkiej, zewnętrznej ściance - szklany, plastikowy, solarny albo LED - i dodaj do niego własną naklejkę ze zdjęciem. Drukujemy same naklejki, nie sprzedajemy zniczy. Zdjęcie wgrywasz do kreatora, wybierasz owal lub prostokąt, a gotową naklejkę przyklejasz na suchy, odtłuszczony znicz w temperaturze pokojowej.",
  },
  {
    q: "Czy naklejka na znicz wytrzyma deszcz i słońce na cmentarzu?",
    a: "Tak, jeśli chodzi o wodę i słońce. Drukujemy na folii winylowej odpornej na wodę i promieniowanie UV, więc wilgoć i światło dzienne nie są dla niej problemem. Nie podajemy natomiast liczby lat użytkowania na zewnątrz ani odporności na mróz.",
  },
  {
    q: "Czy naklejka na znicz nie stopi się od płomienia?",
    a: "Odporności naszej folii na ciepło płomienia nie potwierdzamy, więc nie obiecujemy, że naklejka zniesie pracę przy zniczu z otwartym ogniem. Naklejaj ją na zewnętrznej ściance szkła, jak najdalej od knota, nigdy na wkładzie z woskiem ani na metalowych częściach, i sprawdź jedną sztukę pod nadzorem, zanim zamówisz więcej. Najbezpieczniejszy wybór to znicz solarny, LED lub na baterie.",
  },
  {
    q: "Na jakich zniczach można nakleić naklejkę?",
    a: "Najlepiej na zniczach o gładkiej, zewnętrznej powierzchni ze szkła lub plastiku - szklanych, solarnych, LED i na baterie. Klej słabo trzyma na szkle ryflowanym, ażurowym i na reliefach, bo naklejka nie położy się płasko. Nie naklejaj jej na wkład z woskiem ani na części, które mocno się nagrzewają.",
  },
  {
    q: "Jaki rozmiar naklejki wybrać na znicz?",
    a: "Zmierz linijką gładkie pole na swoim zniczu i wybierz naklejkę odrobinę mniejszą, żeby brzegi nie wchodziły na krawędzie, rowki ani nadruki producenta. Przykładowo portret 5 x 7 cm albo kwadrat 6 x 6 cm zmieści się na wielu średnich zniczach szklanych, a na duże lampiony wybierz 8 x 8 lub 10 x 10 cm. Zawsze jednak zmierz własny znicz.",
  },
  {
    q: "Jakie zdjęcie nadaje się na naklejkę na znicz?",
    a: "Wyraźne zdjęcie twarzy, najlepiej zrobione w świetle dziennym, bez flesza i odblasków. Plik zapisz jako JPG, PNG, WEBP lub PDF, zalecamy 300 DPI. Starą odbitkę zeskanuj albo sfotografuj telefonem prosto z góry. Drukujemy zdjęcie takie, jakie wgrasz, więc jasność i rysy starej fotografii popraw przed wgraniem, a kadr poprawisz w kreatorze.",
  },
  {
    q: "Co napisać na naklejce na znicz?",
    a: "Najczęściej imię i nazwisko z latami życia albo krótką dedykację, na przykład „Kochanej Mamie”, „Kochanemu Tacie” lub „Pamiętamy”. Krótki napis jest czytelny z kilku kroków nawet na małej naklejce. Napis złóż w Canvie, Wordzie lub PowerPoincie i wgraj jako obraz - kreator układa arkusz, nie ma edytora tekstu.",
  },
  {
    q: "Czy mogę zamówić kilka różnych naklejek na znicze w jednym zamówieniu?",
    a: "Tak. Na jednym arkuszu A4 umieścisz kilka różnych zdjęć i napisów, każde wycinamy osobno, a płacisz za arkusz, nie za liczbę wzorów. Kilka arkuszy trafia do jednej paczki, a dostawa za 19,99 zł jest liczona raz. Firmom i organizacjom wystawiamy fakturę VAT na NIP, ale nie stosujemy rabatów ilościowych.",
  },
  {
    q: "Czy zdążę z zamówieniem przed 1 listopada i ile kosztuje dostawa?",
    a: "Produkcja trwa 2-3 dni robocze od opłacenia zamówienia, a naklejki wysyłamy do paczkomatu za 19,99 zł. Całkowitego czasu dostawy nie deklarujemy, bo zależy od przewoźnika, dlatego przed Wszystkimi Świętymi zamów z zapasem i nie zostawiaj tego na ostatnie dni. Zapłacisz BLIK-iem lub przez Przelewy24.",
  },
];

const USE_CASES: {
  icon: React.ElementType;
  title: string;
  text: string;
  href?: string;
  linkLabel?: string;
}[] = [
  {
    icon: Camera,
    title: "Zdjęcie bliskiej osoby",
    text: "Portret w owalu lub kole: wyraźne zdjęcie twarzy, najlepiej zrobione w świetle dziennym. Starą fotografię możesz zeskanować albo sfotografować telefonem.",
    href: "/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz",
    linkLabel: "Znicz ze zdjęciem krok po kroku",
  },
  {
    icon: Type,
    title: "Imię, nazwisko i daty",
    text: "Krótka naklejka z imieniem i latami życia jest czytelna z kilku kroków i mieści się nawet na małym zniczu. Możesz też użyć odręcznego podpisu bliskiej osoby, zeskanowanego z kartki lub listu.",
  },
  {
    icon: Flame,
    title: "Dedykacja i krótkie hasło",
    text: "„Kochanej Mamie”, „Kochanemu Tacie”, „Pamiętamy”. Sformułowania dla każdego adresata zebraliśmy w osobnym poradniku.",
    href: "/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich",
    linkLabel: "Co napisać na zniczu",
  },
  {
    icon: Shapes,
    title: "Symbole i własne motywy",
    text: "Krzyż, gołąb, róża albo rysunek wykonany przez dziecko. Każdy gotowy obraz w formacie JPG, PNG, WEBP lub PDF wgrasz do kreatora i wytniesz po obrysie.",
  },
  {
    icon: Users,
    title: "Cała rodzina, kilka grobów",
    text: "Jeden arkusz A4 pomieści zdjęcia mamy, taty i dziadków oraz dedykacje obok siebie. Każdy wzór wycinamy osobno, a płacisz za arkusz, nie za liczbę wzorów.",
  },
  {
    icon: Building2,
    title: "Szkoły, parafie, firmy i organizacje",
    text: "Logo i hasło „Pamiętamy” na zniczach zapalanych w akcji szkolnej, harcerskiej, samorządowej czy firmowej. Faktura VAT na NIP, rachunek arkuszy poniżej.",
    href: "/naklejki-dla-firm",
    linkLabel: "Naklejki dla firm",
  },
];

const ZNICZE_TYPES: { type: string; fit: string; note: string }[] = [
  {
    type: "Znicz solarny, LED, na baterie",
    fit: "Tak, najbezpieczniejszy wybór",
    note: "Brak otwartego płomienia, więc nie ma ryzyka nagrzewania folii od knota. Gładka, sucha ścianka ze szkła lub plastiku.",
  },
  {
    type: "Znicz szklany o gładkiej ściance",
    fit: "Tak, z zachowaniem odstępu od płomienia",
    note: "Naklejaj na zewnętrznej stronie, jak najdalej od knota. Przy walcu naklejka układa się najlepiej, gdy nie jest zbyt szeroka - zmierz szerokość gładkiego pola.",
  },
  {
    type: "Znicz plastikowy",
    fit: "Tak, po sprawdzeniu powierzchni",
    note: "Klej najlepiej trzyma na gładkiej, nietłustej powierzchni. Jeśli tworzywo jest chropowate lub woskowane, przetestuj jedną naklejkę.",
  },
  {
    type: "Szkło ryflowane, ażurowe, ze wzorem w reliefie",
    fit: "Nie polecamy",
    note: "Naklejka nie położy się płasko na nierównej powierzchni, a brzegi będą się unosić.",
  },
  {
    type: "Wkład z woskiem lub parafiną, metalowa pokrywka",
    fit: "Nie",
    note: "To elementy nagrzewane bezpośrednio przez płomień. Nie naklejaj na nie niczego i nie zasłaniaj otworów wentylacyjnych.",
  },
];

const SIZES: { size: string; count: string; cost: string; fits: string }[] = [
  {
    size: "3 x 3 cm",
    count: "ok. 40 - 50 szt.",
    cost: "~0,98 - 1,23 zł",
    fits: "Mały symbol, krzyżyk, krótkie hasło „Pamiętamy”",
  },
  {
    size: "4 x 4 cm",
    count: "ok. 24 - 30 szt.",
    cost: "~1,63 - 2,04 zł",
    fits: "Imię i daty na małym zniczu",
  },
  {
    size: "5 x 7 cm (portret)",
    count: "ok. 12 szt.",
    cost: "~4,08 zł",
    fits: "Zdjęcie portretowe na średnim zniczu szklanym",
  },
  {
    size: "6 x 6 cm",
    count: "ok. 10 - 12 szt.",
    cost: "~4,08 - 4,90 zł",
    fits: "Zdjęcie lub dedykacja na zniczu szklanym",
  },
  {
    size: "8 x 8 cm",
    count: "ok. 6 szt.",
    cost: "~8,17 zł",
    fits: "Duży znicz, lampion cmentarny",
  },
  {
    size: "10 x 10 cm",
    count: "ok. 4 szt.",
    cost: "~12,25 zł",
    fits: "Duży lampion, znicz wysoki",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Droplets,
    title: "Folia odporna na wodę i UV",
    text: "Deszcz i słońce na cmentarzu nie są dla naklejki problemem, bo drukujemy ją na trwałej folii winylowej, a nie na papierze.",
  },
  {
    icon: Printer,
    title: "Ostre zdjęcie w druku 300 DPI",
    text: "Rozdzielczość 300 DPI oddaje rysy twarzy i drobne napisy wyraźnie, także wtedy, gdy naklejka ma tylko kilka centymetrów.",
  },
  {
    icon: Shapes,
    title: "Owal, koło, prostokąt lub kontur",
    text: "Portret w pionie dostaje owalną ramkę, rysunek czy symbol - cięcie dokładnie po obrysie. Kształt dobierasz w kreatorze, cena zostaje ta sama.",
  },
  {
    icon: Layers,
    title: "Kilka wzorów na jednym arkuszu",
    text: "Zdjęcia różnych osób, dedykacje i symbole ułożysz na jednym A4. Nie zamawiasz osobnego nakładu na każdy grób.",
  },
  {
    icon: Hand,
    title: "Mocny klej, zero śladów",
    text: "Naklejka trzyma się pewnie, a po zdjęciu nie zostawia resztek kleju na szkle. Nie nadaje się do ponownego naklejenia.",
  },
  {
    icon: Receipt,
    title: "Polska produkcja i faktura VAT",
    text: "Drukujemy w Polsce, rozliczamy w złotówkach i wystawiamy fakturę VAT na NIP - bez przeliczania z euro i ceł.",
  },
];

const SPECS: { label: string; value: string }[] = [
  {
    label: "Zastosowanie",
    value: "Znicze szklane, plastikowe, solarne i LED, lampiony cmentarne",
  },
  {
    label: "Co możesz nakleić",
    value: "Zdjęcie, imię i daty, dedykację, symbol lub własny motyw",
  },
  {
    label: "Kształt naklejki",
    value:
      "Owal lub koło, prostokąt z zaokrąglonymi rogami albo cięcie po obrysie grafiki (die-cut)",
  },
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Powierzchnia", value: "Subtelny połysk" },
  { label: "Odporność", value: "Woda, promieniowanie UV" },
  {
    label: "Ciepło płomienia",
    value: "Odporności nie deklarujemy - naklejaj z dala od knota",
  },
  {
    label: "Odklejanie",
    value: "Bez śladów kleju; naklejki nie da się nakleić ponownie",
  },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  {
    label: "Rozmiar",
    value: "Od małych symboli do jednej naklejki do 19 cm",
  },
  {
    label: "Liczba naklejek",
    value:
      "Orientacyjnie ok. 12 portretów 5 x 7 cm albo 10 - 12 naklejek 6 x 6 cm na arkuszu A4",
  },
  {
    label: "Plik",
    value: "JPG, PNG, WEBP lub PDF; zalecane 300 DPI",
  },
  {
    label: "Cena",
    value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu",
  },
  { label: "Produkcja", value: "2-3 dni robocze" },
  {
    label: "Wysyłka i płatność",
    value: "Paczkomat 19,99 zł; BLIK, Przelewy24, przelew, faktura VAT",
  },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Przygotuj zdjęcie i napis",
    text: "Weź zdjęcie z telefonu, skan albo fotografię odbitki zrobioną w świetle dziennym, bez flesza i odblasków. Zapisz je jako JPG, PNG, WEBP lub PDF, najlepiej w 300 DPI. Imię i dedykację złóż w darmowej Canvie, Wordzie lub PowerPoincie i wyeksportuj do pliku, bo kreator nie ma edytora tekstu. Brakuje Ci ramki albo symbolu? Wygenerujesz je w zewnętrznym narzędziu AI, takim jak ChatGPT, Gemini czy Midjourney.",
  },
  {
    title: "Wgraj plik, wybierz kształt i rozmiar",
    text: "W kreatorze wgrywasz plik, kadrujesz portret i wybierasz owal lub koło, prostokąt albo cięcie po obrysie. Ustaw rozmiar tak, żeby naklejka zmieściła się na gładkim polu znicza. Kolejne zdjęcia i napisy wgrywasz na ten sam arkusz - każdy wzór zostanie wycięty osobno.",
  },
  {
    title: "Sprawdź podgląd i zamów z zapasem czasu",
    text: "Obejrzyj podgląd 3D i zapłać BLIK-iem lub przez Przelewy24. Naklejki wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za 19,99 zł. Przed Wszystkimi Świętymi zamawiaj z zapasem, bo do produkcji dochodzi jeszcze dostawa.",
  },
];

const inlineLink =
  "text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors";

export default function NaklejkiNaZniczePage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Strona główna",
              item: "https://www.malenaklejki.pl",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Naklejki na znicze",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki na znicze ze zdjęciem i dedykacją",
          description:
            "Personalizowane naklejki na znicze: zdjęcie, imię i daty albo dedykacja drukowane na trwałej folii winylowej odpornej na wodę i UV. Do naklejenia na zewnętrzną ściankę znicza szklanego, plastikowego, solarnego lub LED. Owal, koło, prostokąt lub cięcie po obrysie, druk 300 DPI, stała cena 49,00 zł brutto za arkusz A4 bez minimalnego nakładu, produkcja 2-3 dni robocze i odbiór w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Naklejki na znicze",
          material: "Folia winylowa",
          offers: {
            "@type": "Offer",
            validFrom: "2024-01-01T00:00:00Z",
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "PL",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnNotPermitted",
              description:
                "Zwrot produktów personalizowanych nie jest możliwy z uwagi na ich unikalny charakter.",
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                // Paczkomat 19,99 zł - jedyny zatwierdzony koszt dostawy (blog-agent/facts.md).
                value: "19.99",
                currency: "PLN",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "PL",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  // Produkcja 2-3 dni robocze (blog-agent/facts.md, decyzja z 2026-08-17).
                  minValue: 2,
                  maxValue: 3,
                  unitCode: "d",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 1,
                  maxValue: 2,
                  unitCode: "d",
                },
              },
            },
            price: "49.00",
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
            priceValidUntil: "2026-12-31",
            seller: { "@id": "https://www.malenaklejki.pl/#organization" },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Naklejki na znicze ze zdjęciem i dedykacją",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-10-05T00:00:00+02:00",
        }}
      />

      <Header />

      <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs sm:text-sm font-bold text-muted-foreground/80 mb-4"
        >
          <ol className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Kreator Zestawu Naklejek
              </Link>
            </li>
            <li
              className="flex items-center gap-1.5 sm:gap-2"
              aria-current="page"
            >
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-extrabold">
                Naklejki na znicze
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Flame className="w-4 h-4" />
            Naklejki na znicze
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Naklejki na znicze ze zdjęciem i dedykacją
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zamów <strong>naklejki na znicze</strong> ze zdjęciem bliskiej
            osoby, imieniem lub dedykacją, drukowane na trwałej{" "}
            <strong>folii winylowej odpornej na wodę i UV</strong>. Wgrywasz
            zdjęcie z telefonu albo skan starej fotografii, wybierasz kształt -
            owal, koło, prostokąt lub cięcie po obrysie - a my drukujemy i
            wycinamy naklejki w Polsce. Stała cena to{" "}
            <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 arkusza,
            produkcja trwa <strong>2-3 dni robocze</strong>, a przesyłkę
            odbierasz w paczkomacie. Naklejkę przyklejasz na szkło lub plastik
            własnego znicza. Jedno zastrzeżenie: nie potwierdzamy odporności
            folii na{" "}
            <strong>ciepło płomienia</strong>, dlatego naklejaj ją z dala od
            knota - najbezpieczniej na zniczu solarnym lub LED.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Zamów naklejki na znicze
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Poradnik: znicz ze zdjęciem
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 5
              października 2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "Woda i UV", label: "Folia winylowa" },
            { value: "2-3 dni", label: "Produkcja robocze" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-1 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 py-5 px-2 shadow-sm"
            >
              <span className="text-lg sm:text-2xl font-black text-primary">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Jak to działa */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki na znicze ze zdjęciem - jak to działa
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Naklejka na znicz to zdjęcie, imię albo dedykacja wydrukowane na
            folii z klejem, które przyklejasz na zewnętrzną ściankę znicza.
            Zwykły znicz z półki staje się dzięki niej osobisty, a Ty nie
            musisz szukać sprzedawcy, który zrobi znicz personalizowany od
            zera. Kupujesz dowolny znicz i dodajesz własną naklejkę. My
            drukujemy wyłącznie naklejki - zniczy ani wkładów nie sprzedajemy.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Zdjęcie wgrywasz do kreatora arkusza A4 jako plik JPG, PNG, WEBP
            lub PDF. Może to być fotografia z telefonu, skan starej odbitki
            albo zdjęcie odbitki zrobione w świetle dziennym. W kreatorze
            kadrujesz portret i wybierasz kształt cięcia. „Koło” dopasowuje się
            do proporcji zdjęcia, więc portret w pionie dostaje owalną ramkę
            znaną z fotografii na nagrobkach, „Prostokąt” daje zaokrąglone
            rogi, a „Kontur” wycina naklejkę dokładnie po obrysie postaci lub
            rysunku. Tło zostawiasz albo usuwasz jednym przyciskiem. Zasady
            przygotowania zdjęcia są te same co przy{" "}
            <Link href="/fotonaklejki" className={inlineLink}>
              fotonaklejkach
            </Link>
            .
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Napis i dedykację przygotuj poza kreatorem - w darmowej Canvie,
            Wordzie lub PowerPoincie - i wgraj razem ze zdjęciem albo jako
            osobny obraz. Kreator układa arkusz, nie ma edytora tekstu. Gotowe
            sformułowania znajdziesz w poradniku o tym,{" "}
            <Link
              href="/blog/co-napisac-na-zniczu-napisy-i-dedykacje-dla-bliskich"
              className={inlineLink}
            >
              co napisać na zniczu
            </Link>
            , a cały proces krok po kroku w artykule{" "}
            <Link
              href="/blog/znicz-ze-zdjeciem-jak-zrobic-samodzielnie-naklejka-na-znicz"
              className={inlineLink}
            >
              znicz ze zdjęciem - jak zrobić go samodzielnie
            </Link>
            .
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja naklejek na znicze
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Materiał, odporność i warunki zamówienia w jednym miejscu - zanim
            wgrasz zdjęcie i zamówisz naklejki.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <tbody>
                {SPECS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }
                  >
                    <th
                      scope="row"
                      className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top w-2/5"
                    >
                      {row.label}
                    </th>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Co nakleić */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Co nakleić na znicz - zdjęcie, imię, dedykacja i symbole
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Ten sam arkusz A4 obsłuży jeden grób i całą rodzinę. Oto sześć
            najczęstszych zastosowań personalizowanych naklejek na znicze.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <div
                  key={uc.title}
                  className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-foreground leading-snug">
                      {uc.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {uc.text}
                  </p>
                  {uc.href && (
                    <Link
                      href={uc.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {uc.linkLabel}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Na jakim zniczu */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki na znicze szklane, plastikowe, solarne i LED - na którym
            zadziałają
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            O tym, czy naklejka dobrze się trzyma, decyduje powierzchnia
            znicza. Klej potrzebuje gładkiej, suchej i czystej ścianki.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr className="bg-[#edf6f2]/60 dark:bg-[#002c2e]/40">
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Rodzaj znicza
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Czy nadaje się
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Wskazówka
                  </th>
                </tr>
              </thead>
              <tbody>
                {ZNICZE_TYPES.map((row, i) => (
                  <tr
                    key={row.type}
                    className={
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }
                  >
                    <th
                      scope="row"
                      className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top"
                    >
                      {row.type}
                    </th>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground font-bold align-top">
                      {row.fit}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Płomień i bezpieczeństwo */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Płomień i bezpieczeństwo - jak nakleić naklejkę na znicz
          </h2>
          <div className="bg-primary/5 dark:bg-white/[0.04] border border-primary/20 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <TriangleAlert className="w-5 h-5" />
              </span>
              <p className="text-sm sm:text-base text-foreground/90 font-semibold leading-relaxed">
                Folia, na której drukujemy, jest odporna na wodę i
                promieniowanie UV. <strong>Odporności na ciepło płomienia nie
                deklarujemy</strong>, bo nie jest potwierdzona. Dlatego prosimy
                o ostrożność i kilka prostych zasad.
              </p>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed list-disc pl-5">
              <li>
                <strong className="text-foreground">Wybierz znicz bez otwartego ognia.</strong>{" "}
                Znicz solarny, LED lub na baterie nie nagrzewa ścianki od
                knota, więc ryzyko znika.
              </li>
              <li>
                <strong className="text-foreground">Przy zniczu z płomieniem</strong>{" "}
                naklejaj na zewnętrznej stronie szkła, jak najdalej od knota.
                Nie naklejaj na wkład z woskiem ani na metalowe części i nie
                zasłaniaj otworów wentylacyjnych.
              </li>
              <li>
                <strong className="text-foreground">Sprawdź jedną naklejkę.</strong>{" "}
                Zanim zamówisz większą liczbę, przyklej jedną na własnym
                zniczu, zapal go pod nadzorem na kilka godzin i obejrzyj
                brzegi. Jeśli się unoszą albo folia faluje, wybierz znicz
                solarny lub LED.
              </li>
              <li>
                <strong className="text-foreground">Naklejaj w domu, w cieple.</strong>{" "}
                Na czysty, suchy i odtłuszczony znicz, w temperaturze
                pokojowej - na zimnym szkle klej wiąże słabiej. Dociśnij
                całą naklejkę od środka ku brzegom.
              </li>
            </ul>
          </div>
        </section>

        {/* Rozmiar i koszt */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Rozmiar naklejki na znicz i koszt jednej sztuki
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Cena arkusza jest stała, więc koszt jednej naklejki zależy od tego,
            ile ich zmieścisz na A4. Wartości są orientacyjne - dokładna liczba
            zależy od kształtu i odstępów. Zmierz linijką gładkie pole na
            swoim zniczu i wybierz naklejkę odrobinę mniejszą. Pełne
            zestawienie rozmiarów znajdziesz w poradniku{" "}
            <Link href="/blog/jaki-rozmiar-naklejki-wybrac" className={inlineLink}>
              jaki rozmiar naklejki wybrać
            </Link>
            .
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr className="bg-[#edf6f2]/60 dark:bg-[#002c2e]/40">
                  {["Rozmiar", "Orientacyjnie szt. na A4", "Koszt 1 sztuki (brutto)", "Pasuje do"].map(
                    (head) => (
                      <th
                        key={head}
                        scope="col"
                        className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {SIZES.map((row, i) => (
                  <tr
                    key={row.size}
                    className={
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }
                  >
                    <th
                      scope="row"
                      className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top whitespace-nowrap"
                    >
                      {row.size}
                    </th>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.count}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top whitespace-nowrap">
                      {row.cost}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.fits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Przykład: rodzina z trzema grobami drukuje na jednym arkuszu po
            cztery naklejki ze zdjęciem 5 x 7 cm na każdy grób, czyli 12
            sztuk, za 49,00 zł brutto plus 19,99 zł dostawy do paczkomatu.
          </p>
        </section>

        {/* Firmy i organizacje */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki na znicze dla firm, szkół, parafii i organizacji
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Akcje pamięci - szkolne, harcerskie, samorządowe czy firmowe -
            wymagają kilkudziesięciu jednakowych zniczy z logo lub hasłem
            „Pamiętamy”. Wgrywasz logo i hasło raz, układasz je wielokrotnie
            na arkuszu, a my drukujemy je na tej samej folii za tę samą cenę.
            Wystawiamy fakturę VAT na NIP.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Nie stosujemy rabatów ilościowych, więc rachunek jest prosty:
            przy naklejkach 5 x 5 cm na 50 zniczy potrzebujesz orientacyjnie
            3-4 arkuszy (147,00-196,00 zł brutto), a na 100 zniczy 5-7
            arkuszy (245,00-343,00 zł brutto) - plus jedna dostawa za całe
            zamówienie. Pełną ofertę dla firm opisaliśmy na stronie{" "}
            <Link href="/naklejki-dla-firm" className={inlineLink}>
              naklejki dla firm
            </Link>
            . Zniczy ani wkładów nie sprzedajemy - kupujesz je u dowolnego
            dostawcy.
          </p>
        </section>

        {/* Zalety */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego warto zamówić naklejki na znicze personalizowane u nas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADVANTAGES.map((adv) => {
              const Icon = adv.icon;
              return (
                <div
                  key={adv.title}
                  className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-foreground leading-snug">
                      {adv.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {adv.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak zamówić naklejki na znicze krok po kroku
          </h2>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm"
              >
                <span className="shrink-0 w-9 h-9 rounded-full bg-[#02af7a] text-white flex items-center justify-center font-black">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Jeśli wolisz oddać przygotowanie grafiki w cudze ręce, sprawdź
            ofertę{" "}
            <Link href="/zamow-projekt" className={inlineLink}>
              zamów projekt
            </Link>
            . Drukujemy na tej samej{" "}
            <Link href="/naklejki-foliowe" className={inlineLink}>
              wodoodpornej folii winylowej
            </Link>
            , co wszystkie nasze naklejki, a linię cięcia wyznacza kreator,
            jak przy{" "}
            <Link href="/naklejki-die-cut" className={inlineLink}>
              naklejkach die-cut
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki na znicze - najczęstsze pytania
          </h2>
          <div className="flex flex-col gap-3.5">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-border/70 dark:border-white/10 bg-white dark:bg-[#003a3b] open:bg-muted/40 dark:open:bg-white/[0.04] shadow-sm open:shadow-md transition-all duration-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden rounded-2xl">
                  <h3 className="text-sm sm:text-[15px] font-black text-foreground leading-snug">
                    {faq.q}
                  </h3>
                  <span
                    aria-hidden
                    className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-open:rotate-45 text-xl font-black leading-none"
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 sm:px-6 pb-5 -mt-1 text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed max-w-[68ch]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-12 bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 shadow-sm text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Zamów naklejki na znicze ze zdjęciem już od 1 arkusza
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj zdjęcie do kreatora, wybierz kształt i rozmiar, a naklejki
            wyprodukujemy w 2-3 dni robocze na folii odpornej na wodę i UV - za
            stałe 49,00 zł brutto za arkusz A4, bez minimalnego nakładu. Przed
            Wszystkimi Świętymi zamawiaj z zapasem czasu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" /> Wodoodporna
              folia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shapes className="w-3.5 h-3.5 text-primary" /> Owal, koło lub
              kontur
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" /> Paczkomat 19,99 zł
            </span>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-lg font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Otwórz kreator naklejek
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <StickyCTAButton />
    </div>
  );
}
