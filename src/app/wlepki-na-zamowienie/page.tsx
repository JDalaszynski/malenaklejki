import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Sticker,
  Users,
  Flag,
  Music,
  Building2,
  Layers3,
  Scissors,
  Package,
  Droplets,
  Hand,
  Receipt,
  Truck,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/wlepki-na-zamowienie";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Wlepki na zamówienie - vlepy z własnym nadrukiem od 49 zł",
  description:
    "Produkcja wlepek (vlepek) na zamówienie: pojedyncze sztuki cięte po obrysie, bez minimalnego nakładu. Stała cena 49,00 zł brutto za arkusz A4, druk 2-3 dni.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Wlepki na zamówienie - vlepy z własnym nadrukiem od 49 zł",
    description:
      "Druk wlepek i vlepek na zamówienie na trwałej folii winylowej. Pojedyncze sztuki cięte po obrysie, 49,00 zł brutto za arkusz A4, bez minimalnego nakładu.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/images/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "Kreator zestawu naklejek MałeNaklejki z arkuszem A4 pełnym naklejek wyciętych po obrysie - personalizowane naklejki od 1 sztuki.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wlepki na zamówienie - vlepy z własnym nadrukiem od 49 zł",
    description:
      "Produkcja wlepek na zamówienie: pojedyncze sztuki cięte po obrysie. Stała cena 49,00 zł brutto za arkusz A4, produkcja 2-3 dni robocze.",
    images: ["/images/og-main.jpg"],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Ile kosztuje produkcja wlepek na zamówienie?",
    a: "Stałe 49,00 zł brutto za cały zadrukowany arkusz A4, niezależnie od tego, ile wlepek i w jakim kształcie się na nim zmieści. Nie ma minimalnego nakładu ani opłaty za przygotowalnię, więc zapłacisz tyle samo za jeden arkusz testowy, co za kolejne zamówienie.",
  },
  {
    q: "Jak wygląda projekt vlepki - co muszę przygotować?",
    a: "Wystarczy gotowy plik graficzny w formacie PNG, JPG lub PDF, najlepiej z przezroczystym tłem. Nie masz własnej grafiki? Opisz pomysł w zewnętrznym narzędziu AI, takim jak ChatGPT, Gemini czy Midjourney, albo złóż prosty projekt w darmowej Canvie lub Wordzie. Gotowy plik wgrywasz do naszego kreatora arkusza, a on sam usuwa tło i wyznacza linię cięcia.",
  },
  {
    q: "Ile trwa druk wlepek i kiedy dostanę zamówienie?",
    a: "Wlepki produkujemy w 2-3 dni robocze od zaksięgowania wpłaty. Po zakończeniu produkcji przesyłka rusza do wybranego paczkomatu - koszt dostawy to 19,99 zł.",
  },
  {
    q: "Czy mogę zamówić tylko jeden wzór wlepki?",
    a: "Tak. Minimalne zamówienie to jeden arkusz A4, a to, ile różnych wzorów na nim umieścisz, zależy wyłącznie od Ciebie - od pojedynczej dużej wlepki po kilkadziesiąt małych sztuk.",
  },
  {
    q: "Czy wlepki są wodoodporne?",
    a: "Tak. Drukujemy na trwałej folii winylowej, odpornej na wodę, promieniowanie UV i zadrapania. Folia nie nadaje się jednak do zmywarki - jeśli naklejasz wlepkę na naczynie, myj je ręcznie.",
  },
  {
    q: "Czy wlepkę można przekleić w inne miejsce?",
    a: "Nie. Klej jest mocny i po odklejeniu nie zostawia śladów, ale nie jest to klej repozycjonowalny - raz przyklejonej wlepki nie przeniesiesz w inne miejsce. Powierzchnię pod wlepkę warto najpierw oczyścić i osuszyć.",
  },
  {
    q: "Wlepki na arkuszu czy pojedyncze sztuki - co wybrać do rozdawnictwa?",
    a: "Do rozdawania fanom, klientom czy uczestnikom eventu wybierz pojedyncze sztuki - każda wlepka jest docięta dokładnie do swojego kształtu i dostarczana luzem. Jeśli wolisz przechowywać cały zapas w jednym miejscu, zamów wlepki pozostawione na arkuszu A4 i odklejaj je na bieżąco.",
  },
  {
    q: "Czy zrobicie wlepki dla klubu, kibiców lub ekipy?",
    a: "Tak, to jedno z najczęstszych zastosowań. Wgraj herb, logo klubu lub hasło sekcji, a resztą zajmie się kreator. Więcej o tej niszy - w tym o rozmiarach i formach wykończenia pod sekcję kibicowską - znajdziesz w poradniku o wlepkach kibicowskich i klubowych.",
  },
  {
    q: "Czy wystawiacie fakturę VAT za produkcję wlepek?",
    a: "Tak, jesteśmy płatnikiem VAT i wystawiamy fakturę na dane z NIP. Płatność zrealizujesz BLIK-iem lub przez Przelewy24.",
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
    icon: Users,
    title: "Twórcy i fankluby internetowe",
    text: "Autorskie wzory do rozdania fanom, dołączenia do paczki z merchem albo sprzedaży obok innych gadżetów - bez zamawiania tysięcy sztuk jednego motywu.",
    href: "/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci",
    linkLabel: "Wlepki dla artystów i fanklubów",
  },
  {
    icon: Flag,
    title: "Kibice, sekcje i kluby sportowe",
    text: "Herb, barwy i hasło sekcji na pojedynczych wlepkach do rozdania przed wyjazdem albo na integrację ekipy amatorskiej.",
    href: "/blog/vlepki-kibicowskie-i-klubowe-wlepy-dla-kibicow-klubow-i-ekip",
    linkLabel: "Wlepki kibicowskie i klubowe",
  },
  {
    icon: Music,
    title: "Zespoły muzyczne i wydarzenia",
    text: "Logo zespołu albo grafika koncertowa jako wlepka dostępna na stoisku z merchem czy dołączona do biletu - szybki, tani gadżet pamiątkowy.",
  },
  {
    icon: Building2,
    title: "Firmy i e-commerce",
    text: "Wlepki z logo na paczki wysyłkowe budują unboxing experience bez kosztów przygotowalni typowych dla dużych nakładów.",
    href: "/naklejki-dla-firm",
    linkLabel: "Naklejki dla firm",
  },
  {
    icon: Layers3,
    title: "Testowanie nowego wzoru",
    text: "Zamów jeden arkusz testowy, sprawdź kolory i rozmiar na żywo, a dopiero potem domów większą partię dla całej ekipy czy sklepu.",
    href: "/blog/naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania",
    linkLabel: "Wlepki w małym nakładzie",
  },
  {
    icon: Package,
    title: "Prezenty i pamiątki okolicznościowe",
    text: "Zestaw wlepek z rocznicową grafiką albo wspólnym zdjęciem to tania, personalizowana pamiątka z eventu czy wyjazdu.",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Scissors,
    title: "Cięcie dokładnie po obrysie",
    text: "Wlepka przybiera kształt Twojej grafiki, a nie prostokąta - kreator sam wyznacza linię cięcia po wgraniu pliku.",
  },
  {
    icon: Package,
    title: "Pojedyncze sztuki albo arkusz",
    text: "Wybierasz formę wykończenia: wlepki docięte luzem do rozdania albo pozostawione razem na arkuszu A4 do wygodnego przechowywania.",
  },
  {
    icon: Droplets,
    title: "Trwała folia winylowa",
    text: "Druk na folii odpornej na wodę, promieniowanie UV i zadrapania - nie na papierze, który rozmięka od wilgoci czy potu.",
  },
  {
    icon: Hand,
    title: "Mocny klej, zero śladów",
    text: "Wlepka trzyma się pewnie na gładkich powierzchniach, a po odklejeniu nie zostawia kleju ani plam.",
  },
  {
    icon: Receipt,
    title: "Bez minimalnego nakładu",
    text: "Zamawiasz od 1 arkusza A4, bez progów ilościowych i bez dopłat za mały wolumen - jeden wzór albo kilkadziesiąt naraz w tej samej cenie.",
  },
  {
    icon: Truck,
    title: "Polska produkcja i szybki druk",
    text: "Drukujemy w Polsce w 2-3 dni robocze i wysyłamy do paczkomatu - bez czekania na przesyłkę zza granicy i bez przeliczania z euro.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Zastosowanie", value: "Wlepki i vlepki: merch, kibice, kluby, firmy, eventy" },
  { label: "Wykończenie", value: "Pojedyncze sztuki docięte po obrysie lub arkusz A4" },
  { label: "Kształt cięcia", value: "Die-cut po obrysie grafiki, koło lub prostokąt" },
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  { label: "Mycie", value: "Ręczne - folia NIE nadaje się do zmywarki" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Maks. wymiar jednej wlepki", value: "Do 19 cm" },
  { label: "Źródło grafiki", value: "Gotowy plik PNG, JPG lub PDF albo zdjęcie z telefonu" },
  { label: "Cena", value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu" },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka i płatność", value: "Paczkomat 19,99 zł; BLIK, Przelewy24, faktura VAT" },
];

export default function WlepkiNaZamowieniePage() {
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
              name: "Wlepki na zamówienie",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Wlepki (vlepki) na zamówienie z własnym nadrukiem",
          description:
            "Produkcja wlepek i vlepek na zamówienie: pojedyncze sztuki cięte po obrysie grafiki lub arkusz A4, druk na trwałej folii winylowej odpornej na wodę, UV i zadrapania. Stała cena 49,00 zł brutto za arkusz A4 bez minimalnego nakładu, produkcja 2-3 dni robocze i odbiór w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Wlepki na zamówienie",
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
          name: "Wlepki na zamówienie z własnym nadrukiem",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-08-31T00:00:00+02:00",
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
                Wlepki na zamówienie
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Sticker className="w-4 h-4" />
            Wlepki i vlepki na zamówienie
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Wlepki na zamówienie z własnym nadrukiem
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zamów <strong>produkcję wlepek</strong> (pisanych też jako{" "}
            <strong>vlepki</strong>) w pojedynczych sztukach ciętych dokładnie
            po obrysie Twojej grafiki, bez minimalnego nakładu. Wgraj gotowy
            projekt wlepki, a kreator sam usunie tło i wyznaczy linię cięcia.
            Druk na trwałej <strong>folii winylowej</strong>, stała cena{" "}
            <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 arkusza,
            produkcja w <strong>2-3 dni robocze</strong> i wysyłka do
            paczkomatu.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Zamów wlepki na zamówienie
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Poradnik: czym są wlepki
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 31
              sierpnia 2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "Pojedyncze sztuki", label: "Cięte po obrysie" },
            { value: "2-3 dni", label: "Produkcja robocza" },
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

        {/* Czym są / jak wygląda produkcja */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak wygląda produkcja wlepek na zamówienie krok po kroku
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Wlepka to niewielka naklejka wycięta po obrysie własnej grafiki,
            przeznaczona do rozdawania, a nie do jednorazowego użytku na jednej
            rzeczy - stąd nazwa funkcjonuje też fonetycznie jako{" "}
            <strong>vlepka</strong>. Jeśli szukasz szerszego wyjaśnienia tego
            pojęcia i pomysłów na wzory, zajrzyj do poradnika{" "}
            <Link
              href="/blog/wklepki-i-wlepy-z-wlasnym-nadrukiem-dla-artystow-i-spolecznosci"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              wlepki z własnym nadrukiem dla artystów i fanklubów
            </Link>
            . Tutaj skupiamy się na samym zamówieniu.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Cały proces produkcyjny mieści się w trzech krokach. Najpierw
            przygotowujesz projekt wlepki - gotowy plik graficzny albo obraz
            wygenerowany opisem tekstowym w zewnętrznym narzędziu AI (ChatGPT,
            Gemini, Midjourney). Potem wgrywasz go do kreatora arkusza, który
            automatycznie usuwa tło i wyznacza{" "}
            <Link
              href="/naklejki-die-cut"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              linię cięcia po obrysie
            </Link>
            . Na końcu wybierasz formę wykończenia - pojedyncze sztuki do
            rozdania albo komplet pozostawiony na arkuszu A4 - i zamawiasz.
            Druk trafia do produkcji od razu po opłaceniu.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Nie ma tu etapu wyceny ani czekania na ofertę od grafika - cena
            arkusza jest znana od razu i nie zmienia się od liczby wzorów czy
            skomplikowania kształtu.
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja druku wlepek na zamówienie
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Materiał, wykończenie i warunki zamówienia w jednym miejscu -
            zanim wgrasz projekt i ruszy produkcja.
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
            Dla kogo są wlepki na zamówienie
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Ten sam proces produkcyjny obsługuje bardzo różne potrzeby - od
            pojedynczego twórcy po firmę wysyłającą paczki.
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

        {/* Zalety */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego warto zamówić druk wlepek u nas
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
            Jak zamówić wlepki na zamówienie krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Przygotuj projekt wlepki",
                text: "Wygeneruj obraz w zewnętrznym narzędziu AI (ChatGPT, Gemini, Midjourney) na podstawie opisu tekstowego, złóż prostą grafikę w Canvie lub Wordzie, albo użyj gotowego zdjęcia czy logo. Zapisz plik jako PNG, JPG lub PDF.",
              },
              {
                title: "Wgraj plik i wybierz wykończenie",
                text: "W kreatorze arkusza wgrywasz plik wprost z telefonu - system usuwa tło i wyznacza linię cięcia po obrysie. Wybierz, czy wlepki mają być pojedynczymi sztukami do rozdania, czy zostać razem na arkuszu A4.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj podgląd gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a produkcję uruchomimy od razu. Wlepki wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za 19,99 zł.",
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
            Drukujemy na tej samej{" "}
            <Link
              href="/naklejki-foliowe"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              wodoodpornej folii winylowej
            </Link>
            , co pozostałe nasze naklejki, więc wlepka znosi deszcz i codzienne
            noszenie w plecaku, ale nie cykl w zmywarce.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Wlepki na zamówienie - najczęstsze pytania
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
            Zamów produkcję wlepek już od 1 arkusza
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj gotowy projekt do kreatora, wybierz pojedyncze sztuki lub
            arkusz A4 i zamów. Wlepki wyprodukujemy w 2-3 dni robocze na
            trwałej folii winylowej odpornej na wodę, UV i zadrapania - za
            stałe 49,00 zł brutto od arkusza, bez minimalnego nakładu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-primary" /> Cięcie po
              obrysie
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" /> Wodoodporna
              folia
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
