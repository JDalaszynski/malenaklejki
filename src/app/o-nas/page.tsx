import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Clock,
  FileText,
  HeartHandshake,
  Languages,
  Package,
  Rocket,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";

const PAGE_PATH = "/o-nas";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "O nas - MałeNaklejki, polska drukarnia naklejek",
  description:
    "Kim jesteśmy: polska drukarnia naklejek z własnym nadrukiem. Drukujemy od 1 arkusza A4 za 49,00 zł brutto na trwałej folii, produkcja 2-3 dni robocze.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "O nas - MałeNaklejki, polska drukarnia naklejek",
    description:
      "Polska drukarnia naklejek z własnym nadrukiem: od 1 arkusza A4 za 49,00 zł brutto, druk 300 DPI na folii winylowej, produkcja 2-3 dni robocze.",
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "O nas - MałeNaklejki, polska drukarnia naklejek",
    description:
      "Drukujemy naklejki z własnym nadrukiem od 1 arkusza A4 za 49,00 zł brutto. Polska produkcja, folia winylowa, realizacja 2-3 dni robocze.",
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Kto stoi za marką MałeNaklejki?",
    a: "MałeNaklejki to polski zespół drukujący naklejki z własnym nadrukiem na arkuszach A4 - Zespół Naklejkowni MałeNaklejki. Łączymy druk cyfrowy z własnym kreatorem online, w którym klient sam układa arkusz i od razu widzi podgląd 3D. Produkcja, obsługa i kontakt są w Polsce i po polsku.",
  },
  {
    q: "Czy naklejki są drukowane w Polsce?",
    a: "Tak, wszystkie zamówienia drukujemy i przygotowujemy w Polsce. Dzięki temu nie płacisz za przesyłkę z zagranicy, nie ryzykujesz cła przy paczkach spoza Unii Europejskiej i rozmawiasz z nami po polsku w tej samej strefie czasowej.",
  },
  {
    q: "Ile kosztują naklejki w MałeNaklejki?",
    a: "Jeden arkusz A4 z naklejkami kosztuje stałe 49,00 zł brutto, niezależnie od tego, czy zamawiasz jeden arkusz, czy kilkanaście. W cenie masz pełną personalizację grafiki i cięcie po obrysie (die-cut), bez dopłat za wykrojnik i przygotowanie pliku. Dostawa do paczkomatu to 19,99 zł.",
  },
  {
    q: "Czy jest minimalne zamówienie naklejek?",
    a: "Nie ma. Drukujemy już od 1 arkusza A4, więc możesz zamówić dokładnie tyle naklejek, ile realnie potrzebujesz. To główna różnica względem drukarni, które zaczynają rozmowę od kilkuset sztuk jednego wzoru.",
  },
  {
    q: "Jak długo trwa realizacja zamówienia?",
    a: "Produkcja zajmuje 2-3 dni robocze od zaksięgowania płatności. Po wydrukowaniu paczka trafia do paczkomatu, a Ty dostajesz numer przesyłki do śledzenia. Zamówienie składasz w kreatorze online w kilka minut, bez wymiany maili z grafikiem.",
  },
  {
    q: "Czy wystawiacie fakturę VAT dla firm?",
    a: "Tak, jesteśmy płatnikiem VAT i wystawiamy fakturę na dane firmy z numerem NIP. Cena 49,00 zł za arkusz A4 to kwota brutto, więc od razu wiesz, jaki będzie koszt zamówienia w budżecie marketingowym.",
  },
  {
    q: "Na jakim materiale drukujecie naklejki?",
    a: "Drukujemy w rozdzielczości 300 DPI na trwałej folii winylowej z mocnym klejem, który po odklejeniu nie zostawia śladów. Naklejki są odporne na wodę, promieniowanie UV i zadrapania. Nie nadają się natomiast do zmywarki - opakowania z takimi etykietami myj ręcznie.",
  },
  {
    q: "Czy muszę mieć gotowy projekt graficzny, żeby zamówić?",
    a: "Nie. Wystarczy zdjęcie z telefonu, logo lub plik PNG, JPG albo PDF - kreator usunie tło i wyznaczy linię cięcia po obrysie motywu. Jeśli nie masz żadnej grafiki, obraz wygenerujesz opisem tekstowym w narzędziach AI takich jak ChatGPT, Gemini czy Midjourney albo złożysz prostą kompozycję w Canvie lub Wordzie, a gotowy plik wgrasz do kreatora.",
  },
  {
    q: "Czy mogę zamówić jedną dużą naklejkę zamiast wielu małych?",
    a: "Tak. Na arkuszu A4 zmieścisz jedną dużą naklejkę o wymiarze do 19 cm albo kilkadziesiąt małych - orientacyjna liczba sztuk zależy od kształtu grafiki i odstępów. Możesz też mieszać rozmiary jednego wzoru w ramach tego samego arkusza.",
  },
  {
    q: "Jak skontaktować się z Zespołem MałeNaklejki?",
    a: "Najszybciej przez formularz kontaktowy na malenaklejki.pl w zakładce Kontakt. Odpowiadamy po polsku i pomagamy dobrać kształt cięcia, rozmiar naklejek oraz sprawdzić, czy plik nada się do druku w 300 DPI.",
  },
];

const BENEFITS: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Rocket,
    title: "Testujesz pomysł bez ryzyka finansowego",
    text: "Zamiast pudła z 500 identycznymi wlepkami zamawiasz jeden arkusz A4 za 49,00 zł brutto i sprawdzasz, jak wzór wygląda na produkcie, laptopie czy opakowaniu. Nowy motyw wypuszczasz wtedy, kiedy chcesz - bez minimalnego nakładu.",
  },
  {
    icon: ShieldCheck,
    title: "Naklejki wytrzymują codzienne użycie",
    text: "Drukujemy w 300 DPI na trwałej folii winylowej z mocnym klejem: odporne na wodę, promieniowanie UV i zadrapania, a po odklejeniu nie zostawiają śladów. Twoje logo nie schodzi po pierwszym przetarciu ściereczką.",
  },
  {
    icon: Clock,
    title: "Oszczędzasz czas na całym procesie",
    text: "Zamówienie składasz sam w kreatorze w kilka minut - bez briefu, bez wymiany dziesiątek maili i bez czekania na wycenę. Produkcję zamykamy w 2-3 dni robocze, a paczkę odbierasz w paczkomacie.",
  },
  {
    icon: Wallet,
    title: "Płacisz jedną, jawną cenę",
    text: "Stałe 49,00 zł brutto za arkusz A4 zawiera personalizację i precyzyjne cięcie po obrysie. Nie doliczamy opłat za wykrojnik ani za przygotowanie pliku do druku, a koszt dostawy do paczkomatu (19,99 zł) widzisz przed płatnością.",
  },
  {
    icon: Sparkles,
    title: "Nie potrzebujesz umiejętności graficznych",
    text: "Wgraj zdjęcie z telefonu, logo lub plik PDF - kreator sam usunie tło i wyznaczy linię cięcia wokół motywu. Nie masz grafiki? Wygeneruj obraz opisem tekstowym w ChatGPT, Gemini lub Midjourney i po prostu wgraj gotowy plik.",
  },
  {
    icon: HeartHandshake,
    title: "Rozmawiasz z ludźmi, nie z formularzem",
    text: "Jeśli plik jest zbyt małej rozdzielczości albo grafika ma cienkie szpice trudne do wycięcia, piszemy o tym przed drukiem. Odpowiadamy po polsku i pracujemy w tej samej strefie czasowej co Ty.",
  },
];

const SPEC: { feature: string; value: string }[] = [
  { feature: "Cena", value: "Stałe 49,00 zł brutto za arkusz A4" },
  {
    feature: "Minimalny nakład",
    value: "Brak - drukujemy już od 1 arkusza A4",
  },
  { feature: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { feature: "Rozdzielczość druku", value: "300 DPI (zalecana dla plików)" },
  { feature: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  {
    feature: "Cięcie",
    value: "Po obrysie (die-cut), kiss-cut, koło, prostokąt",
  },
  {
    feature: "Rozmiary na arkuszu",
    value: "Jedna duża naklejka do 19 cm albo kilkadziesiąt małych",
  },
  {
    feature: "Wykończenie",
    value: "Naklejki na arkuszu A4 lub pojedyncze sztuki docięte luzem",
  },
  { feature: "Produkcja", value: "2-3 dni robocze od zaksięgowania płatności" },
  { feature: "Dostawa", value: "Odbiór w paczkomacie, koszt 19,99 zł" },
  { feature: "Płatności", value: "BLIK, Przelewy24, zwykły przelew" },
  { feature: "Dokumenty", value: "Faktura VAT na dane firmy z numerem NIP" },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Wgrywasz grafikę do kreatora",
    text: "Logo, zdjęcie z telefonu, PNG, JPG albo PDF - kreator usuwa tło i wyznacza linię cięcia wokół motywu. Nie masz pliku? Wygeneruj obraz opisem tekstowym w narzędziach AI (ChatGPT, Gemini, Midjourney) lub złóż prostą kompozycję w Canvie.",
  },
  {
    title: "Układasz arkusz A4 pod swoje potrzeby",
    text: "Wybierasz kształt cięcia, ustawiasz wymiary i liczbę sztuk, a kreator pilnuje odstępów, żeby naklejki na siebie nie nachodziły. Podgląd 3D pokazuje, jak arkusz będzie wyglądał po wydruku.",
  },
  {
    title: "Płacisz i odbierasz paczkę",
    text: "Płatność BLIK-iem lub przez Przelewy24 zajmuje kilkanaście sekund. Zamówienie produkujemy w 2-3 dni robocze, pakujemy tak, żeby arkusz nie zginał się w transporcie, i wysyłamy do paczkomatu.",
  },
];

const NOT_OFFERED: string[] = [
  "Folii hologramowej, brokatowej i transparentnej - drukujemy wyłącznie na trwałej folii winylowej",
  "Folii do oklejania całych pojazdów (wrapping) i naklejek na tkaniny",
  "Naklejek repozycjonowalnych i wielokrotnego użytku - nasz klej trzyma mocno i odkleja się raz, bez śladów",
  "Rabatów hurtowych i progów ilościowych - cena to zawsze 49,00 zł brutto za arkusz, także przy większych zamówieniach",
  "Etykiet do zmywarki - naklejone opakowania i słoiki myj ręcznie",
];

export default function ONasPage() {
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
              name: "O nas",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "O nas - MałeNaklejki, polska drukarnia naklejek",
          url: PAGE_URL,
          inLanguage: "pl-PL",
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          about: { "@id": "https://www.malenaklejki.pl/#organization" },
          mainEntity: { "@id": "https://www.malenaklejki.pl/#organization" },
          dateModified: "2026-08-17T00:00:00+02:00",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://www.malenaklejki.pl/#organization",
          name: "MałeNaklejki",
          url: "https://www.malenaklejki.pl",
          logo: "https://www.malenaklejki.pl/images/logo/favicon.png",
          description:
            "MałeNaklejki to polska drukarnia naklejek z własnym nadrukiem. Drukujemy na trwałej folii winylowej w 300 DPI, bez minimalnego nakładu - już od 1 arkusza A4 za 49,00 zł brutto, z produkcją w 2-3 dni robocze.",
          areaServed: { "@type": "Country", name: "Polska" },
          knowsLanguage: "pl-PL",
          knowsAbout: [
            "druk naklejek z własnym nadrukiem",
            "naklejki die-cut cięte po obrysie",
            "naklejki na arkuszu A4",
            "etykiety na słoiki i opakowania",
            "naklejki z logo firmy",
          ],
          paymentAccepted: "BLIK, Przelewy24, przelew bankowy",
          sameAs: [
            "https://www.facebook.com/profile.php?id=61591604648504",
            "https://www.instagram.com/male_naklejki",
            "https://pl.pinterest.com/MaleNaklejki/",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            url: "https://www.malenaklejki.pl/kontakt",
            availableLanguage: "Polish",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki z własnym nadrukiem (arkusz A4)",
          description:
            "Naklejki z własnym nadrukiem drukowane w Polsce na trwałej folii winylowej w 300 DPI. Stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, produkcja 2-3 dni robocze.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Naklejki z własnym nadrukiem",
          offers: {
            "@type": "Offer",
            price: "49.00",
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            url: "https://www.malenaklejki.pl/",
            priceValidUntil: "2026-12-31",
            seller: { "@id": "https://www.malenaklejki.pl/#organization" },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
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
                  minValue: 2,
                  maxValue: 3,
                  unitCode: "d",
                },
              },
            },
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
              <span className="text-foreground font-extrabold">O nas</span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 17
              sierpnia 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            O nas - polska drukarnia naklejek MałeNaklejki
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            <strong>MałeNaklejki</strong> to polski zespół, który drukuje{" "}
            <strong>naklejki z własnym nadrukiem</strong> bez pytania o
            minimalny nakład. Realizujemy zamówienia już od{" "}
            <strong>1 arkusza A4 za stałe 49,00 zł brutto</strong>, na trwałej
            folii winylowej w <strong>300 DPI</strong>, z cięciem po obrysie i{" "}
            <strong>produkcją w 2-3 dni robocze</strong>. Zamówienie składasz
            sam w kreatorze online - bez briefu dla grafika, bez dopłaty za
            wykrojnik i bez tygodnia korespondencji z drukarnią.
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
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Napisz do nas
            </Link>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "2-3 dni", label: "Produkcja" },
            { value: "300 DPI", label: "Druk na winylu" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-1 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 py-5 px-2 shadow-sm"
            >
              <span className="text-xl sm:text-2xl font-black text-primary">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Mission / story */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego powstała Naklejkownia MałeNaklejki
          </h2>
          <p className="text-sm sm:text-base text-foreground/90 font-medium leading-relaxed">
            Klasyczna droga do własnych naklejek wyglądała tak: pytanie o
            wycenę, prośba o plik w krzywych, dopłata za wykrojnik i
            informacja, że opłaca się dopiero od kilkuset sztuk jednego wzoru.
            Mała firma, twórca albo rodzic potrzebujący etykiet do przedszkola
            odbijał się od tego progu, zanim cokolwiek zamówił.
          </p>
          <p className="text-sm sm:text-base text-foreground/90 font-medium leading-relaxed">
            Zbudowaliśmy więc coś odwrotnego: jednostką zamówienia jest u nas{" "}
            <strong>jeden arkusz A4</strong>, a wszystko, co dotąd wymagało
            grafika, robi kreator. Automatycznie usuwa tło ze wgranego obrazu,
            wyznacza linię cięcia po obrysie motywu, pilnuje spadów i odstępów
            na arkuszu oraz pokazuje realistyczny podgląd 3D, zanim zapłacisz.
            Ty decydujesz o kształcie, rozmiarze i liczbie sztuk - my
            odpowiadamy za druk i za to, żeby arkusz dotarł nieuszkodzony.
          </p>
          <p className="text-sm sm:text-base text-foreground/90 font-medium leading-relaxed">
            Drukujemy w Polsce, więc jesteśmy dla Ciebie także{" "}
            <Link
              href="/alternatywa-dla-sticker-mule-i-stickerapp"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              alternatywą dla zagranicznych drukarni naklejek
            </Link>{" "}
            - płacisz w złotówkach BLIK-iem, nie przeliczasz kursu waluty, nie
            czekasz na przesyłkę spoza kraju i nie ryzykujesz cła.
          </p>
        </section>

        {/* Benefits */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Co zyskujesz, zamawiając naklejki u nas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-foreground leading-snug">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {benefit.text}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Najczęściej trafiają do nas firmy brandujące opakowania, twórcy
            sprzedający własne wlepki i osoby, które chcą{" "}
            <Link
              href="/blog/naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              zamówić naklejki w małym nakładzie
            </Link>{" "}
            bez przepłacania za niewykorzystane sztuki.
          </p>
        </section>

        {/* Specification table */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak drukujemy naklejki - konkrety zamiast obietnic
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Zamiast haseł o najwyższej jakości podajemy parametry, które możesz
            sprawdzić na pierwszym arkuszu:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr>
                  <th className="bg-[#edf6f2] dark:bg-[#002c2e] text-foreground font-black p-3 sm:p-4 text-left border-b border-border/60">
                    Parametr
                  </th>
                  <th className="bg-primary/10 text-primary font-black p-3 sm:p-4 text-left border-b border-border/60">
                    malenaklejki.pl
                  </th>
                </tr>
              </thead>
              <tbody>
                {SPEC.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""
                    }
                  >
                    <td className="p-3 sm:p-4 border-b border-border/60 font-black text-foreground align-top">
                      {row.feature}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Jeśli zastanawiasz się, jak przygotować plik, żeby wydruk był ostry,
            zajrzyj do przewodnika o tym, na co zwrócić uwagę przy{" "}
            <Link
              href="/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              drukowaniu naklejek online
            </Link>
            .
          </p>
        </section>

        {/* How we work */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak realizujemy Twoje zamówienie krok po kroku
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
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Naklejki wycięte po obrysie wyglądają jak fabryczny element
            produktu, a nie doklejka z widocznym tłem - różnice między
            wykończeniami wyjaśniamy we wpisie o{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięciu die-cut i kiss-cut
            </Link>
            .
          </p>
        </section>

        {/* What we do not offer */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Czego u nas nie znajdziesz - mówimy wprost
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Wolimy powiedzieć wprost, czego nie robimy, niż tłumaczyć się po
            wydruku. Nie oferujemy:
          </p>
          <ul className="space-y-3">
            {NOT_OFFERED.map((item) => (
              <li
                key={item}
                className="flex gap-3 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 p-4 shadow-sm"
              >
                <Ban className="w-5 h-5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/85 font-semibold leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            MałeNaklejki - najczęstsze pytania o nas i o produkcję
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
            Sprawdź nas na jednym arkuszu naklejek
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Nie musisz nam wierzyć na słowo ani podpisywać umowy na duży nakład.
            Wgraj jedną grafikę, ułóż arkusz A4 i zamów go za 49,00 zł brutto -
            wyprodukujemy naklejki w 2-3 dni robocze i wyślemy do paczkomatu.
            Kolejny arkusz zamówisz dopiero wtedy, gdy jakość Cię przekona.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" /> Bez minimalnego
              nakładu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" /> Paczkomat w Polsce
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Faktura VAT na
              NIP
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-primary" /> Obsługa po
              polsku
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
