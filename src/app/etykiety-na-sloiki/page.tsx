import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Tag,
  CookingPot,
  Sprout,
  Flame,
  Leaf,
  Wine,
  Droplets,
  Shapes,
  Printer,
  Layers,
  Truck,
  Receipt,
  Hand,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/etykiety-na-sloiki";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Etykiety na słoiki - własne napisy i naklejki od 49 zł",
  description:
    "Zamów etykiety na słoiki z własnym nadrukiem: wodoodporna folia winylowa, dowolny kształt i napisy. Stała cena 49,00 zł brutto za arkusz A4, już od 1 sztuki.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Etykiety na słoiki - własne napisy i naklejki od 49 zł",
    description:
      "Własne etykiety na słoiki, butelki i świece na trwałej folii winylowej odpornej na wodę i UV. 49,00 zł brutto za arkusz A4, bez minimalnego nakładu.",
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
    title: "Etykiety na słoiki - własne napisy i naklejki od 49 zł",
    description:
      "Etykiety na słoiki z własnym nadrukiem na wodoodpornej folii winylowej. Stała cena 49,00 zł brutto za arkusz A4, produkcja 2-3 dni robocze.",
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
    q: "Ile kosztują etykiety na słoiki?",
    a: "Arkusz A4 z etykietami kosztuje stałe 49,00 zł brutto, niezależnie od tego, ile etykiet na nim ułożysz i jaki mają kształt. Nie ma minimalnego nakładu ani opłaty za przygotowanie pliku, więc wydrukujesz nawet jeden arkusz na kilkanaście słoików. Im mniejsza pojedyncza etykieta, tym niższy koszt sztuki.",
  },
  {
    q: "Czy etykiety na słoiki są wodoodporne?",
    a: "Tak. Napisy na słoiki drukujemy na trwałej folii winylowej odpornej na wodę, promieniowanie UV i zadrapania, a nie na papierze. Etykieta nie rozmięknie od wilgoci w spiżarni ani od zachlapania przy przekładaniu przetworów.",
  },
  {
    q: "Czy słoik z etykietą można myć w zmywarce?",
    a: "Nie. Nasza folia winylowa nie nadaje się do zmywarki - wysoka temperatura i detergenty w cyklu zmywania mogą podważyć krawędzie etykiety. Słoik z naklejoną etykietą myj ręcznie, a naklejkę nakładaj na suchą i odtłuszczoną powierzchnię wystudzonego słoika.",
  },
  {
    q: "Ile etykiet zmieści się na jednym arkuszu A4?",
    a: "To zależy od kształtu i odstępów, ale orientacyjnie na arkuszu A4 ułożysz około 20 kwadratowych etykiet o boku 5 cm albo kilka dużych etykiet na wysokie słoiki. Kreator sam pilnuje, żeby naklejki na siebie nie nachodziły, a cena arkusza pozostaje ta sama.",
  },
  {
    q: "Jak zrobić własne etykiety na słoiki bez programu graficznego?",
    a: "Wystarczy gotowy obraz. Możesz wygenerować go w zewnętrznym narzędziu AI, takim jak ChatGPT, Gemini czy Midjourney, podając zwykły opis tekstowy, albo złożyć prostą grafikę w darmowej Canvie, Wordzie lub PowerPoincie. Gotowy plik PNG, JPG lub PDF wgrywasz do kreatora, a on usunie tło i wyznaczy linię cięcia - Photoshop nie jest potrzebny.",
  },
  {
    q: "Jakie napisy na słoiki warto umieścić na etykiecie?",
    a: "Na domowych przetworach sprawdza się nazwa zawartości, rok lub data zaprawienia i krótka notka o składzie, na przykład zawartość cukru albo ostrość marynaty. Manufaktury dodają zwykle logo, gramaturę, numer partii i dane kontaktowe. Zostaw na etykiecie trochę wolnego miejsca, jeśli chcesz dopisywać datę ręcznie.",
  },
  {
    q: "Czy zrobicie etykiety na świeczki i kosmetyki naturalne?",
    a: "Tak, ten sam arkusz A4 obsłuży etykiety na świeczki, mydła i kosmetyki naturalne małej manufaktury. Wodoodporna folia znosi kontakt z wilgocią w łazience, a druk 300 DPI utrzymuje czytelność drobnego tekstu ze składem. Zakres danych wymaganych prawem dla kosmetyków i żywności ustal z aktualnymi przepisami - my odpowiadamy za druk, nie za treść etykiety.",
  },
  {
    q: "Czy etykietę da się odkleić bez śladów?",
    a: "Tak. Używamy mocnego kleju, który trzyma pewnie, a po odklejeniu nie zostawia śladów ani resztek kleju na szkle. To nie są jednak naklejki wielokrotnego użytku - raz zdjętej etykiety nie nakleisz ponownie, więc na kolejny sezon przetworów wydrukuj nowy arkusz.",
  },
  {
    q: "Czy mogę zamówić kilka różnych wzorów etykiet na jednym arkuszu?",
    a: "Tak i to najczęstszy scenariusz przy przetworach. Na jednym arkuszu A4 ułożysz osobne etykiety na dżem, ogórki i kompot, każdą w innym kształcie i rozmiarze, w tej samej cenie 49,00 zł brutto. Każdy wzór zostanie wycięty osobno po swoim obrysie.",
  },
  {
    q: "Jak szybko zrealizujecie zamówienie i ile kosztuje dostawa?",
    a: "Etykiety na słoiki produkujemy w 2-3 dni robocze od opłacenia zamówienia, a przesyłkę odbierasz w paczkomacie za 19,99 zł. Płatność załatwisz BLIK-iem lub przez Przelewy24, a firmom wystawiamy fakturę VAT na dane z NIP.",
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
    icon: CookingPot,
    title: "Przetwory, weki i domowa spiżarnia",
    text: "Dżemy, ogórki, powidła i kompoty z czytelną nazwą i rokiem zaprawienia. Etykieta znosi wilgoć w piwnicy i nie odpada po kilku miesiącach na półce.",
    href: "/blog/etykiety-na-sloiki-do-przetworow-i-wekow",
    linkLabel: "Etykiety na przetwory krok po kroku",
  },
  {
    icon: Sprout,
    title: "Przyprawy i organizacja kuchni",
    text: "Jednolity zestaw małych etykiet na słoiczki z przyprawami porządkuje szafkę i pozwala znaleźć kmin rzymski bez odkręcania czterech pokrywek.",
    href: "/blog/naklejki-wlasnego-projektu-na-sloiki-z-przyprawami-zorganizuj-swoja-kuchnie",
    linkLabel: "Etykiety na słoiki z przyprawami",
  },
  {
    icon: Tag,
    title: "Manufaktura: miód, dżemy, konfitury",
    text: "Etykieta z logo, gramaturą i numerem partii robi z domowego wyrobu produkt gotowy na stoisko czy sklepik online - bez zamawiania tysiąca sztuk.",
    href: "/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania",
    linkLabel: "Naklejki z logo na słoiki i opakowania",
  },
  {
    icon: Flame,
    title: "Etykiety na świeczki sojowe",
    text: "Nazwa zapachu, czas palenia i logo pracowni na spodzie lub boku szkła. Folia winylowa nie faluje od wilgoci i zachowuje czytelność drobnego tekstu.",
  },
  {
    icon: Leaf,
    title: "Kosmetyki naturalne i etykiety ze składem",
    text: "Mydła, balsamy i olejki wymagają czytelnej listy składników. Druk 300 DPI utrzymuje ostrość drobnego tekstu nawet na małej, owalnej etykiecie.",
  },
  {
    icon: Wine,
    title: "Butelki, nalewki i prezenty",
    text: "Te same etykiety nakleisz na butelki z nalewką, oliwą czy syropem. Dobrze opisana butelka to gotowy prezent bez dodatkowego pakowania.",
    href: "/blog/naklejki-na-nalewki-domowe-jak-ozdobic-butelki-na-nalewki",
    linkLabel: "Naklejki na domowe nalewki",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Droplets,
    title: "Folia winylowa zamiast papieru",
    text: "Etykiety drukujemy na trwałej folii odpornej na wodę, UV i zadrapania. Nie rozmiękną w wilgotnej spiżarni ani przy przecieraniu słoika wilgotną ściereczką.",
  },
  {
    icon: Shapes,
    title: "Dowolny kształt etykiety",
    text: "Owal na dżem, koło na wieczko, prostokąt na wysoką butelkę albo cięcie dokładnie po obrysie grafiki - kształt dobierasz w kreatorze, cena zostaje ta sama.",
  },
  {
    icon: Layers,
    title: "Kilka wzorów na jednym arkuszu",
    text: "Nie musisz zamawiać osobnego nakładu na każdy smak. Na jednym A4 ułożysz etykiety na dżem, ogórki i kompot obok siebie, w różnych rozmiarach.",
  },
  {
    icon: Printer,
    title: "Czytelny druk 300 DPI",
    text: "Rozdzielczość 300 DPI utrzymuje ostrość drobnego tekstu - listy składników, gramatury czy numeru partii - nawet na etykiecie wielkości kciuka.",
  },
  {
    icon: Hand,
    title: "Mocny klej, zero śladów",
    text: "Etykieta trzyma się szkła pewnie, a po odklejeniu nie zostawia resztek kleju. Słoik możesz umyć i wykorzystać ponownie w kolejnym sezonie.",
  },
  {
    icon: Receipt,
    title: "Polska produkcja i faktura VAT",
    text: "Drukujemy w Polsce, rozliczamy w złotówkach i wystawiamy fakturę VAT na NIP. Bez przeliczania z euro, ceł i tygodni oczekiwania na przesyłkę z zagranicy.",
  },
];

const SPECS: { label: string; value: string }[] = [
  {
    label: "Zastosowanie",
    value: "Słoiki, weki, butelki, świece, kosmetyki, opakowania",
  },
  {
    label: "Kształt etykiety",
    value: "Koło, owal, prostokąt lub cięcie po obrysie grafiki (die-cut)",
  },
  { label: "Materiał", value: "Trwała folia winylowa z mocnym klejem" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  {
    label: "Mycie",
    value: "Ręczne - folia NIE nadaje się do zmywarki",
  },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  {
    label: "Rozmiar",
    value: "Od małych etykiet na przyprawy do jednej dużej do 19 cm",
  },
  {
    label: "Liczba etykiet",
    value: "Orientacyjnie ok. 20 sztuk o boku 5 cm na arkuszu A4",
  },
  {
    label: "Źródło grafiki",
    value: "Gotowy plik PNG, JPG lub PDF albo zdjęcie z telefonu",
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

export default function EtykietyNaSloikiPage() {
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
              name: "Etykiety na słoiki",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Etykiety na słoiki z własnym nadrukiem",
          description:
            "Personalizowane etykiety na słoiki, weki, butelki i świece drukowane na trwałej folii winylowej odpornej na wodę, UV i zadrapania. Dowolny kształt, druk 300 DPI, stała cena 49,00 zł brutto za arkusz A4 bez minimalnego nakładu, produkcja 2-3 dni robocze i odbiór w paczkomacie.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: { "@type": "Brand", name: "MałeNaklejki" },
          category: "Etykiety na słoiki i opakowania",
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
          name: "Etykiety na słoiki z własnym nadrukiem",
          url: PAGE_URL,
          isPartOf: { "@id": "https://www.malenaklejki.pl/#website" },
          dateModified: "2026-08-25T00:00:00+02:00",
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
                Etykiety na słoiki
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Tag className="w-4 h-4" />
            Etykiety i napisy na słoiki
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Etykiety na słoiki z własnym nadrukiem
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Wydrukuj <strong>etykiety na słoiki</strong> z własną nazwą,
            składem i datą na trwałej{" "}
            <strong>folii winylowej odpornej na wodę i UV</strong> - zamiast
            papierowych karteczek, które rozmiękają w spiżarni. Wgraj gotowy
            obraz, a kreator sam usunie tło i wytnie etykietę w kole, owalu,
            prostokącie albo dokładnie po obrysie grafiki. Druk{" "}
            <strong>300 DPI</strong>, stała cena{" "}
            <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 arkusza,
            produkcja w <strong>2-3 dni robocze</strong> i odbiór w paczkomacie.
            Jedno zastrzeżenie: folia <strong>nie nadaje się do zmywarki</strong>{" "}
            - opisany słoik myj ręcznie.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#02af7a] hover:bg-[#029668] text-white text-sm sm:text-base font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Zamów etykiety na słoiki
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/etykiety-na-sloiki-do-przetworow-i-wekow"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Poradnik: etykiety na przetwory
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 25
              sierpnia 2026
            </span>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Brutto za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "Wodoodporne", label: "Folia winylowa" },
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

        {/* Czym są */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Czym są etykiety na słoiki i jak zrobić własne napisy na słoiki
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Etykieta na słoik to po prostu naklejka z opisem zawartości: nazwą,
            datą zaprawienia, składem albo logo manufaktury. Różnica między nią
            a karteczką przyklejoną taśmą leży w materiale. Drukujemy na
            trwałej folii winylowej z mocnym klejem, odpornej na wodę,
            promieniowanie UV i zadrapania, więc opis przetrwa całą zimę w
            wilgotnej spiżarni i nie zwinie się na krawędziach.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Własne napisy na słoiki przygotujesz bez programów graficznych.
            Potrzebujesz jednego gotowego obrazu: możesz wygenerować go w
            zewnętrznym narzędziu AI (ChatGPT, Gemini, Midjourney) podając
            zwykły opis tekstowy, złożyć prostą grafikę w darmowej Canvie,
            Wordzie lub PowerPoincie albo po prostu sfotografować odręczny
            napis. Plik PNG, JPG lub PDF wgrywasz do kreatora arkusza wprost z
            telefonu - system usunie tło i wyznaczy linię cięcia.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            W kreatorze układasz cały arkusz A4: dobierasz rozmiar każdej
            etykiety, wybierasz kształt (koło na wieczko, owal na dżem,
            prostokąt na wysoką butelkę lub{" "}
            <Link
              href="/naklejki-die-cut"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięcie dokładnie po obrysie grafiki
            </Link>
            ) i rozmieszczasz obok siebie kilka różnych wzorów. Cena arkusza
            nie zmienia się od liczby wzorów, więc jednym zamówieniem obsłużysz
            dżem, ogórki i kompot naraz. Szczegółowy przepis na sezon
            przetworów znajdziesz we wpisie o{" "}
            <Link
              href="/blog/etykiety-na-sloiki-do-przetworow-i-wekow"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              etykietach na słoiki do przetworów i weków
            </Link>
            .
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja etykiet na słoiki i butelki
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Materiał, odporność i warunki zamówienia w jednym miejscu - zanim
            wgrasz plik i zamówisz własne etykiety.
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
            Gdzie sprawdzają się własne etykiety na słoiki i butelki
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Ten sam arkusz A4 obsługuje domową spiżarnię i małą produkcję. Oto
            sześć sytuacji, w których naklejki na słoiki personalizowane
            wygrywają z papierową karteczką.
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
            Prowadzisz sprzedaż i potrzebujesz etykiet z logo, numerem partii i
            faktury VAT do kosztów? Zajrzyj do oferty{" "}
            <Link
              href="/naklejki-dla-firm"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              naklejek dla firm
            </Link>
            . A jeśli słoik ma trafić na weselny stół, sprawdź{" "}
            <Link
              href="/blog/personalizowane-naklejki-na-alkohol-wyjatkowy-dodatek-na-wesela-i-imprezy"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              personalizowane naklejki na alkohol i butelki weselne
            </Link>
            .
          </p>
        </section>

        {/* Zalety */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego warto zamówić naklejki na słoiki personalizowane u nas
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
            Jak zamówić etykiety na słoiki krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Przygotuj gotowy obraz etykiety",
                text: "Wygeneruj grafikę w zewnętrznym narzędziu AI (ChatGPT, Gemini, Midjourney) na podstawie opisu tekstowego, złóż prostą etykietę w Canvie lub Wordzie albo sfotografuj odręczny napis. Zapisz plik jako PNG, JPG lub PDF - najlepiej w 300 DPI, żeby drobny tekst ze składem pozostał ostry.",
              },
              {
                title: "Wgraj plik i ułóż arkusz A4",
                text: "W kreatorze arkusza wgrywasz obraz wprost z telefonu, a system usuwa tło i wyznacza linię cięcia. Wybierz kształt etykiety - koło, owal, prostokąt lub cięcie po obrysie - ustaw rozmiar i rozmieść na arkuszu tyle wzorów, ile potrzebujesz na cały sezon przetworów.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj podgląd gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a etykiety wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za 19,99 zł. Arkusz A4 kosztuje stałe 49,00 zł brutto, niezależnie od liczby wzorów.",
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
            Etykiety naklejaj na suchy, odtłuszczony i wystudzony słoik -
            najlepiej po pasteryzacji, gdy szkło wróci do temperatury pokojowej.
            Drukujemy je na tej samej{" "}
            <Link
              href="/naklejki-foliowe"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              wodoodpornej folii winylowej
            </Link>
            , co pozostałe nasze naklejki, więc etykieta znosi wilgoć i
            przetarcie ściereczką, ale nie cykl w zmywarce.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Etykiety na słoiki - najczęstsze pytania
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
            Zamów własne etykiety na słoiki już od 1 arkusza
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj gotowy obraz do kreatora, ułóż etykiety na arkuszu A4 i
            wybierz kształt cięcia. Wydrukujemy je w 2-3 dni robocze na trwałej
            folii winylowej odpornej na wodę, UV i zadrapania - za stałe 49,00
            zł brutto od arkusza, bez minimalnego nakładu i bez opłat za
            przygotowanie pliku.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" /> Wodoodporna
              folia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shapes className="w-3.5 h-3.5 text-primary" /> Dowolny kształt
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
