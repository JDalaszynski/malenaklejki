import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  QrCode,
  Star,
  UtensilsCrossed,
  Share2,
  Wifi,
  Package,
  Contact,
  Layers,
  Copy,
  Boxes,
  ShieldCheck,
  ShieldAlert,
  Truck,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/naklejki-z-kodem-qr";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;
const OG_IMAGE = "/images/og-main.jpg";

const TITLE = "Naklejki z kodem QR na zamówienie - od 1 szt., 59 zł/A4";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Naklejki z kodem QR na folii winylowej: kilka różnych kodów na jednym arkuszu A4 za 59,00 zł brutto, od 1 szt., produkcja 2-3 dni robocze.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Naklejki z kodem QR na zamówienie - kilka kodów na jednym arkuszu",
    description:
      "Naklejki z kodem QR: opinie Google, Instagram, menu i Wi-Fi na jednym arkuszu A4. Stała cena 59,00 zł brutto, bez minimalnego nakładu, trwała folia winylowa.",
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
    title: "Naklejki z kodem QR na zamówienie - kilka kodów na jednym arkuszu",
    description:
      "Naklejki z kodem QR na folii winylowej: 59,00 zł brutto za arkusz A4, od 1 sztuki, produkcja 2-3 dni robocze.",
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
    q: "Ile kosztują naklejki z kodem QR?",
    a: "Jeden arkusz A4 kosztuje 59,00 zł brutto, a dostawa do paczkomatu 19,99 zł za całe zamówienie. Liczba kodów na arkuszu zależy od rozmiaru: orientacyjnie ok. 24-40 naklejek 3-5 cm albo ok. 12-20 naklejek 5-7 cm, czyli od ok. 1,48 zł do ok. 4,92 zł za sztukę. Nie ma minimalnego nakładu ani opłaty za przygotowanie pliku.",
  },
  {
    q: "Czy generujecie kod QR za mnie?",
    a: "Nie. Kreator drukuje obraz, który wgrasz, i nie tworzy kodów QR. Kod wygenerujesz w dowolnym darmowym generatorze, zapiszesz jako PNG (kreator nie przyjmuje plików SVG) i wgrasz do kreatora razem z innymi grafikami.",
  },
  {
    q: "Czy mogę zamówić kilka różnych kodów QR na jednym arkuszu?",
    a: "Tak. Na jednym arkuszu A4 za 59,00 zł brutto zmieścisz na przykład kod do opinii Google, profil na Instagramie, menu i hasło do Wi-Fi. Wgrywasz każdy kod osobno, a my wycinamy je oddzielnie. Płacisz za arkusz, nie za liczbę wzorów, a kilka arkuszy w jednym zamówieniu jedzie w jednej paczce z jedną dostawą.",
  },
  {
    q: "Jaki rozmiar naklejki z kodem QR wybrać?",
    a: "Kod powinien mieć co najmniej ok. 2 x 2 cm, a w praktyce najczęściej wybiera się 3-5 cm. Zasada kciuka: kod o szerokości 1 cm skanuje się z odległości do ok. 10 cm, więc kod na stoliku czytany z 30 cm powinien mieć ok. 3 cm. Im gęstszy kod (długi adres), tym większy musi być.",
  },
  {
    q: "Czy kod QR po wydruku da się zawsze zeskanować?",
    a: "Nie możemy tego zagwarantować, bo skanowanie zależy od samego kodu, pliku i miejsca naklejenia. Zwiększysz szanse, jeśli użyjesz ciemnego kodu na jasnym tle, zostawisz biały margines i wybierzesz rozmiar co najmniej 3 cm. Przed zamówieniem wydrukuj kod w docelowym rozmiarze na zwykłej drukarce i zeskanuj go dwoma telefonami.",
  },
  {
    q: "Kod QR statyczny czy dynamiczny na naklejkę?",
    a: "Na wydruk najbezpieczniejszy jest kod statyczny z adresem na Twojej domenie, który możesz przekierować na dowolną stronę. W wielu serwisach kody dynamiczne działają tylko w płatnym abonamencie lub okresie próbnym - gdy się skończy, naklejka przestaje prowadzić na stronę, a przedrukować trzeba wszystkie sztuki.",
  },
  {
    q: "Czy naklejka z kodem QR jest wodoodporna?",
    a: "Drukujemy na folii winylowej odpornej na wodę i promieniowanie UV, więc rozlany napój czy deszcz jej nie zniszczą. Naklejka nie nadaje się do zmywarki, a odporność deklarujemy tylko na wodę i UV, dlatego nie naklejaj kodu tam, gdzie jest intensywnie trzymany, szorowany albo czyszczony środkami chemicznymi.",
  },
  {
    q: "Czy mogę dodać logo, napis lub ramkę wokół kodu QR?",
    a: "Tak, ale kreator nie ma edytora tekstu, więc przygotuj całość jako jeden obraz w Canvie lub Wordzie i wgraj jako PNG albo PDF. Zostaw wokół kodu biały margines i dopisz pod nim adres tekstem. Logo w środku kodu zmniejsza jego czytelność, więc wymaga wyższego poziomu korekcji błędów i testu.",
  },
  {
    q: "Naklejka z kodem QR czy z chipem NFC?",
    a: "Drukujemy naklejki z kodem QR, który odczyta każdy telefon z aparatem. Naklejek z chipem NFC nie oferujemy. Chip wymaga osobnego zakupu i programowania, a telefon musi go obsługiwać, więc kod QR jest prostszym i tańszym wyborem do opinii, menu czy profilu w mediach społecznościowych.",
  },
  {
    q: "Czy mogę zamówić tylko jedną naklejkę z kodem QR?",
    a: "Tak, najmniejsze zamówienie to jeden arkusz A4 za 59,00 zł brutto. Płacisz wtedy za cały arkusz, ale zostaje Ci miejsce na kolejne kody lub kopie tego samego kodu - to opłaca się bardziej niż jedna sztuka. Przy kilku miejscach, w których kod ma wisieć lub leżeć, cena jednej naklejki spada do kilku złotych.",
  },
];

const PLUSES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Layers,
    title: "Różne kody na jednym arkuszu",
    text: "Opinie Google, Instagram, menu i Wi-Fi mieszczą się na jednym arkuszu A4. Wgrywasz każdy kod osobno, a każdy wytniemy oddzielnie. Płacisz za arkusz, nie za liczbę wzorów.",
  },
  {
    icon: Copy,
    title: "Wiele kopii jednego kodu",
    text: "Kod, który ma trafić na kilkanaście stolików albo paczek, powielisz na arkuszu przyciskiem „Wypełnij arkusz”, a resztę miejsca zajmą inne kody.",
  },
  {
    icon: Boxes,
    title: "Bez wielkiej partii na zapas",
    text: "Zamawiasz tyle, ile potrzebujesz. Gdy zmieni się adres strony albo menu, drukujesz nowy arkusz, zamiast zostać z setką nieaktualnych naklejek.",
  },
];

const SIZES: { size: string; count: string; cost: string; use: string }[] = [
  {
    size: "3-5 cm",
    count: "ok. 24-40 szt.",
    cost: "ok. 1,48-2,46 zł",
    use: "Wizytówka, koperta, opakowanie produktu",
  },
  {
    size: "4-6 cm",
    count: "ok. 15-24 szt.",
    cost: "ok. 2,46-3,93 zł",
    use: "Stolik, słoik, butelka",
  },
  {
    size: "5-7 cm",
    count: "ok. 12-20 szt.",
    cost: "ok. 2,95-4,92 zł",
    use: "Paczka, lada, kasa",
  },
  {
    size: "7-10 cm",
    count: "ok. 6-12 szt.",
    cost: "ok. 4,92-9,83 zł",
    use: "Stoisko targowe, większy kod czytany z dystansu",
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
    icon: Star,
    title: "Opinie Google przy kasie i na ladzie",
    text: "Naklejka „Oceń nas” z kodem do formularza opinii w Twoim profilu firmy. Klient skanuje kod zamiast szukać Cię w mapach. Pamiętaj o zasadach opisanych niżej: opinię można zbierać od każdego, ale nie wolno jej nagradzać.",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu i cennik na stoliku",
    text: "Kod do menu, cennika usług albo oferty na stoliku w kawiarni, na ladzie w salonie czy przy kasie. Gdy zmienisz ceny, zmieniasz stronę, a naklejki zostają.",
  },
  {
    icon: Share2,
    title: "Instagram, Facebook, TikTok",
    text: "Kod do profilu na opakowaniu, torbie, wizytówce albo w zestawie z zamówieniem. Klient obserwuje Cię jednym skanem, bez przepisywania nazwy konta.",
  },
  {
    icon: Wifi,
    title: "Wi-Fi dla gości",
    text: "Kod z danymi sieci pozwala gościowi połączyć się bez przepisywania hasła. W kodzie jest hasło, więc najlepiej wystawić osobną sieć dla gości i nie używać głównej.",
  },
  {
    icon: Package,
    title: "Paczki, zestawy i etykiety produktów",
    text: "Kod do instrukcji, strony produktu, przepisu albo formularza opinii na naklejce zamykającej paczkę lub na etykiecie słoika. Pomysły na oznaczenia opakowań znajdziesz w poradniku o naklejkach z logo na słoiki i opakowania.",
    href: "/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania",
    linkLabel: "Naklejki na opakowania",
  },
  {
    icon: Contact,
    title: "Wizytówka i stoisko targowe",
    text: "Kod do katalogu, formularza kontaktowego albo zapisu wizytówki w telefonie na stoisku, ulotce czy zestawie powitalnym. Więcej pomysłów na gadżety firmowe w poradniku o naklejkach na eventy.",
    href: "/blog/naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow",
    linkLabel: "Naklejki firmowe na eventy",
  },
];

const PARAMS: { label: string; value: string; why: string }[] = [
  {
    label: "Rodzaj kodu",
    value: "Statyczny, z adresem na Twojej domenie",
    why: "W wielu serwisach kody dynamiczne działają tylko w abonamencie lub okresie próbnym. Po jego końcu naklejka przestaje prowadzić na stronę. Jeśli chcesz zmieniać cel, przekieruj adres na własnej domenie.",
  },
  {
    label: "Długość adresu",
    value: "Jak najkrótszy, np. twojafirma.pl/opinie",
    why: "Krótszy adres daje rzadszy wzór z większymi kwadracikami, który łatwiej odczytać z małej naklejki.",
  },
  {
    label: "Kolory",
    value: "Ciemny kod na jasnym tle",
    why: "Odwrócone kolory (jasny kod na ciemnym tle) czyta nie każda aplikacja. Unikaj też kodów w pastelowych odcieniach o niskim kontraście.",
  },
  {
    label: "Biały margines",
    value: "Co najmniej szerokość 4 kwadracików kodu z każdej strony",
    why: "Margines odcina kod od otoczenia. Jego brak to jedna z najczęstszych przyczyn kodów, które się nie skanują.",
  },
  {
    label: "Rozmiar",
    value: "Co najmniej ok. 2 x 2 cm, zwykle 3-5 cm",
    why: "Zasada kciuka: 1 cm kodu na 10 cm odległości skanowania. Gęstszy kod (dłuższy adres) wymaga większej naklejki.",
  },
  {
    label: "Korekcja błędów",
    value: "Poziom średni lub wyższy (M lub Q)",
    why: "To zapas na zabrudzenia i drobne uszkodzenia. Wyższy poziom daje gęstszy wzór, więc kod musi być odpowiednio większy.",
  },
  {
    label: "Plik",
    value: "PNG, co najmniej ok. 1000 px szerokości, bez zrzutu ekranu",
    why: "Kreator nie przyjmuje SVG. Zapisz kod z generatora jako PNG w największym rozmiarze, żeby krawędzie kwadracików były ostre.",
  },
  {
    label: "Podpis pod kodem",
    value: "Adres lub nazwa profilu zwykłym tekstem",
    why: "Gdy ktoś nie może zeskanować kodu, przepisze adres. Dla klienta to też widoczna informacja, dokąd kod prowadzi.",
  },
  {
    label: "Test",
    value: "Wydruk próbny w docelowym rozmiarze, skan dwoma telefonami",
    why: "Wydruk na papierze nie pokaże kolorów folii, ale pokaże, czy kod jest czytelny przy tej wielkości.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Powierzchnia", value: "Subtelny połysk" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Odporność", value: "Woda, promieniowanie UV (nie do zmywarki)" },
  {
    label: "Cięcie",
    value: "Po obrysie, koło lub prostokąt - dla kodu QR zalecamy prostokąt",
  },
  {
    label: "Rozmiar",
    value: "Jedna duża naklejka do 19 cm lub kilkadziesiąt małych na arkuszu A4",
  },
  {
    label: "Wykończenie",
    value: "Na arkuszu A4 lub pojedyncze docięte sztuki",
  },
  { label: "Formaty pliku", value: "PNG, JPG, WEBP, PDF (bez SVG)" },
  {
    label: "Kod QR",
    value:
      "Przygotowujesz go sam w darmowym generatorze; kreator go nie tworzy, a skanowania po wydruku nie gwarantujemy - zalecamy test",
  },
  {
    label: "Cena",
    value: "59,00 zł brutto za arkusz A4, bez minimalnego nakładu",
  },
  { label: "Faktura", value: "VAT na dane z numerem NIP" },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka", value: "Odbiór w paczkomacie, dostawa 19,99 zł" },
  { label: "Płatność", value: "BLIK, Przelewy24" },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Wygeneruj i przetestuj kod",
    text: "Wpisz adres w darmowym generatorze kodów QR, wybierz kod statyczny i zapisz go jako PNG. Chcesz podpis lub logo wokół kodu? Złóż całość w Canvie albo Wordzie i wyeksportuj jako jeden obraz. Wydrukuj próbkę w docelowym rozmiarze i zeskanuj ją dwoma telefonami.",
  },
  {
    title: "Wgraj kody do kreatora i ustaw cięcie „Prostokąt”",
    text: "Wgraj każdy kod osobno, ustaw rozmiar i wybierz cięcie „Prostokąt”. Jeden kod powielisz przyciskiem „Wypełnij arkusz”, a kilka różnych ułożysz obok siebie. Podgląd 3D pokaże gotowy arkusz przed zamówieniem.",
  },
  {
    title: "Zamów i odbierz paczkę w paczkomacie",
    text: "Zapłać BLIK-iem lub przez Przelewy24, w razie potrzeby podaj dane do faktury VAT z numerem NIP. Naklejki wyprodukujemy w 2-3 dni robocze, a potem wyślemy je do paczkomatu.",
  },
];

const linkClass =
  "text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors";

export default function NaklejkiZKodemQrPage() {
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
              name: "Naklejki z kodem QR",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki z kodem QR na zamówienie",
          description:
            "Naklejki z kodem QR drukowane na trwałej folii winylowej z wgranego przez klienta obrazu. Stała cena 59,00 zł brutto za arkusz A4, bez minimalnego nakładu, z fakturą VAT i odbiorem w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Naklejki z kodem QR",
          offers: {
            "@type": "Offer",
            validFrom: "2026-10-27T00:00:00Z",
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
                  // Produkcja 2-3 dni robocze (blog-agent/facts.md). Czasu transportu
                  // celowo nie deklarujemy - całkowity czas dostawy jest poza faktami.
                  minValue: 2,
                  maxValue: 3,
                  unitCode: "d",
                },
              },
            },
            price: "59.00",
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
            priceValidUntil: "2027-12-31",
            seller: { "@id": "https://www.malenaklejki.pl/#organization" },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Naklejki z kodem QR na zamówienie",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-10-27T00:00:00+01:00",
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
                Naklejki z kodem QR
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <QrCode className="w-4 h-4" />
            Kody QR - od 1 arkusza A4
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Naklejki z kodem QR na zamówienie
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Wgraj kod QR jako plik PNG, a wydrukujemy go na{" "}
            <strong>folii winylowej odpornej na wodę i UV</strong> i wytniemy w
            prostokąt. <strong>Arkusz A4 kosztuje 59,00 zł brutto</strong>, bez
            minimalnego nakładu, a na jednym arkuszu zmieścisz{" "}
            <strong>kilka różnych kodów</strong>: opinie Google, Instagram, menu
            i Wi-Fi. Produkcja trwa <strong>2-3 dni robocze</strong>, potem
            wysyłamy paczkę do paczkomatu. Kod generujesz sam w darmowym
            generatorze - kreator drukuje wgrany obraz i go nie tworzy. Pełną
            ofertę dla biznesu znajdziesz na stronie{" "}
            <Link href="/naklejki-dla-firm" className={linkClass}>
              naklejki dla firm
            </Link>
            .
          </p>

          <div
            id="first-article-banner"
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Otwórz kreator naklejek
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#jak-przygotowac-kod-qr"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Jak przygotować kod
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 27
              października 2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "59 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "2-3 dni", label: "Produkcja" },
            { value: "Faktura VAT", label: "Dla firm z NIP" },
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

        {/* Kilka kodów na arkuszu - przewaga wobec partii jednego wzoru */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki QR z kilkoma różnymi kodami na jednym arkuszu
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Wiele drukarni wycenia naklejki z kodem QR jako partię jednego
            wzoru. Mała firma potrzebuje zwykle czegoś innego: kilku różnych
            kodów w niewielkiej liczbie - jeden przy kasie, drugi na stolikach,
            trzeci w paczkach. U nas wszystkie trafią na jeden arkusz A4 i
            kosztują razem 59,00 zł brutto, a o tym, jak zamawiać małe ilości
            bez przepłacania, piszemy w poradniku o{" "}
            <Link
              href="/blog/naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania"
              className={linkClass}
            >
              naklejkach w małym nakładzie
            </Link>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLUSES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-foreground leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-foreground font-heading pt-2">
            Ile kosztuje naklejka z kodem QR - rachunek na arkusz
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Koszt sztuki to 59,00 zł podzielone przez liczbę naklejek na
            arkuszu. Dostawa do paczkomatu (19,99 zł) jest liczona raz za całe
            zamówienie. Liczby są orientacyjne, bo zależą od kształtu i
            odstępów - zakresy bierzemy z poradnika{" "}
            <Link
              href="/blog/jaki-rozmiar-naklejki-wybrac"
              className={linkClass}
            >
              jaki rozmiar naklejki wybrać
            </Link>
            .
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr className="bg-[#edf6f2]/60 dark:bg-[#002c2e]/40">
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Rozmiar naklejki
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Naklejek na arkuszu A4
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Koszt sztuki
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Typowe zastosowanie
                  </th>
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
                      className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top"
                    >
                      {row.size}
                    </th>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.count}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.cost}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Zastosowania */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Do czego firmy zamawiają naklejki z kodem QR
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Kod QR zamienia naklejkę w skrót do strony: klient nie wpisuje
            adresu, tylko kieruje aparat telefonu. Sprawdza się wszędzie tam,
            gdzie chcesz odesłać kogoś do opinii, menu albo profilu, a miejsca
            na tekst jest mało.
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
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Kod do słoika czy butelki dobrze łączy się z etykietą na produkt:
            osobny opis takich zamówień znajdziesz na stronie{" "}
            <Link href="/etykiety-na-sloiki" className={linkClass}>
              etykiety na słoiki
            </Link>
            .
          </p>
        </section>

        {/* Jak przygotować kod */}
        <section
          id="jak-przygotowac-kod-qr"
          className="mt-12 space-y-6 scroll-mt-24"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak przygotować kod QR, żeby działał po wydruku
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Kreator drukuje dokładnie ten obraz, który wgrasz, i nie sprawdza,
            czy kod da się zeskanować. Dlatego o skanowaniu decydują cztery
            rzeczy po Twojej stronie: rodzaj kodu, kontrast z marginesem,
            rozmiar i jakość pliku. Skanowania po wydruku nie gwarantujemy, ale
            poniższe zalecenia zdejmują większość problemów, a test na wydruku
            próbnym kosztuje kilka groszy.
          </p>
          {/* Na telefonie wiersze układają się jeden pod drugim - trzy wąskie kolumny
              łamałyby tekst co kilka znaków. Od sm to zwykła tabela. */}
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <table className="block sm:table w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead className="hidden sm:table-header-group">
                <tr className="bg-[#edf6f2]/60 dark:bg-[#002c2e]/40">
                  <th
                    scope="col"
                    className="p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Co sprawdzić
                  </th>
                  <th
                    scope="col"
                    className="p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Zalecenie
                  </th>
                  <th
                    scope="col"
                    className="p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Dlaczego
                  </th>
                </tr>
              </thead>
              <tbody className="block sm:table-row-group">
                {PARAMS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`block sm:table-row p-4 sm:p-0 border-b border-border/60 sm:border-b-0 ${
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className="block sm:table-cell pb-1 sm:p-4 sm:border-b sm:border-border/60 text-left font-black text-foreground align-top"
                    >
                      {row.label}
                    </th>
                    <td className="block sm:table-cell pb-1 sm:p-4 sm:border-b sm:border-border/60 text-foreground font-semibold align-top">
                      {row.value}
                    </td>
                    <td className="block sm:table-cell sm:p-4 sm:border-b sm:border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-medium align-top">
                      {row.why}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-foreground font-heading pt-2">
            Ustawienia kodu QR w kreatorze naklejek
          </h3>
          <ul className="space-y-3 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed list-disc pl-5">
            <li>
              <strong className="text-foreground">Cięcie „Prostokąt”.</strong>{" "}
              Linia cięcia biegnie wokół całego obrazu, razem z białym
              marginesem kodu. „Kontur” poprowadzi cięcie po krawędzi samych
              kwadracików, a „Koło” obetnie narożniki - w trzech z nich są
              wzorce, po których aplikacja rozpoznaje kod. Więcej o rodzajach
              cięcia w poradniku o{" "}
              <Link
                href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
                className={linkClass}
              >
                die-cut i kiss-cut
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Bez „Usuń tło”.</strong> Biały
              margines ma zostać na swoim miejscu, a kod nie wymaga wycinania
              tła.
            </li>
            <li>
              <strong className="text-foreground">PNG zamiast PDF.</strong> Przy
              plikach PDF kreator przycina puste marginesy strony, więc mógłby
              zjeść biały margines kodu. PNG z marginesem w pliku jest
              bezpieczniejszy.
            </li>
            <li>
              <strong className="text-foreground">Płaska powierzchnia.</strong>{" "}
              Kod naklejaj na gładką, płaską ściankę. Na mocno wypukłej lub
              ryflowanej powierzchni folia się marszczy, a zniekształcony kod
              czyta się gorzej.
            </li>
          </ul>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Przygotowanie pliku w ogólności opisujemy w poradniku{" "}
            <Link
              href="/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu"
              className={linkClass}
            >
              drukowanie naklejek online: na co zwrócić uwagę przed wysyłką
            </Link>
            , a trwałość folii w{" "}
            <Link href="/naklejki-foliowe" className={linkClass}>
              opisie naklejek foliowych
            </Link>
            .
          </p>
        </section>

        {/* Zasady i bezpieczeństwo */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Opinie Google i podmiana kodu QR - o czym pamiętać
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-foreground leading-snug">
                  Zasady zbierania opinii
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Naklejka „Oceń nas” ma prowadzić do formularza opinii dla
                każdego klienta. Google nie pozwala oferować nagród za opinie
                ani prosić o nie tylko zadowolonych klientów, a naruszające
                opinie bywają usuwane. Aktualne zasady sprawdź w pomocy Google.
              </p>
            </div>
            <div className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-foreground leading-snug">
                  Podmiana kodu przez oszustów
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Oszuści potrafią nakleić własny kod na cudzy - znane są takie
                przypadki na parkomatach i stacjach ładowania. Umieszczaj
                naklejkę w miejscu, które widzisz (lada, kasa, stolik), co jakiś
                czas sprawdzaj, czy nikt nie nakleił na nią własnej, i dopisz
                pod kodem adres tekstem.
              </p>
            </div>
          </div>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja naklejek z kodem QR
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Parametry, które warto znać przed zamówieniem: materiał, druk,
            dostępne cięcia i warunki zamówienia w jednym miejscu.
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
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Folia
              winylowa, woda i UV
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Faktura VAT
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" /> Paczkomat 19,99 zł
            </span>
          </div>
        </section>

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak zamówić naklejki z kodem QR krok po kroku
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
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki z kodem QR - najczęstsze pytania
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
            Zamów naklejki z kodem QR od jednego arkusza
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj kody jako PNG, wybierz cięcie „Prostokąt” i ułóż je na
            arkuszu. Naklejki będą gotowe w 2-3 dni robocze za stałe 59,00 zł
            brutto od arkusza A4 - z fakturą VAT, bez minimalnego nakładu i bez
            opłat za przygotowanie pliku.
          </p>
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
