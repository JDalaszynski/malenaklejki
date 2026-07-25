import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Droplets,
  Sun,
  ShieldCheck,
  Printer,
  Sparkles,
  Truck,
  Package,
  Layers,
  Laptop,
  Bike,
  Car,
  FlaskConical,
  UtensilsCrossed,
  Clock,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/naklejki-foliowe";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Naklejki foliowe (winylowe) - wodoodporne, od 1 arkusza",
  description:
    "Naklejki foliowe z własnym nadrukiem na trwałej folii winylowej - odporne na wodę, UV i zadrapania, druk 300 DPI. Stała cena 49 zł brutto za arkusz A4, od 1 sztuki.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Naklejki foliowe i winylowe z własnym nadrukiem - wodoodporne",
    description:
      "Wodoodporne naklejki foliowe (winylowe) z własnym nadrukiem: trwała folia odporna na wodę, UV i zadrapania, druk 300 DPI, 49 zł brutto za arkusz A4, od 1 sztuki.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/landing/naklejki-foliowe/wodoodporne-naklejki-foliowe.png",
        width: 1200,
        height: 630,
        alt: "Wodoodporne naklejki foliowe i winylowe z własnym nadrukiem w MałeNaklejki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naklejki foliowe i winylowe z własnym nadrukiem - wodoodporne",
    description:
      "Trwała folia winylowa odporna na wodę, UV i zadrapania, druk 300 DPI. Stała cena 49 zł brutto za arkusz A4, od 1 sztuki.",
    images: ["/landing/naklejki-foliowe/wodoodporne-naklejki-foliowe.png"],
  },
};

/**
 * Pytania i odpowiedzi trzymamy w jednej tablicy, żeby widoczny FAQ i schemat
 * FAQPage (JSON-LD) były ZAWSZE identyczne. Odpowiedzi to czysty tekst - ten
 * sam string zasila render i schemat, więc nie da się ich rozjechać.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Czy naklejki foliowe są wodoodporne?",
    a: "Tak. Drukujemy na folii winylowej, która nie rozmoknie jak zwykły papier - jest odporna na wodę, zachlapanie i wilgoć. Dzięki temu wodoodporne naklejki foliowe sprawdzają się na bidonie, kubku, butelce czy laptopie, gdzie papierowa naklejka szybko by się rozpadła.",
  },
  {
    q: "Czym różnią się naklejki foliowe od winylowych?",
    a: "To ta sama rzecz - naklejki foliowe i winylowe to dwie nazwy tego samego produktu. Folia, na której drukujemy, to właśnie winyl: trwały materiał z mocnym klejem, odporny na wodę, promieniowanie UV i zadrapania. Nie oferujemy innych wariantów materiału (na przykład holograficznego czy brokatowego) - stawiamy na jedną, sprawdzoną folię winylową.",
  },
  {
    q: "Na jakie warunki odporna jest folia winylowa?",
    a: "Folia winylowa jest odporna na wodę, promieniowanie UV i zadrapania, więc znosi zachlapanie, słońce i codzienne ocieranie. Świetnie radzi sobie z przedmiotami narażonymi na wilgoć i intensywne użytkowanie - bidonem, kubkiem, laptopem czy sprzętem sportowym. Jeśli planujesz nietypowe, długotrwałe zastosowanie zewnętrzne, napisz do nas przed zamówieniem, a doradzimy.",
  },
  {
    q: "Jak trwała jest folia winylowa i czy mocno się trzyma?",
    a: "Naklejki foliowe drukujemy w rozdzielczości 300 DPI na grubej folii winylowej z mocnym klejem, który dobrze trzyma się na gładkich powierzchniach. Materiał jest odporny na wodę, UV i zadrapania, a mimo mocnego kleju po odklejeniu nie zostawia śladów na powierzchni.",
  },
  {
    q: "Czy naklejki foliowe można myć albo wkładać do zmywarki?",
    a: "Naklejki foliowe są odporne na wodę i zachlapanie, więc spokojnie przetrzesz je wilgotną ściereczką. Nie nadają się jednak do zmywarki - wysoka temperatura w połączeniu z detergentami może naruszyć klej i nadruk. Do mycia naczyń z naklejką używaj po prostu wody i gąbki, ręcznie.",
  },
  {
    q: "Ile kosztują naklejki foliowe z własnym nadrukiem?",
    a: "Obowiązuje stała cena 49,00 zł brutto za arkusz A4, niezależnie od liczby wzorów. Na jednym arkuszu zmieścisz jedną dużą naklejkę do 19 cm albo kilkadziesiąt mniejszych - im mniejsze naklejki, tym niższy koszt pojedynczej sztuki. Nie ma minimalnego nakładu ani opłat za przygotowanie pliku, więc drukujemy już od 1 arkusza.",
  },
  {
    q: "Czy folia zostawia ślady po odklejeniu?",
    a: "Nie. Mimo mocnego kleju naklejki foliowe odklejają się czysto i nie zostawiają śladów kleju na gładkich powierzchniach, takich jak laptop, szkło czy karton. Dzięki temu bez obaw oznaczysz sprzęt, który później zechcesz odkleić.",
  },
  {
    q: "Jak szybko zrealizujecie zamówienie naklejek foliowych?",
    a: "Naklejki foliowe produkujemy w 2-3 dni robocze, a gotowe zamówienie wysyłamy z odbiorem w paczkomacie. Całość - od wgrania grafiki po złożenie zamówienia - przechodzisz online w kreatorze, bez kontaktu z grafikiem.",
  },
  {
    q: "Jaki plik przygotować do druku naklejek na folii?",
    a: "Wgraj grafikę w formacie PDF, PNG lub JPG. Najlepiej sprawdza się plik na przezroczystym tle, ale zwykłe zdjęcie też zadziała - kreator sam usunie tło i wytnie naklejkę po obrysie. Nie masz gotowej grafiki? Opisz pomysł zwykłym tekstem, a wbudowany generator AI wygeneruje gotowy obraz, który wgrasz do kreatora jak własne zdjęcie.",
  },
  {
    q: "Czy tniecie naklejki foliowe po obrysie (die-cut)?",
    a: "Tak. Naklejki foliowe tniemy po obrysie (die-cut), w koło lub w prostokąt - wybierasz kształt w kreatorze. Jedna duża naklejka może mieć do 19 cm, a na arkuszu A4 zmieścisz też kilkadziesiąt mniejszych. Cięcie po obrysie sprawia, że naklejka przybiera kształt grafiki, a nie prostokąta z widocznym tłem.",
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
    icon: FlaskConical,
    title: "Butelki, słoiki i kosmetyki",
    text: "Etykiety odporne na wilgoć na butelki, słoiki i opakowania kosmetyków - nie rozmiękną od skroplin ani zachlapania.",
    href: "/blog/naklejki-z-wlasnym-logo-na-sloiki-i-opakowania",
    linkLabel: "Naklejki na słoiki i opakowania",
  },
  {
    icon: Laptop,
    title: "Laptop, telefon i sprzęt",
    text: "Naklejki na laptopa, obudowę telefonu czy sprzęt elektroniczny - odporne na zadrapania i codzienne ocieranie, bez śladów po odklejeniu.",
    href: "/blog/male-naklejki-na-laptopa-jak-wyrazic-siebie-i-stworzyc-wlasny-styl",
    linkLabel: "Małe naklejki na laptopa",
  },
  {
    icon: Bike,
    title: "Rower i sprzęt sportowy",
    text: "Wodoodporne naklejki na ramę roweru, kask, bidon i akcesoria sportowe - poradzą sobie z deszczem, potem i słońcem.",
    href: "/blog/naklejki-na-rower-i-akcesoria-sportowe-dla-pasjonatow",
    linkLabel: "Naklejki na rower i sport",
  },
  {
    icon: Car,
    title: "Motoryzacja i tuning",
    text: "Naklejki na szyby, kask, bańki i akcesoria motoryzacyjne - odporne na zachlapanie i promieniowanie UV.",
    href: "/blog/naklejki-motoryzacyjne-i-tuningowe-z-wlasnym-nadrukiem",
    linkLabel: "Naklejki motoryzacyjne i tuningowe",
  },
  {
    icon: UtensilsCrossed,
    title: "Kuchnia i domowe zapasy",
    text: "Naklejki na pojemniki, słoiki z przyprawami i butelki na nalewki - odporne na zachlapanie przy codziennym używaniu.",
    href: "/blog/naklejki-wlasnego-projektu-na-sloiki-z-przyprawami-zorganizuj-swoja-kuchnie",
    linkLabel: "Naklejki na słoiki z przyprawami",
  },
  {
    icon: Package,
    title: "Produkty i wysyłki",
    text: "Trwałe etykiety produktowe i plomby na paczki, które nie odklejają się od wilgoci w transporcie ani nie płowieją na wystawie.",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Droplets,
    title: "Wodoodporna folia winylowa",
    text: "Folia nie rozmoknie jak papier - naklejki foliowe są odporne na wodę, zachlapanie i wilgoć, więc sprawdzą się tam, gdzie zwykła naklejka by się rozpadła.",
  },
  {
    icon: Sun,
    title: "Odporność na promienie UV",
    text: "Kolory nie płowieją od słońca tak szybko jak na zwykłym papierze - nadruk na folii dłużej zachowuje wyrazistość przy kontakcie ze światłem.",
  },
  {
    icon: ShieldCheck,
    title: "Odporne na zadrapania, bez śladów",
    text: "Gruba folia znosi codzienne ocieranie i zadrapania, a mocny klej trzyma pewnie, ale po odklejeniu nie zostawia śladów na gładkiej powierzchni.",
  },
  {
    icon: Printer,
    title: "Druk 300 DPI w pełnym kolorze",
    text: "Drukujemy w rozdzielczości 300 DPI, więc logo, drobny tekst i przejścia kolorów wychodzą ostro i nasycone, bez pikselozy.",
  },
  {
    icon: Sparkles,
    title: "Kreator bez grafika",
    text: "Wgraj grafikę (PDF, PNG, JPG), a kreator sam usunie tło i wytnie naklejkę po kształcie. Nie masz pliku? Opisz pomysł, a generator AI wygeneruje gotowy obraz.",
  },
  {
    icon: Truck,
    title: "Produkcja w Polsce, paczkomat",
    text: "Naklejki foliowe produkujemy w 2-3 dni robocze i wysyłamy z odbiorem w paczkomacie. Wszystko po polsku, z płatnością BLIK i Przelewy24.",
  },
];

const SPECS: { label: string; value: string }[] = [
  { label: "Materiał", value: "Trwała folia winylowa (winyl) z mocnym klejem" },
  { label: "Odporność", value: "Woda, promieniowanie UV, zadrapania" },
  { label: "Druk", value: "300 DPI, pełny kolor" },
  { label: "Klej", value: "Mocny, nie zostawia śladów po odklejeniu" },
  { label: "Cięcie", value: "Po obrysie (die-cut), koło lub prostokąt" },
  { label: "Rozmiar", value: "Jedna duża naklejka do 19 cm lub kilkadziesiąt małych na arkuszu A4" },
  { label: "Wykończenie", value: "Na arkuszu A4 lub pojedyncze docięte sztuki" },
  { label: "Formaty pliku", value: "PDF, PNG, JPG" },
  { label: "Cena", value: "49,00 zł brutto za arkusz A4, bez minimalnego nakładu" },
  { label: "Produkcja", value: "2-3 dni robocze" },
  { label: "Wysyłka", value: "Odbiór w paczkomacie, dostawa 19,99 zł" },
  { label: "Płatność", value: "BLIK, Przelewy24, przelew" },
];

export default function NaklejkiFoliowePage() {
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
              name: "Naklejki foliowe",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Naklejki foliowe (winylowe) z własnym nadrukiem",
          description:
            "Wodoodporne naklejki foliowe drukowane na trwałej folii winylowej, odpornej na wodę, promieniowanie UV i zadrapania. Druk 300 DPI, stała cena 49,00 zł brutto za arkusz A4, bez minimalnego nakładu, z odbiorem w paczkomacie.",
          brand: {
            "@type": "Brand",
            name: "MałeNaklejki",
          },
          category: "Naklejki foliowe i winylowe z własnym nadrukiem",
          material: "Folia winylowa",
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Naklejki foliowe (winylowe) z własnym nadrukiem",
          url: PAGE_URL,
          dateModified: "2026-07-25T00:00:00+02:00",
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
              <span className="text-foreground font-extrabold">Naklejki foliowe</span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Droplets className="w-4 h-4" />
            Wodoodporna folia winylowa
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Naklejki foliowe i winylowe z własnym nadrukiem
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Zamów <strong>naklejki foliowe (winylowe)</strong> z własnym nadrukiem w polskiej drukarni: drukujemy
            na trwałej <strong>folii winylowej odpornej na wodę, UV i zadrapania</strong> w rozdzielczości{" "}
            <strong>300 DPI</strong>. Stała cena <strong>49,00 zł brutto za arkusz A4</strong>, już od 1 sztuki,
            produkcja w <strong>2-3 dni robocze</strong> i odbiór w paczkomacie. Zależy Ci, żeby nadruk nie
            rozmókł ani nie spłowiał? Sprawdź, na co zwrócić uwagę przy{" "}
            <Link
              href="/blog/drukowanie-naklejek-online-na-co-zwrocic-uwage-przed-wysylka-projektu"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              drukowaniu naklejek online
            </Link>
            .
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
              Cięcie die-cut po obrysie
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> W 100% polska produkcja
            </span>
            <span className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Ostatnia aktualizacja: 25 lipca 2026
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
            Czym są naklejki foliowe (winylowe)
          </h2>
          <img 
            src="/landing/naklejki-foliowe/wodoodporne-naklejki-foliowe.png" 
            alt="Wodoodporne naklejki foliowe na kasku motocyklowym zabezpieczone przed deszczem" 
            className="rounded-2xl shadow-sm border border-border/40 w-full mb-6 object-cover aspect-video" 
          />
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Naklejki foliowe i winylowe to ten sam produkt - drukujemy je na trwałej folii winylowej, a nie na
            zwykłym papierze. To właśnie folia decyduje o wodoodporności: nadruk nie rozmięknie od wody ani
            wilgoci i znosi codzienne ocieranie. Dlatego naklejki foliowe wybiera się wszędzie tam, gdzie zwykła
            papierowa naklejka szybko by się zniszczyła.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            W MałeNaklejki stawiamy na jeden, sprawdzony materiał - folię winylową z mocnym klejem, odporną na
            wodę, promieniowanie UV i zadrapania. Nie oferujemy wariantów holograficznych, transparentnych czy
            brokatowych, dzięki czemu za każdym razem wiesz dokładnie, jaką jakość dostajesz. Każdą naklejkę
            drukujemy w rozdzielczości 300 DPI i tniemy po obrysie, w koło lub w prostokąt.
          </p>
        </section>

        {/* Specyfikacja */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Specyfikacja naklejek foliowych
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Parametry folii winylowej i warunki zamówienia w jednym miejscu - materiał, odporność, druk i
            dostępne cięcia, zanim złożysz zamówienie.
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
            Gdzie sprawdzają się wodoodporne naklejki foliowe
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Odporność na wodę, UV i zadrapania sprawia, że naklejki foliowe trafiają na przedmioty codziennego
            użytku narażone na wilgoć, słońce i ocieranie - tam, gdzie papierowa naklejka nie przetrwałaby długo.
          </p>
          <img 
            src="/landing/naklejki-foliowe/naklejki-winylowe-na-bidon.png" 
            alt="Naklejki winylowe na bidonie kempingowym zroszonym wodą" 
            className="rounded-2xl shadow-sm border border-border/40 w-full my-6 object-cover aspect-video" 
          />
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
            Dlaczego warto wybrać naklejki na folii winylowej
          </h2>
          <img 
            src="/landing/naklejki-foliowe/naklejki-foliowe-na-laptopa.png" 
            alt="Odporne na UV naklejki foliowe na laptopie w pełnym, ostrym słońcu" 
            className="rounded-2xl shadow-sm border border-border/40 w-full my-6 object-cover aspect-[21/9]" 
          />
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
            Jak zamówić naklejki foliowe krok po kroku
          </h2>
          <img 
            src="/landing/naklejki-foliowe/trwale-naklejki-z-wlasnym-nadrukiem.png" 
            alt="Trwałe naklejki z własnym nadrukiem na grubej folii winylowej wyciętej po obrysie" 
            className="rounded-2xl shadow-sm border border-border/40 w-full mb-6 object-cover aspect-[21/9]" 
          />
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj grafikę lub wygeneruj ją AI",
                text: "Wgraj plik w formacie PDF, PNG lub JPG - zwykłe zdjęcie z telefonu też wystarczy, bo kreator sam usunie tło. Nie masz gotowej grafiki? Opisz pomysł tekstem, a generator AI wygeneruje obraz, który wgrasz jak własne zdjęcie.",
              },
              {
                title: "Wybierz cięcie, rozmiar i liczbę sztuk",
                text: "Zdecyduj o cięciu po obrysie, w koło albo w prostokąt, ustaw wymiary i ułóż naklejki na arkuszu A4. Jedna duża do 19 cm albo kilkadziesiąt mniejszych - kreator pilnuje, by na siebie nie nachodziły.",
              },
              {
                title: "Zamów i odbierz w paczkomacie",
                text: "Sprawdź podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a naklejki foliowe wyprodukujemy w 2-3 dni robocze i wyślemy do paczkomatu za stałe 49,00 zł brutto od arkusza A4.",
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
            Przy grafikach z ostrymi krawędziami i drobnym tekstem najlepiej sprawdza się{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięcie die-cut po obrysie
            </Link>{" "}
            - naklejka foliowa przybiera wtedy kształt Twojej grafiki, a nie prostokąta z widocznym tłem.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Naklejki foliowe - najczęstsze pytania
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
            Zamów wodoodporne naklejki foliowe
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj grafikę do kreatora, wybierz cięcie po obrysie i liczbę sztuk na arkuszu. Naklejki foliowe będą
            gotowe w 2-3 dni robocze za stałe 49,00 zł brutto od arkusza A4 - na trwałej folii winylowej odpornej
            na wodę, UV i zadrapania, bez minimalnego nakładu.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" /> Odporne na wodę
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

        {/* Zdjęcia osadzone z zachowaniem proporcji i altów SEO pod frazy foliowe/winylowe/wodoodporne */}
      </main>

      <Footer />
      <StickyCTAButton />
    </div>
  );
}
