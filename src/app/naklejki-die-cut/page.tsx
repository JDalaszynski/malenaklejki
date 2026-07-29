import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Scissors,
  Shapes,
  Sparkles,
  Droplets,
  Printer,
  Layers,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sticker,
  Laptop,
  Car,
  Bike,
  Camera,
  Building2,
} from "lucide-react";

const PAGE_PATH = "/naklejki-die-cut";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Naklejki die-cut - cięte po obrysie, dowolny kształt",
  description:
    "Zamów naklejki die-cut cięte dokładnie po obrysie grafiki: dowolny kształt zamiast prostokąta, folia winylowa, druk 300 DPI. 49 zł brutto/arkusz A4, od 1 sztuki.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Naklejki die-cut - cięte po obrysie, dowolny kształt",
    description:
      "Naklejki die-cut wycięte po konturze grafiki na trwałej folii winylowej: dowolny kształt, druk 300 DPI, woda i UV. 49 zł brutto za arkusz A4, od 1 sztuki.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/landing/naklejki-die-cut/arkusz-naklejek-die-cut-rozne-ksztalty.jpg",
        width: 1024,
        height: 1177,
        alt: "Arkusz z kilkunastoma naklejkami die-cut o różnych kształtach wyciętych po obrysie - kot, książki, kubek, aparat i rower, MałeNaklejki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naklejki die-cut - cięte po obrysie, dowolny kształt",
    description:
      "Naklejki die-cut wycięte dokładnie po konturze grafiki: dowolny kształt, folia winylowa, druk 300 DPI. 49 zł brutto za arkusz A4, od 1 sztuki.",
    images: ["/landing/naklejki-die-cut/arkusz-naklejek-die-cut-rozne-ksztalty.jpg"],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Co to są naklejki die-cut?",
    a: "Naklejki die-cut to naklejki wycięte dokładnie po obrysie grafiki, bez marginesu i bez prostokątnego tła. Ploter tnie folię wzdłuż konturu Twojego motywu, więc naklejka przybiera kształt sylwetki kota, logo czy napisu, a nie standardowego kwadratu. Efekt wygląda jak profesjonalny merch dopasowany na miarę do projektu.",
  },
  {
    q: "Ile kosztują naklejki die-cut?",
    a: "Obowiązuje stała cena 49,00 zł brutto za arkusz A4, niezależnie od kształtu i liczby naklejek. Cięcie po obrysie nie jest droższe niż cięcie prostokątne - płacisz za powierzchnię arkusza, a nie za typ wycięcia. Nie ma minimalnego nakładu ani opłat za przygotowanie pliku, więc drukujemy już od 1 arkusza.",
  },
  {
    q: "Czym różnią się naklejki die-cut od kiss-cut?",
    a: "Die-cut oznacza, że naklejka i podkład są wycięte po obrysie grafiki - dostajesz pojedyncze naklejki w kształcie motywu. Kiss-cut to cięcie tylko przez folię, które zostawia naklejki na całym prostokątnym arkuszu podkładowym, wygodne do masowego odklejania. Oba warianty ustawisz w kreatorze w tej samej cenie 49,00 zł za arkusz A4.",
  },
  {
    q: "Czy mogę zamówić naklejki w dowolnym kształcie?",
    a: "Tak, na tym polega cięcie die-cut. Naklejka może mieć dowolny kształt dopasowany do konturu grafiki - nieregularny obrys ilustracji, sylwetkę zwierzaka, zarys logo. Do wyboru masz też cięcie w koło lub prostokąt, jeśli wolisz klasyczny format.",
  },
  {
    q: "Jaki plik przygotować do cięcia po obrysie?",
    a: "Najlepiej sprawdza się plik PNG z przezroczystym tłem (kanał alfa) - kreator sam rozpozna kontur i wygeneruje ścieżkę cięcia. Zadziała też zdjęcie JPG lub plik PDF: system automatycznie usunie tło i wytnie naklejkę po sylwetce głównego motywu. Dla małych naklejek warto zadbać o rozdzielczość 300 DPI, żeby krawędzie były ostre.",
  },
  {
    q: "Czy naklejki die-cut są wodoodporne?",
    a: "Tak. Naklejki die-cut drukujemy na trwałej folii winylowej odpornej na wodę, promieniowanie UV i zadrapania, a nie na papierze. Dzięki temu sprawdzą się na laptopie, bidonie, kasku czy ramie roweru i nie rozmiękną od zachlapania.",
  },
  {
    q: "Ile różnych kształtów zmieszczę na jednym arkuszu A4?",
    a: "Na arkuszu A4 ułożysz kilkanaście różnych wzorów o odmiennych kształtach - zdjęcie, cytat, logo i rysunkowy motyw obok siebie. Każdy element zostanie wycięty osobno, dokładnie po swoim obrysie, a całość kosztuje stałe 49,00 zł brutto. Kreator pilnuje, aby naklejki na siebie nie nachodziły.",
  },
  {
    q: "Jaki jest minimalny nakład naklejek die-cut?",
    a: "Nie ma minimalnego nakładu. Zamówisz nawet pojedynczy arkusz A4 z jedną naklejką albo z kilkunastoma różnymi wzorami - zawsze za tę samą cenę 49,00 zł brutto. To dobre rozwiązanie na próbny wydruk, pojedyncze wlepki dla twórcy czy mały nakład dla firmy.",
  },
  {
    q: "Jak duża może być jedna naklejka die-cut?",
    a: "Jedna naklejka die-cut może mieć do 19 cm w najdłuższym wymiarze i zajmować sporą część arkusza A4. Możesz też zdecydować się na kilkadziesiąt małych naklejek na jednym arkuszu - w tej samej cenie. Im mniejsza pojedyncza naklejka, tym niższy koszt sztuki.",
  },
  {
    q: "Jak szybko zrealizujecie zamówienie naklejek die-cut?",
    a: "Naklejki die-cut produkujemy w 2-3 dni robocze od opłacenia zamówienia i wysyłamy z odbiorem w paczkomacie. Całość - od wgrania pliku po płatność BLIK lub Przelewy24 - załatwiasz online, bez kontaktu z grafikiem.",
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
    icon: Sticker,
    title: "Wlepki i merch twórców",
    text: "Autorskie wzory wycięte po obrysie wyglądają jak profesjonalny merch - idealne do rozdawania fanom albo sprzedaży w małym nakładzie.",
    href: "/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci",
    linkLabel: "Wlepki dla artystów i społeczności",
  },
  {
    icon: Laptop,
    title: "Naklejki na laptop i gadżety",
    text: "Nieregularny kształt die-cut podkreśla charakter grafiki na płaskich powierzchniach - laptopie, notesie, butelce czy kasku.",
    href: "/blog/male-naklejki-na-laptopa-jak-wyrazic-siebie-i-stworzyc-wlasny-styl",
    linkLabel: "Małe naklejki na laptopa",
  },
  {
    icon: Building2,
    title: "Logo firmy w kształcie logo",
    text: "Naklejka wycięta po konturze znaku wygląda znacznie lepiej niż logo zamknięte w prostokącie - świetna do brandowania paczek i produktów.",
    href: "/blog/naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty",
    linkLabel: "Naklejka z logo firmy",
  },
  {
    icon: Car,
    title: "Naklejki motoryzacyjne i tuningowe",
    text: "Emblematy, numery startowe i grafiki tuningowe cięte po obrysie trzymają się karoserii, szyby czy kasku i znoszą wodę oraz UV.",
    href: "/blog/naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem",
    linkLabel: "Naklejki motoryzacyjne i tuningowe",
  },
  {
    icon: Bike,
    title: "Rower i sprzęt sportowy",
    text: "Naklejki w kształcie logo lub grafiki na ramę roweru, kask czy bidon - dopasowane do konturu i odporne na deszcz oraz słońce.",
    href: "/blog/naklejki-na-rower-i-akcesoria-sportowe-dla-pasjonatow",
    linkLabel: "Naklejki na rower i sport",
  },
  {
    icon: Camera,
    title: "Zdjęcia wycięte po sylwetce",
    text: "Fotonaklejka z pupilem czy portretem wycięta dokładnie po obrysie postaci to popularny wariant cięcia die-cut ze zdjęcia.",
    href: "/fotonaklejki",
    linkLabel: "Fotonaklejki ze zdjęcia",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Scissors,
    title: "Cięcie dokładnie po obrysie",
    text: "Ploter tnie folię wzdłuż konturu Twojej grafiki, bez prostych, sztucznych krawędzi. Naklejka wygląda tak, jakby powstała na miarę pod projekt.",
  },
  {
    icon: Shapes,
    title: "Dowolny kształt na jednym arkuszu",
    text: "Zestaw kilkanaście różnych wzorów o odmiennych kształtach na jednym A4 - każdy zostanie wycięty osobno po swoim obrysie, w tej samej cenie.",
  },
  {
    icon: Sparkles,
    title: "Kreator sam wyznacza linię cięcia",
    text: "Po wgraniu pliku kreator automatycznie wykrywa kontur grafiki lub usuwa tło ze zdjęcia i wyznacza precyzyjną ścieżkę cięcia - bez Photoshopa.",
  },
  {
    icon: Droplets,
    title: "Wodoodporna folia winylowa",
    text: "Drukujemy na trwałej folii winylowej odpornej na wodę, UV i zadrapania. Naklejka die-cut wytrzyma na laptopie, bidonie czy ramie roweru.",
  },
  {
    icon: Printer,
    title: "Druk 300 DPI w pełnym kolorze",
    text: "Rozdzielczość 300 DPI oddaje ostre krawędzie i nasycone kolory nawet przy precyzyjnym cięciu wzdłuż drobnego konturu.",
  },
  {
    icon: Truck,
    title: "Polska produkcja, paczkomat",
    text: "Naklejki die-cut produkujemy w Polsce w 2-3 dni robocze i wysyłamy z odbiorem w paczkomacie. Wszystko po polsku, z płatnością BLIK i Przelewy24.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Rodzaj cięcia", value: "Po obrysie (die-cut), koło lub prostokąt" },
  { label: "Kształt", value: "Dowolny, dopasowany do konturu grafiki" },
  { label: "Źródło grafiki", value: "Gotowy plik PNG, JPG, PDF lub zdjęcie" },
  { label: "Wyznaczanie konturu", value: "Automatyczne w kreatorze, bez Photoshopa" },
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Rozmiar", value: "Jedna duża do 19 cm lub kilkadziesiąt małych na arkuszu A4" },
  { label: "Wykończenie", value: "Na arkuszu A4 lub pojedyncze docięte sztuki" },
  { label: "Cena", value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu" },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka i płatność", value: "Paczkomat 19,99 zł; BLIK, Przelewy24, przelew" },
];

export default function NaklejkiDieCutPage() {
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
              name: "Naklejki die-cut",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki die-cut cięte po obrysie",
          description:
            "Naklejki die-cut wycięte dokładnie po obrysie grafiki na trwałej folii winylowej: dowolny kształt, automatyczne wyznaczanie konturu w kreatorze, druk 300 DPI. Stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, z odbiorem w paczkomacie.",
          brand: { "@id": "https://www.malenaklejki.pl/#organization" },
          category: "Naklejki die-cut - cięcie po obrysie",
          material: "Folia winylowa",
          offers: {
            "@type": "Offer",
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
          name: "Naklejki die-cut cięte po obrysie",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-07-29T00:00:00+02:00",
        }}
      />

      <Header />

      <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm font-bold text-muted-foreground/80 mb-4">
          <ol className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Kreator Zestawu Naklejek
              </Link>
            </li>
            <li className="flex items-center gap-1.5 sm:gap-2" aria-current="page">
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-extrabold">Naklejki die-cut</span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Scissors className="w-4 h-4" />
            Cięcie po obrysie
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Naklejki die-cut - cięte po obrysie
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zamów <strong>naklejki die-cut</strong> wycięte dokładnie <strong>po obrysie grafiki</strong> - w dowolnym
            kształcie zamiast nudnego prostokąta. Wgraj gotowy plik, a kreator <strong>sam wyznaczy kontur</strong> i
            ścieżkę cięcia na trwałej <strong>folii winylowej odpornej na wodę i UV</strong>. Druk{" "}
            <strong>300 DPI</strong>, stała cena <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 sztuki,
            produkcja w <strong>2-3 dni robocze</strong> i odbiór w paczkomacie. Nie wiesz, które cięcie wybrać?{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              porównaj die-cut i kiss-cut
            </Link>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Zamów naklejki die-cut
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
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 29 lipca 2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "Dowolny", label: "Kształt po obrysie" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "300 DPI", label: "Druk pełny kolor" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-1 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 py-5 px-2 shadow-sm"
            >
              <span className="text-lg sm:text-2xl font-black text-primary">{stat.value}</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Czym są */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Czym są naklejki die-cut i jak powstają
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
  <img src="/landing/naklejki-die-cut/arkusz-naklejek-die-cut-rozne-ksztalty.jpg" alt="Arkusz z kilkunastoma naklejkami die-cut o różnych kształtach - kot, książki, kubek, aparat i rower wycięte po obrysie, na drewnianym biurku obok szkicownika." className="w-full h-auto [clip-path:inset(0_0_12%_0)]" />
</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
  <img src="/landing/naklejki-die-cut/jak-powstaje-naklejka-die-cut-ze-zdjecia.jpg" alt="Jak powstaje naklejka die-cut ze zdjęcia - zdjęcie z telefonu zamienione w naklejkę wyciętą dokładnie po obrysie sylwetki na białym tle." className="w-full h-auto [clip-path:inset(0_0_12%_0)]" />
</div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Naklejki die-cut (z ang. „cięcie matrycą") to naklejki wycięte dokładnie po obrysie grafiki - bez marginesu
            i bez prostokątnego tła. Ploter prowadzi ostrze wzdłuż konturu Twojego motywu, więc naklejka przybiera
            kształt sylwetki zwierzaka, zarysu logo czy nieregularnego rysunku. To ten szczegół sprawia, że naklejki
            wyglądają jak profesjonalny merch dopasowany na miarę, a nie jak seria etykiet w kwadratach.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Cały proces przygotowania konturu dzieje się w kreatorze. Wgrywasz gotowy plik - najlepiej PNG z
            przezroczystym tłem - a kreator automatycznie wykrywa kontur grafiki lub usuwa tło ze zdjęcia i wyznacza
            precyzyjną ścieżkę cięcia. Nie potrzebujesz Photoshopa ani umiejętności graficznych. Każdą naklejkę
            drukujemy w rozdzielczości 300 DPI na folii winylowej odpornej na wodę, promieniowanie UV i zadrapania.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Die-cut to nie to samo co kiss-cut. Przy die-cut naklejka i podkład są wycięte po obrysie, więc dostajesz
            pojedyncze naklejki w kształcie motywu. Kiss-cut tnie tylko folię i zostawia naklejki na całym prostokątnym
            arkuszu - wygodne przy masowym odklejaniu. Jeśli wahasz się między wariantami, sprawdź szczegółowe{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              różnice między die-cut a kiss-cut
            </Link>
            .
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja naklejek die-cut
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Parametry cięcia, materiału i warunki zamówienia w jednym miejscu - zanim wgrasz plik i zamówisz naklejki
            cięte po obrysie.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <tbody>
                {SPECS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""}
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
            Gdzie sprawdzają się naklejki die-cut
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Cięcie po obrysie sprawdza się wszędzie tam, gdzie kształt naklejki ma podkreślać grafikę - od wlepek dla
            twórców po brandowanie produktów. Oto najczęstsze pomysły klientów na naklejki die-cut.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
  <img src="/landing/naklejki-die-cut/naklejki-die-cut-na-laptopie.jpg" alt="Naklejki die-cut na pokrywie laptopa - grafiki wycięte po obrysie (fala, kot z lotosem, planeta) naklejone obok siebie." className="w-full h-auto [clip-path:inset(0_0_12%_0)]" />
</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40">
  <img src="/landing/naklejki-die-cut/naklejka-die-cut-z-logo-firmy-na-paczce.jpg" alt="Naklejka die-cut z logo firmy wycięta po konturze znaku, naklejona na kartonowej paczce z kraftu - brandowanie opakowań." className="w-full h-auto [clip-path:inset(0_0_12%_0)]" />
</div>
          </div>
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
                    <h3 className="text-base font-black text-foreground leading-snug">{uc.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{uc.text}</p>
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

        {/* Zalety */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego warto zamówić naklejki die-cut w MałeNaklejki
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative w-full aspect-square rounded-2xl shadow-sm border border-border/40 overflow-hidden flex items-start justify-center bg-black/5 dark:bg-[#003a3b]/40 my-6 max-w-md mx-auto">
  <img src="/landing/naklejki-die-cut/naklejka-die-cut-z-pupilem-na-kubku.png" alt="Personalizowana naklejka die-cut z pupilem - portret jamnika z imieniem wycięty po obrysie sylwetki, naklejony na białym kubku termicznym." className="w-full h-auto [clip-path:inset(0_0_12%_0)]" />
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
                    <h3 className="text-base font-black text-foreground leading-snug">{adv.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{adv.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak zamówić naklejki die-cut krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj gotowy plik lub zdjęcie",
                text: "Wgraj do kreatora plik PNG z przezroczystym tłem, grafikę JPG albo PDF. Masz rysunek na papierze? Wystarczy sfotografować go telefonem - jakość aparatu w smartfonie jest w zupełności wystarczająca.",
              },
              {
                title: "Wybierz cięcie po obrysie i ułóż arkusz",
                text: "Kreator sam wykryje kontur i wyznaczy ścieżkę cięcia. Wybierz cięcie po obrysie (die-cut), w koło lub prostokąt, ustaw rozmiar i rozmieść naklejki na arkuszu A4 - jedną dużą do 19 cm albo kilkanaście różnych kształtów.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj realistyczny podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a naklejki die-cut wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za stałe 49,00 zł brutto od arkusza A4.",
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
                  <h3 className="text-base font-black text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Chcesz przenieść na naklejkę własne zdjęcie wycięte po sylwetce? Zrób z niego{" "}
            <Link
              href="/fotonaklejki"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              fotonaklejkę ze zdjęcia
            </Link>
            . Naklejki die-cut drukujemy na tej samej{" "}
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
            Naklejki die-cut - najczęstsze pytania
          </h2>
          <div className="flex flex-col gap-3.5">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-border/70 dark:border-white/10 bg-white dark:bg-[#003a3b] open:bg-muted/40 dark:open:bg-white/[0.04] shadow-sm open:shadow-md transition-all duration-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden rounded-2xl">
                  <h3 className="text-sm sm:text-[15px] font-black text-foreground leading-snug">{faq.q}</h3>
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
            Zamów naklejki die-cut cięte po obrysie
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj plik do kreatora, pozwól mu wyznaczyć kontur i wybierz cięcie po obrysie. Naklejki die-cut będą
            gotowe w 2-3 dni robocze za stałe 49,00 zł brutto od arkusza A4 - na trwałej folii winylowej odpornej na
            wodę, UV i zadrapania, w dowolnym kształcie i bez minimalnego nakładu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shapes className="w-3.5 h-3.5 text-primary" /> Dowolny kształt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Folia winylowa 300 DPI
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
