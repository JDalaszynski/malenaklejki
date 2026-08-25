import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Scissors,
  Layers,
  Spline,
  PenTool,
  Droplets,
  StickyNote,
  Sticker,
  Printer,
  Palette,
  Monitor,
  FileImage,
  Shapes,
  Square,
  Ruler,
  Eraser,
  Camera,
  Tag,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";

const PAGE_PATH = "/slownik-naklejek";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Słownik pojęć o naklejkach - die-cut, kiss-cut, DPI",
  description:
    "Słownik naklejek: die-cut, kiss-cut, folia winylowa, DPI, CMYK, kanał alfa i wlepki wyjaśnione prosto. Sprawdź terminy i zamów naklejki od 1 arkusza A4.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Słownik pojęć o naklejkach - die-cut, kiss-cut, DPI",
    description:
      "Die-cut, kiss-cut, folia winylowa, DPI, CMYK, kanał alfa, wlepki - słownik pojęć o naklejkach wyjaśniony prostym językiem. Zamów naklejki od 1 arkusza A4.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/landing/slownik-naklejek/die-cut-naklejka-ciecie-po-obrysie-kontur.jpg",
        width: 1024,
        height: 1177,
        alt: "Naklejka die-cut wycięta po obrysie z widocznym konturem - słownik pojęć o naklejkach MałeNaklejki.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Słownik pojęć o naklejkach - die-cut, kiss-cut, DPI",
    description:
      "Die-cut, kiss-cut, folia winylowa, DPI, CMYK, kanał alfa i wlepki wyjaśnione prosto. Słownik naklejek od MałeNaklejki - zamów od 1 arkusza A4.",
    images: [
      "/landing/slownik-naklejek/die-cut-naklejka-ciecie-po-obrysie-kontur.jpg",
    ],
  },
};

/**
 * Wszystkie pojęcia trzymamy w jednej tablicy, żeby widoczny glosariusz i schemat
 * DefinedTermSet (JSON-LD) były ZAWSZE identyczne. `def` to czysty tekst - ten sam
 * string zasila render i schemat, więc definicje nie mogą się rozjechać. Ewentualny
 * link jest osobnym elementem (chip "powiazane"), a nie częścią definicji.
 */
type Term = {
  icon: React.ElementType;
  name: string;
  def: string;
  href?: string;
  linkLabel?: string;
};

type TermGroup = {
  id: string;
  heading: string;
  intro: string;
  terms: Term[];
  images?: { src: string; alt: string }[];
};

const GLOSSARY: TermGroup[] = [
  {
    id: "ciecie",
    heading: "Rodzaje cięcia i kształt naklejek",
    intro:
      "Od sposobu cięcia zależy, czy naklejka ma kształt Twojej grafiki, czy zostaje na prostokątnym arkuszu. To najczęściej mylone pojęcia przy zamawianiu.",
    terms: [
      {
        icon: Scissors,
        name: "Die-cut (cięcie po obrysie)",
        def: "Die-cut to naklejka wycięta dokładnie po obrysie grafiki - bez marginesu i bez prostokątnego tła. Ploter prowadzi ostrze wzdłuż konturu motywu, więc naklejka przybiera kształt sylwetki, logo czy napisu. Efekt wygląda jak profesjonalny merch dopasowany na miarę do projektu.",
        href: "/naklejki-die-cut",
        linkLabel: "Zamów naklejki die-cut",
      },
      {
        icon: Layers,
        name: "Kiss-cut",
        def: "Kiss-cut to cięcie tylko przez wierzchnią warstwę folii, bez przecinania papieru podkładowego. Naklejka ma kształt grafiki, ale zostaje na całym prostokątnym arkuszu, z którego odklejasz ją pojedynczo. Sprawdza się przy masowym naklejaniu, na przykład etykiet na słoiki.",
        href: "/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych",
        linkLabel: "Die-cut vs kiss-cut",
      },
      {
        icon: Spline,
        name: "Linia cięcia (kontur, cut line)",
        def: "Linia cięcia to ścieżka, wzdłuż której ploter tnie folię i która wyznacza granicę naklejki. Przy cięciu po obrysie biegnie dokładnie po krawędzi grafiki. W kreatorze kontur powstaje automatycznie po wgraniu pliku, bez rysowania go ręcznie w Photoshopie.",
      },
      {
        icon: PenTool,
        name: "Wykrojnik (matryca tnąca)",
        def: "Wykrojnik to metalowa forma z nożem w kształcie wzoru, którą w tradycyjnym druku wykrawa się naklejki. Przy druku cyfrowym od 1 sztuki zastępuje go ploter tnący sterowany linią cięcia, dzięki czemu nie płacisz za osobną matrycę dla każdego kształtu.",
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/die-cut-naklejka-ciecie-po-obrysie-kontur.jpg",
        alt: "Naklejka die-cut wycięta po obrysie z widocznym białym konturem - motyw Świat Naklejek Atlas na ekranie telefonu i jako gotowa naklejka cięta po linii cięcia.",
      },
      {
        src: "/landing/slownik-naklejek/naklejka-die-cut-z-widoczna-linia-ciecia.jpg",
        alt: "Naklejka die-cut z rekinem wycięta dokładnie po obrysie grafiki - wyraźna linia cięcia (kontur) wokół motywu na trwałej folii winylowej.",
      },
    ],
  },
  {
    id: "materialy",
    heading: "Materiał, folia i wykończenie naklejek",
    intro:
      "Z czego zrobiona jest naklejka i co decyduje o jej trwałości. W MałeNaklejki rdzeniem oferty jest folia winylowa odporna na wodę, UV i zadrapania.",
    terms: [
      {
        icon: Droplets,
        name: "Folia winylowa (winyl)",
        def: "Folia winylowa to trwałe tworzywo, na którym drukujemy naklejki zamiast papieru. Jest odporna na wodę, promieniowanie UV i zadrapania, ma mocny klej i nie zostawia śladów po odklejeniu. To rdzeń oferty MałeNaklejki - wszystkie naklejki powstają na tej samej folii.",
        href: "/naklejki-foliowe",
        linkLabel: "Naklejki foliowe",
      },
      {
        icon: StickyNote,
        name: "Papier podkładowy (liner)",
        def: "Papier podkładowy to spodnia warstwa, z której odklejasz gotową naklejkę, i która chroni klej do momentu naklejenia. Przy cięciu kiss-cut cały komplet naklejek zostaje na jednym prostokątnym podkładzie, a przy die-cut podkład jest przycięty do kształtu naklejki.",
      },
      {
        icon: Sticker,
        name: "Klej (warstwa klejąca)",
        def: "Klej to warstwa pod folią, która utrzymuje naklejkę na powierzchni. W naklejkach MałeNaklejki jest mocny, dobrze trzyma na gładkich powierzchniach i po odklejeniu nie zostawia śladów. Nie jest jednak przystosowany do wielokrotnego przeklejania.",
      },
      {
        icon: ShieldCheck,
        name: "Naklejki łatwo usuwalne (bez śladów)",
        def: "Folia z mocnym klejem, która gwarantuje niezwykle trwałe przyleganie na gładkich powierzchniach, ale po podważeniu schodzi w jednym kawałku bez zostawiania trudnych do zmycia śladów. Ważne: nie oznacza to 'kleju repozycjonowalnego' - raz naklejona naklejka nie nadaje się do wielokrotnego przyklejania.",
      },
      {
        icon: Layers,
        name: "Laminat",
        def: "Laminat to dodatkowa przezroczysta warstwa ochronna, którą w niektórych technologiach nakłada się na wydruk dla większej odporności i połysku. W naklejkach MałeNaklejki odporność na wodę, promieniowanie UV i zadrapania zapewnia trwała folia winylowa, na której drukujemy.",
      },
    ],
  },
  {
    id: "kolory",
    heading: "Druk, rozdzielczość i kolory",
    intro:
      "Pojęcia, które decydują o ostrości i wierności kolorów wydruku. Naklejki MałeNaklejki drukujemy w rozdzielczości 300 DPI w pełnym kolorze.",
    terms: [
      {
        icon: Printer,
        name: "DPI (rozdzielczość druku)",
        def: "DPI (dots per inch) to liczba punktów druku na cal - im wyższa, tym ostrzejszy i bardziej szczegółowy wydruk. Naklejki MałeNaklejki drukujemy w 300 DPI. Dla małych naklejek poniżej 5 cm warto przygotować plik właśnie w 300 DPI, żeby krawędzie i detale były wyraźne.",
      },
      {
        icon: Palette,
        name: "CMYK",
        def: "CMYK to tryb kolorów używany w druku, oparty na czterech farbach: cyjan, magenta, żółty i czarny. Pliki przygotowane w CMYK najwierniej oddają kolory na wydruku. Jeśli wgrasz plik w RGB, zostanie przeliczony na CMYK, co może lekko zmienić najbardziej jaskrawe odcienie.",
      },
      {
        icon: Monitor,
        name: "RGB",
        def: "RGB to tryb kolorów ekranów, oparty na świetle czerwonym, zielonym i niebieskim. Grafika z telefonu czy monitora jest zwykle w RGB. Przy druku kolory RGB są konwertowane na CMYK, dlatego bardzo intensywne neony na wydruku mogą wyglądać nieco spokojniej niż na ekranie.",
      },
    ],
  },
  {
    id: "pliki",
    heading: "Pliki graficzne i format arkusza",
    intro:
      "Jak przygotować grafikę i co dzieje się z nią w kreatorze. Dobry plik to najkrótsza droga do ostrej naklejki wyciętej dokładnie po obrysie.",
    terms: [
      {
        icon: FileImage,
        name: "PNG i kanał alfa (przezroczyste tło)",
        def: "PNG to format pliku, który zapisuje przezroczystość dzięki tak zwanemu kanałowi alfa. Grafika PNG z przezroczystym tłem to najlepszy materiał do cięcia po obrysie - kreator od razu rozpoznaje kontur motywu i nie musi zgadywać, gdzie kończy się tło.",
      },
      {
        icon: Shapes,
        name: "Wektor i raster",
        def: "Raster (JPG, PNG) to obraz zbudowany z pikseli - zbyt mocno powiększony zaczyna się rozmywać. Wektor (SVG, PDF) opisuje kształty matematycznie, więc skaluje się bez utraty jakości. Do naklejek nadają się oba formaty, ale przy dużym powiększeniu grafiki wektorowe dają najostrzejsze krawędzie.",
      },
      {
        icon: Square,
        name: "Arkusz A4",
        def: "Arkusz A4 (21 x 29,7 cm) to jednostka rozliczeniowa w MałeNaklejki. Płacisz stałe 49,00 zł brutto za cały arkusz, niezależnie od tego, czy umieścisz na nim jedną dużą naklejkę do 19 cm, czy kilkadziesiąt małych. Nie ma minimalnego nakładu - zamówisz nawet jeden arkusz.",
      },
      {
        icon: Eraser,
        name: "Automatyczne usuwanie tła",
        def: "Usuwanie tła to oddzielenie głównego motywu od reszty zdjęcia, żeby naklejka nie miała prostokątnego tła. W kreatorze dzieje się to automatycznie po wgraniu zdjęcia - system odcina tło i wyznacza kontur do cięcia, bez Photoshopa i bez ręcznego wycinania.",
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/arkusz-a4-z-naklejkami-kiss-cut.jpg",
        alt: "Arkusz A4 z kilkunastoma naklejkami w stylu boho wyciętymi metodą kiss-cut - cały komplet na jednym podkładzie, obok podgląd arkusza w telefonie.",
      },
    ],
  },
  {
    id: "potoczne",
    heading: "Słownik potoczny: wlepki, fotonaklejki, etykiety",
    intro:
      "Nazwy, które klienci stosują zamiennie ze słowem naklejka. Warto wiedzieć, co dokładnie kryje się pod każdą z nich.",
    terms: [
      {
        icon: Sticker,
        name: "Wlepka (wlepki)",
        def: "Wlepka to potoczna nazwa naklejki, popularna wśród twórców oraz w kulturze skate i street. Zwykle chodzi o niewielką naklejkę z autorską grafiką lub logo, rozdawaną fanom albo naklejaną na laptopa, deskorolkę czy notes.",
        href: "/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci",
        linkLabel: "Wlepki dla twórców",
      },
      {
        icon: Camera,
        name: "Fotonaklejka",
        def: "Fotonaklejka to naklejka zrobiona z własnego zdjęcia - pupila, rodziny, wakacji czy rysunku dziecka. Zdjęcie trafia do kreatora, system usuwa tło i wycina motyw po obrysie, a wydruk powstaje na trwałej folii winylowej.",
        href: "/fotonaklejki",
        linkLabel: "Fotonaklejki ze zdjęcia",
      },
      {
        icon: Tag,
        name: "Naklejka a etykieta",
        def: "Naklejka to szerokie pojęcie, obejmujące grafiki ozdobne, reklamowe i informacyjne. Etykieta to naklejka o funkcji informacyjnej - z nazwą produktu, składem czy logo na słoiku lub butelce. Powstają tak samo, na tej samej folii winylowej, a różni je przeznaczenie.",
        href: "/naklejki-dla-firm",
        linkLabel: "Naklejki dla firm",
      },
    ],
    images: [
      {
        src: "/landing/slownik-naklejek/wlepka-die-cut-na-etui-telefonu.jpg",
        alt: "Wlepka die-cut z kwiatkiem naklejona na etui telefonu - mała autorska naklejka wycięta po obrysie na trwałej folii winylowej.",
      },
    ],
  },
];

// Płaska lista pojęć do schematu DefinedTermSet (parytet z widocznym glosariuszem).
const ALL_TERMS: Term[] = GLOSSARY.flatMap((g) => g.terms);

const FAQS: { q: string; a: string }[] = [
  {
    q: "Co to jest naklejka die-cut?",
    a: "Naklejka die-cut to naklejka wycięta dokładnie po obrysie grafiki, bez prostokątnego tła. Ploter tnie folię wzdłuż konturu motywu, więc naklejka ma kształt sylwetki, logo czy napisu. W MałeNaklejki zamówisz ją na trwałej folii winylowej za stałe 49,00 zł brutto od arkusza A4, już od 1 sztuki.",
  },
  {
    q: "Czym różni się die-cut od kiss-cut?",
    a: "Die-cut oznacza, że naklejka i podkład są wycięte po obrysie grafiki - dostajesz pojedyncze naklejki w kształcie motywu. Kiss-cut tnie tylko wierzchnią folię i zostawia naklejki na całym prostokątnym arkuszu podkładowym, wygodnym do masowego odklejania. Oba warianty ustawisz w kreatorze w tej samej cenie 49,00 zł za arkusz A4.",
  },
  {
    q: "Co oznacza 300 DPI przy naklejkach?",
    a: "DPI to liczba punktów druku na cal, a 300 DPI oznacza gęsty, ostry wydruk bez widocznych pikseli. Naklejki MałeNaklejki drukujemy właśnie w 300 DPI. Dla małych naklejek poniżej 5 cm warto przygotować plik w tej rozdzielczości, żeby drobne detale i krawędzie po cięciu były wyraźne.",
  },
  {
    q: "Jaki plik najlepiej przygotować do naklejek?",
    a: "Najlepiej sprawdza się plik PNG z przezroczystym tłem (kanał alfa) - kreator od razu rozpozna kontur i wyznaczy linię cięcia. Zadziała też zdjęcie JPG lub plik PDF: system automatycznie usunie tło i wytnie naklejkę po sylwetce głównego motywu. Dla ostrych krawędzi celuj w rozdzielczość 300 DPI.",
  },
  {
    q: "Czy grafika musi być w CMYK?",
    a: "Nie musisz samodzielnie konwertować pliku do CMYK. Jeśli wgrasz grafikę w RGB, typowo z telefonu lub monitora, zostanie ona przeliczona na CMYK do druku. Warto tylko pamiętać, że bardzo jaskrawe, neonowe kolory na wydruku mogą wyglądać nieco spokojniej niż na ekranie.",
  },
  {
    q: "Co to jest folia winylowa i czy jest wodoodporna?",
    a: "Folia winylowa to trwałe tworzywo, na którym drukujemy naklejki zamiast papieru. Jest odporna na wodę, promieniowanie UV i zadrapania, dzięki czemu naklejka wytrzyma na laptopie, bidonie, kasku czy ramie roweru. Ma mocny klej i po odklejeniu nie zostawia śladów.",
  },
  {
    q: "Czym różni się naklejka od etykiety?",
    a: "Naklejka to szerokie pojęcie obejmujące grafiki ozdobne, reklamowe i informacyjne. Etykieta to naklejka o funkcji informacyjnej - z nazwą produktu, składem czy logo na słoiku lub butelce. Powstają tak samo, na tej samej folii winylowej, a różni je przeznaczenie.",
  },
  {
    q: "Co to są wlepki?",
    a: "Wlepki to potoczna nazwa naklejek, popularna wśród twórców oraz w kulturze skate i street. Zwykle chodzi o niewielkie naklejki z autorską grafiką lub logo, rozdawane fanom albo naklejane na laptopa, deskorolkę czy notes. W kreatorze zamówisz je z cięciem po obrysie od 1 arkusza A4.",
  },
  {
    q: "Ile kosztują naklejki na zamówienie?",
    a: "Naklejki na zamówienie w MałeNaklejki kosztują stałe 49,00 zł brutto za arkusz A4, niezależnie od kształtu i liczby naklejek na arkuszu. Nie ma minimalnego nakładu ani opłat za przygotowanie pliku, więc drukujemy już od 1 arkusza. Dla firm wystawiamy fakturę VAT.",
  },
  {
    q: "Ile trwa realizacja zamówienia naklejek?",
    a: "Naklejki produkujemy w 2-3 dni robocze od opłacenia zamówienia i wysyłamy z odbiorem w paczkomacie (koszt dostawy 19,99 zł). Całość - od wgrania pliku po płatność BLIK lub Przelewy24 - załatwiasz online, bez kontaktu z grafikiem.",
  },
];

const CUT_COMPARISON: { feature: string; dieCut: string; kissCut: string }[] = [
  {
    feature: "Kształt wycięcia",
    dieCut: "Naklejka i podkład wycięte po obrysie grafiki",
    kissCut: "Tylko folia wycięta po obrysie, podkład w całości",
  },
  {
    feature: "Forma dostawy",
    dieCut: "Pojedyncze naklejki w kształcie motywu",
    kissCut: "Cały prostokątny arkusz z naklejkami do odklejania",
  },
  {
    feature: "Najlepsze do",
    dieCut: "Wlepki, merch, naklejki na gadżety",
    kissCut: "Etykiety produktowe, masowe naklejanie",
  },
  {
    feature: "Cena",
    dieCut: "49,00 zł brutto za arkusz A4",
    kissCut: "49,00 zł brutto za arkusz A4",
  },
];

export default function SlownikNaklejekPage() {
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
              name: "Słownik naklejek",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": `${PAGE_URL}#slownik`,
          name: "Słownik pojęć o naklejkach",
          description:
            "Słownik podstawowych pojęć związanych z naklejkami na zamówienie: rodzaje cięcia (die-cut, kiss-cut), materiał (folia winylowa), druk (DPI, CMYK, RGB), pliki graficzne oraz słownictwo potoczne.",
          url: PAGE_URL,
          inLanguage: "pl-PL",
          hasDefinedTerm: ALL_TERMS.map((t) => ({
            "@type": "DefinedTerm",
            name: t.name,
            description: t.def,
            inDefinedTermSet: `${PAGE_URL}#slownik`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki na zamówienie MałeNaklejki",
          description:
            "Naklejki na zamówienie na trwałej folii winylowej: cięcie po obrysie (die-cut) lub kiss-cut, druk 300 DPI, odporność na wodę, UV i zadrapania. Stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, z odbiorem w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Naklejki na zamówienie",
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
          name: "Słownik pojęć o naklejkach",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-07-29T00:00:00+02:00",
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
                Słownik naklejek
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <BookOpen className="w-4 h-4" />
            Słownik pojęć
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Słownik naklejek - die-cut, kiss-cut, folia i DPI
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Wyjaśniamy <strong>pojęcia o naklejkach</strong> prostym językiem -
            od <strong>die-cut</strong> i <strong>kiss-cut</strong>, przez{" "}
            <strong>folię winylową</strong>, <strong>300 DPI</strong> i CMYK, po{" "}
            <strong>kanał alfa</strong> i wlepki. Każdy termin poznasz w
            kontekście zamówienia, żebyś wiedział, co wybierasz w kreatorze.
            Wszystkie naklejki drukujemy na trwałej folii odpornej na wodę i UV,
            w stałej cenie <strong>49,00 zł brutto za arkusz A4</strong>, już od
            1 sztuki i z produkcją w <strong>2-3 dni robocze</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Otwórz kreator naklejek
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Die-cut czy kiss-cut?
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 29 lipca
              2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "Folia", label: "Winylowa, wodoodporna" },
            { value: "300 DPI", label: "Druk pełny kolor" },
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

        {/* Intro + jump nav */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Najważniejsze pojęcia o naklejkach w jednym miejscu
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Zamawiasz naklejki pierwszy raz i gubisz się w terminach z opisów
            produktów? Ten słownik tłumaczy je krótko i konkretnie - tak jak
            realnie działają przy zamówieniu w MałeNaklejki. Przejdź od razu do
            interesującej Cię grupy pojęć:
          </p>
          <div className="flex flex-wrap gap-2">
            {GLOSSARY.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#003a3b] border border-border/60 text-xs sm:text-sm font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {g.heading}
              </a>
            ))}
          </div>
        </section>

        {/* Glossary groups */}
        {GLOSSARY.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="mt-12 space-y-6 scroll-mt-24"
          >
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
                {group.heading}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                {group.intro}
              </p>
            </div>
            {group.images && group.images.length > 0 && (
              <div
                className={
                  group.images.length > 1
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : ""
                }
              >
                {group.images.map((img) => (
                  <div
                    key={img.src}
                    className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.terms.map((term) => {
                const Icon = term.icon;
                return (
                  <div
                    key={term.name}
                    className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </span>
                      <h3 className="text-base font-black text-foreground leading-snug">
                        {term.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {term.def}
                    </p>
                    {term.href && (
                      <Link
                        href={term.href}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        {term.linkLabel}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Die-cut vs kiss-cut quick table */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Die-cut a kiss-cut - porównanie w skrócie
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Dwa najczęściej mylone pojęcia zestawione obok siebie. Oba cięcia
            ustawisz w kreatorze w tej samej cenie - różni je forma dostawy i
            sposób odklejania.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr className="bg-[#edf6f2]/60 dark:bg-[#002c2e]/40">
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Cecha
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Die-cut
                  </th>
                  <th
                    scope="col"
                    className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground"
                  >
                    Kiss-cut
                  </th>
                </tr>
              </thead>
              <tbody>
                {CUT_COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }
                  >
                    <th
                      scope="row"
                      className="p-3 sm:p-4 border-b border-border/60 text-left font-black text-foreground align-top"
                    >
                      {row.feature}
                    </th>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.dieCut}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.kissCut}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
            Chcesz poznać szczegóły obu technik i zobaczyć, które cięcie wybrać
            do swojego zastosowania? Rozwijamy temat w poradniku o{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              różnicach między die-cut a kiss-cut
            </Link>
            .
          </p>
        </section>

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Od pojęć do zamówienia - jak zrobić naklejki krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj gotowy plik lub zdjęcie",
                text: "Wgraj do kreatora plik PNG z przezroczystym tłem (kanałem alfa), grafikę JPG albo PDF. Masz rysunek na papierze? Wystarczy sfotografować go telefonem - jakość aparatu w smartfonie jest w zupełności wystarczająca.",
              },
              {
                title: "Wybierz cięcie i ułóż arkusz A4",
                text: "Kreator automatycznie usunie tło i wyznaczy linię cięcia. Wybierz cięcie po obrysie (die-cut), kiss-cut, koło lub prostokąt, ustaw rozmiar i rozmieść naklejki na arkuszu A4 - jedną dużą do 19 cm albo kilkadziesiąt małych.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj realistyczny podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a naklejki wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za stałe 49,00 zł brutto od arkusza A4.",
              },
            ].map((step, i) => (
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
            Wiesz już, czego chcesz? Zamów{" "}
            <Link
              href="/naklejki-die-cut"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              naklejki die-cut cięte po obrysie
            </Link>{" "}
            albo zrób{" "}
            <Link
              href="/fotonaklejki"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              fotonaklejkę z własnego zdjęcia
            </Link>
            . Więcej o przygotowaniu pliku znajdziesz w poradniku o{" "}
            <Link
              href="/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              drukowaniu naklejek online
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Pojęcia o naklejkach - najczęstsze pytania
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
            Znasz już pojęcia - zamów własne naklejki
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj plik do kreatora, wybierz cięcie po obrysie lub kiss-cut i
            ułóż arkusz. Naklejki na trwałej folii winylowej odpornej na wodę,
            UV i zadrapania będą gotowe w 2-3 dni robocze za stałe 49,00 zł
            brutto od arkusza A4 - w dowolnym kształcie i bez minimalnego
            nakładu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-primary" /> Die-cut i
              kiss-cut
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" /> Folia winylowa
              300 DPI
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Produkcja 2-3 dni
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
