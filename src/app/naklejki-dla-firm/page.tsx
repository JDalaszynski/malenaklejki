import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  FileText,
  Wallet,
  Package,
  Truck,
  ShieldCheck,
  Sparkles,
  Tag,
  Wrench,
  Gift,
  Boxes,
  Layers,
  Clock,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/naklejki-dla-firm";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Naklejki dla firm z logo - faktura VAT, od 1 arkusza",
  description:
    "Naklejki dla firm z własnym logo w polskiej drukarni: stała cena 49 zł brutto za arkusz A4, faktura VAT, bez minimalnego nakładu, odbiór w paczkomacie w 2-3 dni.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Naklejki dla firm z własnym logo - druk od 1 arkusza A4",
    description:
      "Naklejki firmowe z logo: stała cena 49 zł brutto za arkusz A4, faktura VAT, bez minimalnego nakładu, trwała folia winylowa i odbiór w paczkomacie.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/images/MałeNaklejki-Post-Instagram.jpg",
        width: 1200,
        height: 630,
        alt: "Naklejki dla firm z własnym logo - druk na zamówienie w MałeNaklejki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naklejki dla firm z własnym logo - druk od 1 arkusza A4",
    description:
      "Naklejki firmowe z logo: 49 zł brutto za arkusz A4, faktura VAT, bez minimalnego nakładu, odbiór w paczkomacie w 2-3 dni.",
    images: ["/images/MałeNaklejki-Post-Instagram.jpg"],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Czy wystawiacie fakturę VAT za naklejki dla firmy?",
    a: "Tak. Do każdego zamówienia firmowego wystawiamy fakturę VAT na dane z numerem NIP. Cena 49,00 zł za arkusz A4 to kwota brutto, więc od razu widzisz pełny koszt zakupu do rozliczenia w firmie.",
  },
  {
    q: "Ile kosztują naklejki z logo dla firmy?",
    a: "Obowiązuje stała cena 49,00 zł brutto za arkusz A4, niezależnie od liczby wzorów na arkuszu. Zmieścisz na nim jedną dużą naklejkę do 19 cm albo kilkadziesiąt mniejszych - im mniejsze naklejki, tym niższy koszt pojedynczej sztuki. Nie pobieramy opłat za przygotowanie pliku do druku.",
  },
  {
    q: "Czy jest minimalne zamówienie? Mogę zamówić mało naklejek?",
    a: "Nie ma minimalnego nakładu. Drukujemy już od 1 arkusza A4, więc firma zamawia dokładnie tyle naklejek, ile potrzebuje. Możesz najpierw przetestować jeden wzór, a większe zamówienie złożyć dopiero, gdy będziesz zadowolony z efektu.",
  },
  {
    q: "Jak przygotować plik z logo do druku?",
    a: "Wgraj logo w formacie PDF, PNG lub JPG do kreatora. Najlepiej sprawdza się grafika na przezroczystym tle, ale zwykłe zdjęcie też zadziała - kreator sam usunie tło i wytnie naklejkę po obrysie. Nie masz gotowej grafiki? Opisz pomysł tekstem, a wbudowany generator AI wygeneruje gotowy obraz.",
  },
  {
    q: "Na czym drukujecie naklejki firmowe i czy są trwałe?",
    a: "Drukujemy w rozdzielczości 300 DPI na trwałej folii winylowej z mocnym klejem, odpornej na wodę, promieniowanie UV i zadrapania. Naklejki sprawdzają się na produktach, opakowaniach i sprzęcie, a po odklejeniu nie zostawiają śladów na powierzchni.",
  },
  {
    q: "Jak szybko zrealizujecie zamówienie dla firmy?",
    a: "Zamówienie produkujemy w 2-3 dni robocze, a gotowe naklejki wysyłamy z odbiorem w paczkomacie. Cały proces - od wgrania logo po złożenie zamówienia - przechodzisz online w kreatorze, bez kontaktu z grafikiem.",
  },
  {
    q: "Jaki rozmiar mogą mieć naklejki firmowe?",
    a: "Na jednym arkuszu A4 zmieścisz jedną dużą naklejkę do 19 cm albo kilkadziesiąt mniejszych. Rozmiar każdej naklejki ustawiasz samodzielnie w kreatorze, układając grafiki na arkuszu tak, aby się nie nachodziły.",
  },
  {
    q: "Jaki plik z logo najlepiej wgrać do druku?",
    a: "Najlepszy jest plik z logo na przezroczystym tle w formacie PNG lub PDF - naklejka zostanie wtedy wycięta dokładnie po kształcie znaku. Przyjmujemy też JPG i zwykłe zdjęcia, bo kreator sam usunie tło. Gdy nie masz gotowej grafiki, generator AI stworzy obraz na podstawie opisu tekstowego.",
  },
  {
    q: "Jak zapłacić za zamówienie firmowe i dostać fakturę?",
    a: "Zapłacisz BLIK-iem, przez Przelewy24 lub zwykłym przelewem. W trakcie zamówienia podajesz dane firmy z numerem NIP, a my wystawiamy fakturę VAT na pełną kwotę zakupu.",
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
    icon: Tag,
    title: "Branding produktów i logo",
    text: "Naklejki z logo firmy na produkty, torby i materiały - spójne oznaczenie marki bez kosztów przygotowalni.",
    href: "/blog/naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty",
    linkLabel: "Jak brandować produkty logo",
  },
  {
    icon: Package,
    title: "Etykiety i opakowania",
    text: "Etykiety ze składem, naklejki na słoiki i butelki oraz plomby na paczki, które budują efekt unboxingu.",
    href: "/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania",
    linkLabel: "Naklejki na słoiki i opakowania",
  },
  {
    icon: Wrench,
    title: "Naklejki serwisowe",
    text: "Trwałe naklejki typu \"serwisowane przez\" z numerem telefonu i datą przeglądu, naklejane na urządzeniach klientów.",
    href: "/blog/naklejki-serwisowe-dla-firm-hydraulicy-elektrycy-i-instalatorzy",
    linkLabel: "Naklejki serwisowe dla firm",
  },
  {
    icon: Gift,
    title: "Eventy i welcome packi",
    text: "Wlepki do zestawów powitalnych dla pracowników, gadżety na konferencje i szkolenia budujące employer branding.",
    href: "/blog/naklejki-firmowe-na-eventy-welcome-pack-dla-pracownikow",
    linkLabel: "Naklejki na eventy firmowe",
  },
  {
    icon: Boxes,
    title: "Znakowanie sprzętu i wnętrz",
    text: "Oznaczenia sprzętu firmowego, identyfikatory i naklejki organizacyjne na trwałej folii z mocnym klejem.",
  },
  {
    icon: Layers,
    title: "Testy wzorów i małe serie",
    text: "Bez minimalnego nakładu przetestujesz nowy wzór już od 1 arkusza, zanim zamówisz większą serię.",
    href: "/blog/naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania",
    linkLabel: "Jak zamówić mały nakład",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: FileText,
    title: "Faktura VAT dla firm",
    text: "Do zamówienia firmowego wystawiamy fakturę VAT na dane z NIP. Cena 49,00 zł to kwota brutto - pełny koszt widzisz od razu.",
  },
  {
    icon: Wallet,
    title: "Stała cena 49 zł brutto",
    text: "Płacisz za cały arkusz A4, niezależnie od liczby wzorów. Im mniejsze naklejki, tym więcej zmieścisz i tym niższy koszt sztuki.",
  },
  {
    icon: Package,
    title: "Bez minimalnego nakładu",
    text: "Drukujemy już od 1 arkusza. Zamów dokładnie tyle, ile potrzebujesz, albo przetestuj jeden wzór - bez pakietów na tysiące sztuk.",
  },
  {
    icon: ShieldCheck,
    title: "Trwała folia winylowa",
    text: "Druk 300 DPI na grubym winylu z mocnym klejem - odporny na wodę, UV i zadrapania. Po odklejeniu bez śladów na powierzchni.",
  },
  {
    icon: Sparkles,
    title: "Kreator bez grafika",
    text: "Wgraj logo (PDF, PNG, JPG), a kreator sam usunie tło i wytnie naklejkę po kształcie. Nie masz grafiki? Opisz pomysł, a generator AI wygeneruje obraz.",
  },
  {
    icon: Truck,
    title: "Produkcja w Polsce, paczkomat",
    text: "Naklejki produkujemy w 2-3 dni robocze i wysyłamy z odbiorem w paczkomacie. Wszystko po polsku, z płatnością BLIK i Przelewy24.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  { label: "Cięcie", value: "Po obrysie (die-cut), koło lub prostokąt" },
  { label: "Rozmiar", value: "Jedna duża naklejka do 19 cm lub kilkadziesiąt małych na arkuszu A4" },
  { label: "Wykończenie", value: "Na arkuszu A4 lub pojedyncze docięte sztuki" },
  { label: "Formaty pliku", value: "PDF, PNG, JPG" },
  { label: "Cena", value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu" },
  { label: "Faktura", value: "VAT na dane z numerem NIP" },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka", value: "Odbiór w paczkomacie, dostawa 19,99 zł" },
  { label: "Płatność", value: "BLIK, Przelewy24, przelew" },
];

export default function NaklejkiDlaFirmPage() {
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
              name: "Naklejki dla firm",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki dla firm z własnym logo",
          description:
            "Naklejki firmowe z własnym logo drukowane na trwałej folii winylowej. Stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, z fakturą VAT i odbiorem w paczkomacie.",
          brand: {
            "@type": "Brand",
            name: "MałeNaklejki",
          },
          category: "Naklejki firmowe z logo",
          offers: {
            "@type": "Offer",
            price: "49.00",
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            url: PAGE_URL,
            priceValidUntil: "2026-12-31",
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
              <span className="text-foreground font-extrabold">Naklejki dla firm</span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <FileText className="w-4 h-4" />
            Dla firm - z fakturą VAT
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Naklejki dla firm z własnym logo
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zamów <strong>naklejki firmowe z logo</strong> w polskiej drukarni: drukujemy już od{" "}
            <strong>1 arkusza A4 za stałe 49,00 zł brutto</strong>, wystawiamy <strong>fakturę VAT</strong> i
            wysyłamy z odbiorem w paczkomacie w <strong>2-3 dni robocze</strong>. Bez minimalnego nakładu i bez
            opłat za przygotowanie pliku. Jeśli zamawiasz po raz pierwszy, sprawdź, jak skutecznie{" "}
            <Link
              href="/blog/naklejka-z-logo-firmy-jak-skutecznie-brandowac-swoje-produkty"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              brandować produkty naklejką z logo firmy
            </Link>
            .
          </p>

          <div id="first-article-banner" className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Otwórz kreator naklejek
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Naklejki na opakowania
            </Link>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "2-3 dni", label: "Produkcja" },
            { value: "Faktura VAT", label: "Dla firm z NIP" },
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

        {/* Use cases */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Do czego firmy zamawiają naklejki z logo
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Od brandingu produktów po znakowanie sprzętu - naklejki firmowe z własnym nadrukiem sprawdzają się
            wszędzie tam, gdzie liczy się spójny wizerunek marki bez dużych nakładów i długiego oczekiwania.
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

        {/* Advantages */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego firmy zamawiają naklejki w MałeNaklejki
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
                    <h3 className="text-base font-black text-foreground leading-snug">{adv.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{adv.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja naklejek dla firm
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Parametry, które firma powinna znać przed zamówieniem naklejek z logo - materiał, druk, dostępne
            cięcia oraz warunki zamówienia w jednym miejscu.
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

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak zamówić naklejki dla firmy krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj logo lub grafikę",
                text: "Wgraj logo w formacie PDF, PNG lub JPG. Zwykłe zdjęcie z telefonu też wystarczy - kreator sam usunie tło i wytnie naklejkę po kształcie. Nie masz grafiki? Opisz pomysł tekstem, a generator AI wygeneruje gotowy obraz.",
              },
              {
                title: "Wybierz cięcie, rozmiar i liczbę sztuk",
                text: "Zdecyduj o cięciu po obrysie, w koło albo w prostokąt, ustaw wymiary i ułóż naklejki na arkuszu A4. Jedna duża do 19 cm albo kilkadziesiąt mniejszych - kreator pilnuje, by na siebie nie nachodziły.",
              },
              {
                title: "Zamów z fakturą VAT",
                text: "Sprawdź podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, podaj dane do faktury VAT z NIP, a naklejki wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu.",
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
            Przy logotypach z ostrymi krawędziami najlepiej sprawdza się{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięcie die-cut po obrysie
            </Link>{" "}
            - naklejka przybiera kształt logo, a nie prostokąta z widocznym tłem.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki firmowe z logo - najczęstsze pytania
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
            Zamów naklejki z logo dla swojej firmy
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj logo do kreatora, wybierz cięcie po obrysie i liczbę sztuk na arkuszu. Naklejki będą gotowe w
            2-3 dni robocze za stałe 49,00 zł brutto od arkusza A4 - z fakturą VAT, bez minimalnego nakładu i
            bez opłat za przygotowanie pliku.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Faktura VAT
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Produkcja 2-3 dni
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Trwała folia winylowa
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

        {/* Uwaga: sekcja na zdjęcia. Folder: /public/landing/naklejki-dla-firm/.
            Po wgraniu grafik przez właściciela osadzić je tu z altami SEO i obrandować
            (analogicznie do obsługi zdjęć w blog-agent). */}
      </main>

      <Footer />
      <StickyCTAButton />
    </div>
  );
}
