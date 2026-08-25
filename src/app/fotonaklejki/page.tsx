import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  PawPrint,
  Baby,
  Gift,
  Heart,
  Package,
  Scissors,
  Sparkles,
  Droplets,
  Printer,
  Smartphone,
  Truck,
  ShieldCheck,
  Layers,
  Clock,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/fotonaklejki";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Fotonaklejki - naklejki z własnego zdjęcia od 1 szt.",
  description:
    "Zrób fotonaklejki z własnego zdjęcia: wgraj plik z telefonu, my usuniemy tło i wytniemy naklejkę po obrysie na wodoodpornej folii. 49 zł brutto/arkusz A4, od 1 sztuki.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Fotonaklejki - naklejki z własnego zdjęcia, wodoodporne",
    description:
      "Fotonaklejki z Twojego zdjęcia na trwałej folii winylowej: automatyczne usuwanie tła, cięcie po obrysie, druk 300 DPI. 49 zł brutto za arkusz A4, od 1 sztuki.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/landing/fotonaklejki/fotonaklejki-ze-zdjec-arkusz-a4.png",
        width: 1024,
        height: 1177,
        alt: "Fotonaklejki ze zdjęć na arkuszu A4 - portret psa, kadr z wakacji i rysunek dziecka wycięte po obrysie, MałeNaklejki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fotonaklejki - naklejki z własnego zdjęcia, wodoodporne",
    description:
      "Wgraj zdjęcie z telefonu, a my usuniemy tło i wytniemy fotonaklejkę po obrysie na wodoodpornej folii. 49 zł brutto za arkusz A4, od 1 sztuki.",
    images: ["/landing/fotonaklejki/fotonaklejki-ze-zdjec-arkusz-a4.png"],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Co to są fotonaklejki?",
    a: "Fotonaklejki to naklejki drukowane z Twojego własnego zdjęcia lub grafiki na trwałej folii winylowej. Wgrywasz plik z telefonu lub komputera, kreator automatycznie usuwa tło, a my wycinamy naklejkę po obrysie motywu. W odróżnieniu od papierowej odbitki fotonaklejka jest samoprzylepna, wodoodporna i gotowa, by nakleić ją na laptop, bidon czy kask.",
  },
  {
    q: "Ile kosztują fotonaklejki z własnego zdjęcia?",
    a: "Obowiązuje stała cena 49,00 zł brutto za arkusz A4, niezależnie od liczby zdjęć. Na jednym arkuszu zmieścisz jedną dużą fotonaklejkę do 19 cm albo kilkanaście mniejszych z różnymi kadrami - im mniejsza naklejka, tym niższy koszt sztuki. Nie ma minimalnego nakładu ani opłat za przygotowanie pliku, więc drukujemy już od 1 arkusza.",
  },
  {
    q: "Czy fotonaklejki są wodoodporne?",
    a: "Tak. Fotonaklejki drukujemy na folii winylowej odpornej na wodę, promieniowanie UV i zadrapania, a nie na papierze. Dzięki temu zdjęcie nie rozmięknie od zachlapania ani nie spłowieje tak szybko jak zwykła odbitka i sprawdzi się na bidonie, kubku, laptopie czy sprzęcie sportowym.",
  },
  {
    q: "Czy zrobię fotonaklejkę ze zdjęcia w telefonie?",
    a: "Tak, cały proces przejdziesz na telefonie. Wgraj zdjęcie prosto z galerii, a kreator sam usunie tło i wygeneruje ścieżkę cięcia po obrysie - bez Photoshopa i bez znajomości programów graficznych. Zdjęcia z nowszego smartfona (od 12 Mpx) mają w zupełności wystarczającą jakość.",
  },
  {
    q: "Jak automatyczne usuwanie tła działa przy zdjęciu?",
    a: "Po wgraniu zdjęcia kreator wykrywa główny motyw i odcina go od tła, zostawiając np. sam portret psa na przezroczystym tle. To ten krok sprawia, że fotonaklejka wygląda profesjonalnie, a nie jak zdjęcie przyklejone na białym prostokącie. Efekt zobaczysz od razu na podglądzie i możesz skorygować ścieżkę cięcia przed zamówieniem.",
  },
  {
    q: "Czy mogę zrobić fotonaklejkę z portretem osoby lub zwierzęcia?",
    a: "Tak, to jeden z najpopularniejszych motywów. Kreator wyizoluje sylwetkę osoby lub pupila ze zdjęcia i wytnie fotonaklejkę dokładnie po obrysie postaci. Najlepszy efekt daje wyraźne, dobrze oświetlone zdjęcie z czytelnie oddzielonym od tła motywem.",
  },
  {
    q: "Jakie zdjęcie i format pliku najlepiej przygotować?",
    a: "Wgraj zdjęcie w formacie JPG, PNG lub plik PDF. Najlepiej sprawdza się ostre, dobrze oświetlone zdjęcie z wyraźnymi krawędziami motywu - ułatwia to automatyczne usuwanie tła i precyzyjne cięcie po obrysie. Zdjęcie z rozmytym lub bardzo zatłoczonym tłem również zadziała, ale kontur może wymagać drobnej korekty w kreatorze.",
  },
  {
    q: "Ile fotonaklejek zmieszczę na jednym arkuszu A4?",
    a: "Na arkuszu A4 zmieścisz jedną dużą fotonaklejkę do 19 cm albo kilkanaście mniejszych z różnymi zdjęciami - wszystko w tej samej cenie 49,00 zł brutto. Kreator pilnuje, aby naklejki na siebie nie nachodziły i optymalnie wykorzystały miejsce.",
  },
  {
    q: "Jak szybko zrealizujecie zamówienie fotonaklejek?",
    a: "Fotonaklejki produkujemy w 2-3 dni robocze od opłacenia zamówienia, a gotowe naklejki wysyłamy z odbiorem w paczkomacie. Całość - od wgrania zdjęcia po płatność BLIK lub Przelewy24 - załatwiasz online, bez kontaktu z grafikiem.",
  },
  {
    q: "Czym fotonaklejka różni się od odbitki zdjęcia z fotokiosku?",
    a: "Odbitka to papierowy wydruk zdjęcia - nie klei się, nie jest wodoodporny i łatwo się niszczy. Fotonaklejka to samoprzylepna folia winylowa: wodoodporna, odporna na UV i zadrapania, wycięta po obrysie motywu i gotowa, by nakleić ją na dowolny przedmiot. To trwały nośnik zdjęcia, a nie zwykła fotografia na papierze.",
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
    icon: PawPrint,
    title: "Portret pupila",
    text: "Fotonaklejka z psem lub kotem wycięta po obrysie sylwetki to hit wśród właścicieli zwierząt - na laptop, bidon czy jako pamiątka.",
    href: "/blog/naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke",
    linkLabel: "Naklejka ze zdjęcia krok po kroku",
  },
  {
    icon: Camera,
    title: "Zdjęcia rodzinne i z wakacji",
    text: "Kadr z wyjazdu, selfie z przyjaciółmi czy portret rodziny zamieniony w trwałą, wodoodporną naklejkę na pamiątkę.",
  },
  {
    icon: Baby,
    title: "Rysunek dziecka na folii",
    text: "Sfotografuj pracę malucha telefonem, a my wytniemy fotonaklejkę po obrysie rysunku - miniaturowe dzieło sztuki, które zostanie na lata.",
  },
  {
    icon: Gift,
    title: "Personalizowany prezent",
    text: "Fotonaklejka ze wspólnym zdjęciem to prezent na urodziny czy imieniny, który daje kawałek wspólnej historii zamiast kolejnego gadżetu.",
  },
  {
    icon: Heart,
    title: "Pamiątki ze ślubu i eventów",
    text: "Naklejki ze zdjęciami z wesela, integracji czy festiwalu - jako podziękowania dla gości albo trwała pamiątka z imprezy.",
    href: "/blog/personalizowane-naklejki-na-alkohol-wyjatkowy-dodatek-na-wesela-i-imprezy",
    linkLabel: "Personalizowane naklejki na imprezy",
  },
  {
    icon: Package,
    title: "Merch i marka ze zdjęcia",
    text: "Zdjęcie produktu, autorska ilustracja czy grafika twórcy przeniesione na fotonaklejki do rozdawania fanom lub dołączania do paczek.",
    href: "/blog/male-naklejki-na-laptopa-jak-wyrazic-siebie-i-stworzyc-wlasny-styl",
    linkLabel: "Małe naklejki na laptopa",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: "Automatyczne usuwanie tła",
    text: "Wgraj zwykłe zdjęcie, a kreator sam odetnie główny motyw od tła w kilka sekund - bez Photoshopa i bez ręcznego wycinania. To dzięki temu fotonaklejka wygląda profesjonalnie.",
  },
  {
    icon: Scissors,
    title: "Cięcie po obrysie (die-cut)",
    text: "Wycinamy fotonaklejkę dokładnie wzdłuż kształtu ze zdjęcia, a nie w nudny prostokąt. Do wyboru masz też cięcie w koło lub prostokąt.",
  },
  {
    icon: Droplets,
    title: "Wodoodporna folia winylowa",
    text: "Drukujemy na trwałej folii winylowej odpornej na wodę, UV i zadrapania - zdjęcie nie rozmięknie i nie spłowieje tak szybko jak papierowa odbitka.",
  },
  {
    icon: Printer,
    title: "Druk 300 DPI w pełnym kolorze",
    text: "Rozdzielczość 300 DPI oddaje detale twarzy, sierść pupila i przejścia kolorów ostro i nasycono, bez pikselozy widocznej na tanich wydrukach.",
  },
  {
    icon: Smartphone,
    title: "Gotowe z telefonu w kilka minut",
    text: "Cały proces - od wgrania zdjęcia z galerii po złożenie zamówienia - przechodzisz na telefonie, bez instalowania programów i bez kontaktu z grafikiem.",
  },
  {
    icon: Truck,
    title: "Polska produkcja, paczkomat",
    text: "Fotonaklejki produkujemy w Polsce w 2-3 dni robocze i wysyłamy z odbiorem w paczkomacie. Wszystko po polsku, z płatnością BLIK i Przelewy24.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Źródło grafiki", value: "Własne zdjęcie lub plik (JPG, PNG, PDF)" },
  { label: "Usuwanie tła", value: "Automatyczne w kreatorze, bez Photoshopa" },
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Cięcie", value: "Po obrysie (die-cut), koło lub prostokąt" },
  {
    label: "Rozmiar",
    value:
      "Jedna duża fotonaklejka do 19 cm lub kilkanaście małych na arkuszu A4",
  },
  {
    label: "Wykończenie",
    value: "Na arkuszu A4 lub pojedyncze docięte sztuki",
  },
  {
    label: "Cena",
    value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu",
  },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka", value: "Odbiór w paczkomacie, dostawa 19,99 zł" },
  { label: "Płatność", value: "BLIK, Przelewy24, przelew" },
];

export default function FotonaklejkiPage() {
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
              name: "Fotonaklejki",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Fotonaklejki z własnego zdjęcia",
          description:
            "Fotonaklejki drukowane z własnego zdjęcia na trwałej folii winylowej: automatyczne usuwanie tła, cięcie po obrysie, druk 300 DPI. Stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, z odbiorem w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Fotonaklejki - naklejki ze zdjęcia",
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
          name: "Fotonaklejki z własnego zdjęcia",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-07-27T00:00:00+02:00",
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
                Fotonaklejki
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Camera className="w-4 h-4" />
            Naklejki z Twojego zdjęcia
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Fotonaklejki - naklejki z własnego zdjęcia
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zrób <strong>fotonaklejki z własnego zdjęcia</strong> w polskiej
            drukarni: wgraj plik prosto z telefonu, a kreator{" "}
            <strong>automatycznie usunie tło</strong> i wytnie naklejkę{" "}
            <strong>po obrysie</strong> na trwałej{" "}
            <strong>folii winylowej odpornej na wodę i UV</strong>. Druk{" "}
            <strong>300 DPI</strong>, stała cena{" "}
            <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 sztuki,
            produkcja w <strong>2-3 dni robocze</strong> i odbiór w paczkomacie.
            Chcesz poznać cały proces?{" "}
            <Link
              href="/blog/naklejka-ze-zdjecia-jak-przeniesc-wspomnienia-na-naklejke"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              zobacz, jak zrobić naklejkę ze zdjęcia krok po kroku
            </Link>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Zrób fotonaklejkę ze zdjęcia
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/jak-zrobic-wlasne-naklejki-w-telefonie-proste-aplikacje-i-triki"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Jak zrobić naklejki w telefonie
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 27 lipca
              2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "300 DPI", label: "Druk pełny kolor" },
            { value: "Woda·UV·rysy", label: "Odporność folii" },
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

        {/* Czym są */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Czym są fotonaklejki i jak powstają ze zdjęcia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
              <img
                src="/landing/fotonaklejki/fotonaklejki-ze-zdjec-arkusz-a4.png"
                alt="Fotonaklejki ze zdjęć na arkuszu A4 - portret psa, kadr z wakacji i rysunek dziecka wycięte po obrysie, obok telefon ze zdjęciem w galerii."
                className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
              <img
                src="/landing/fotonaklejki/jak-powstaje-fotonaklejka-ze-zdjecia.png"
                alt="Jak powstaje fotonaklejka ze zdjęcia - zdjęcie z telefonu zamienione w naklejkę wyciętą po obrysie na folii winylowej."
                className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
              />
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Fotonaklejki to naklejki drukowane z Twojego własnego zdjęcia lub
            grafiki na trwałej folii winylowej. Zamiast papierowej odbitki,
            która się nie klei i szybko niszczy, dostajesz samoprzylepną,
            wodoodporną naklejkę wyciętą dokładnie po obrysie motywu ze zdjęcia.
            To trwały nośnik wspomnień, który naklejasz na laptop, bidon, kask
            czy pudełko z prezentem.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Cała trudna część dzieje się automatycznie w kreatorze. Wgrywasz
            zwykłe zdjęcie z telefonu, a system sam wykrywa główny motyw i usuwa
            tło - Twój pies znika z podłogi i zostaje na przezroczystym tle,
            gotowy do cięcia po obrysie. Nie potrzebujesz Photoshopa ani
            umiejętności graficznych. Każdą fotonaklejkę drukujemy w
            rozdzielczości 300 DPI na folii winylowej odpornej na wodę,
            promieniowanie UV i zadrapania.
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja fotonaklejek ze zdjęcia
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Parametry druku, materiału i warunki zamówienia w jednym miejscu -
            zanim wgrasz zdjęcie i złożysz zamówienie na fotonaklejki.
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

        {/* Zastosowania */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Co przeniesiesz na fotonaklejkę
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Na fotonaklejkę trafi praktycznie wszystko, co masz w galerii
            telefonu - od portretu pupila po zdjęcia z wakacji. Oto najczęstsze
            pomysły klientów na naklejki z własnego zdjęcia.
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

          <div className="pt-4 space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-foreground font-heading">
              Przykłady fotonaklejek ze zdjęć
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
                <img
                  src="/landing/fotonaklejki/fotonaklejka-z-pupila-die-cut-na-laptopie.png"
                  alt="Fotonaklejka z pupila - portret śpiącego jamnika wycięty po obrysie (die-cut) naklejony na pokrywie laptopa."
                  className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
                <img
                  src="/landing/fotonaklejki/fotonaklejka-ze-zdjecia-z-wakacji-na-termosie.png"
                  alt="Wodoodporna fotonaklejka ze zdjęcia z wakacji na stalowym termosie - kadr z pary w górach, odporny na warunki na szlaku."
                  className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
                <img
                  src="/landing/fotonaklejki/fotonaklejka-ze-zdjeciem-jako-prezent.png"
                  alt="Fotonaklejka ze zdjęciem jako prezent - okrągła naklejka ze wspólnym zdjęciem na pudełku z różową kokardą."
                  className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
                <img
                  src="/landing/fotonaklejki/fotonaklejka-ze-zdjeciem-zwierzaka-ze-zoo.png"
                  alt="Fotonaklejka ze zdjęciem zwierzaka - zdjęcie kapibary z zoo zamienione w naklejkę wyciętą po obrysie."
                  className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Zalety */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego warto zrobić fotonaklejki w MałeNaklejki
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40 my-6">
            <img
              src="/landing/fotonaklejki/fotonaklejka-automatyczne-usuwanie-tla.png"
              alt="Automatyczne usuwanie tła w kreatorze - zdjęcie kota brytyjskiego zamienione w fotonaklejkę wyciętą po obrysie, bez Photoshopa."
              className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
            />
          </div>
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
            Jak zrobić fotonaklejkę krok po kroku
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40 my-6">
            <img
              src="/landing/fotonaklejki/fotonaklejka-ze-zdjecia-hobby-w-kreatorze.png"
              alt="Fotonaklejka ze zdjęcia hobby - zdjęcie zabytkowej lokomotywy z telefonu zamienione w naklejkę die-cut w kreatorze."
              className="w-full h-auto [clip-path:inset(0_0_12%_0)]"
            />
          </div>
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj zdjęcie z telefonu lub komputera",
                text: "Wgraj do kreatora zdjęcie w formacie JPG, PNG lub PDF. Masz rysunek na papierze? Wystarczy sfotografować go telefonem - jakość aparatu w smartfonie jest w zupełności wystarczająca.",
              },
              {
                title: "Usuń tło i wybierz cięcie po obrysie",
                text: "Kreator sam usunie tło i zaznaczy główny motyw. Wybierz cięcie po obrysie, w koło lub w prostokąt, ustaw rozmiar i ułóż fotonaklejki na arkuszu A4 - jedną dużą do 19 cm albo kilkanaście mniejszych z różnymi zdjęciami.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj realistyczny podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a fotonaklejki wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za stałe 49,00 zł brutto od arkusza A4.",
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
            Chcesz, żeby fotonaklejka miała kształt sylwetki ze zdjęcia, a nie
            prostokąta? Wybierz{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięcie die-cut po obrysie
            </Link>
            . Fotonaklejki drukujemy na tej samej{" "}
            <Link
              href="/naklejki-foliowe"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              wodoodpornej folii winylowej
            </Link>
            , co pozostałe nasze naklejki.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Fotonaklejki - najczęstsze pytania
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
            Zrób fotonaklejki z własnego zdjęcia
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj zdjęcie do kreatora, pozwól mu usunąć tło i wybierz cięcie po
            obrysie. Fotonaklejki będą gotowe w 2-3 dni robocze za stałe 49,00
            zł brutto od arkusza A4 - na trwałej folii winylowej odpornej na
            wodę, UV i zadrapania, bez minimalnego nakładu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Automatyczne
              usuwanie tła
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Folia winylowa 300
              DPI
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
