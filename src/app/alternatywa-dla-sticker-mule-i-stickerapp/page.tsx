import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  Truck,
  Wallet,
  Languages,
  Package,
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const PAGE_PATH = "/alternatywa-dla-sticker-mule-i-stickerapp";
const PAGE_URL = `https://www.malenaklejki.pl${PAGE_PATH}`;

export const metadata: Metadata = {
  title: "Polska alternatywa dla Sticker Mule i StickerApp",
  description:
    "Polska alternatywa dla Sticker Mule i StickerApp: drukuj naklejki już od 1 arkusza A4 za 49 zł, odbiór w paczkomacie w 3 dni robocze, bez cła i bariery językowej.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Polska alternatywa dla Sticker Mule i StickerApp",
    description:
      "Drukuj naklejki z własnym nadrukiem w polskiej drukarni: od 1 arkusza A4 za 49 zł, odbiór w paczkomacie w 3 dni, obsługa po polsku i płatność BLIK.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "/images/MałeNaklejki-Post-Instagram.jpg",
        width: 1200,
        height: 630,
        alt: "Polska alternatywa dla Sticker Mule i StickerApp - naklejki z własnym nadrukiem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Polska alternatywa dla Sticker Mule i StickerApp",
    description:
      "Naklejki z własnym nadrukiem od 1 arkusza A4 za 49 zł, odbiór w paczkomacie w 3 dni. Bez cła i bariery językowej.",
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
    q: "Jaka jest najlepsza polska alternatywa dla Sticker Mule?",
    a: "To malenaklejki.pl - w 100% polska drukarnia naklejek z własnym nadrukiem. Zamawiasz w złotówkach (stałe 49,00 zł za arkusz A4), bez minimalnego nakładu, z obsługą po polsku i odbiorem w paczkomacie w 3 dni robocze. Nie czekasz na przesyłkę zza granicy ani nie przeliczasz cen z dolarów.",
  },
  {
    q: "Czym malenaklejki.pl różni się od StickerApp?",
    a: "Główna różnica to lokalizacja i wygoda dla polskiego klienta: produkcja w Polsce, ceny w PLN zamiast w euro, polski kreator online, płatność BLIK oraz Przelewy24 i dostawa do paczkomatu bez zagranicznej wysyłki. Druk realizujemy już od pojedynczego arkusza A4, więc nie musisz zamawiać dużego pakietu, żeby zacząć.",
  },
  {
    q: "Czy mogę zamówić mniej naklejek niż w zagranicznych drukarniach?",
    a: "Tak. Nie mamy minimalnego nakładu - drukujemy już od 1 arkusza A4 za stałe 49,00 zł. Zagraniczne serwisy zwykle sprzedają w większych pakietach, więc u nas taniej przetestujesz jeden wzór albo zamówisz dokładnie tyle sztuk, ile realnie potrzebujesz.",
  },
  {
    q: "Ile kosztuje dostawa w porównaniu do Sticker Mule i StickerApp?",
    a: "Naklejki wysyłamy w Polsce z odbiorem w paczkomacie lub u kuriera, w 3 dni robocze. Zamawiając z zagranicy dopłacasz do międzynarodowej przesyłki, czekasz dłużej, a przy paczkach spoza Unii Europejskiej może dojść cło i VAT importowy. U polskiego producenta ten problem nie istnieje.",
  },
  {
    q: "Czy jakość jest porównywalna z zagranicznymi drukarniami?",
    a: "Tak. Drukujemy w rozdzielczości 300 DPI na grubej, wodoodpornej folii winylowej z mocnym klejem, odpornej na wodę, promieniowanie UV i zadrapania. Każdą naklejkę tniemy po obrysie (die-cut), więc przybiera kształt Twojej grafiki, a nie zwykłego kwadratu.",
  },
  {
    q: "Czy obsługa i kreator są po polsku?",
    a: "Tak. Cały kreator, proces zamówienia, płatności i kontakt z nami są w języku polskim, a zespół działa w tej samej strefie czasowej co Ty. Nie musisz tłumaczyć wiadomości ani rozszyfrowywać anglojęzycznego panelu, jak w zagranicznych serwisach.",
  },
];

const COMPARISON: { feature: string; us: string; them: string }[] = [
  {
    feature: "Waluta i cena",
    us: "PLN - stałe 49,00 zł za arkusz A4",
    them: "USD lub EUR - przeliczasz kurs waluty",
  },
  {
    feature: "Minimalne zamówienie",
    us: "Brak - drukujemy już od 1 arkusza A4",
    them: "Zazwyczaj większe pakiety (kilkadziesiąt sztuk i więcej)",
  },
  {
    feature: "Dostawa",
    us: "Paczkomat lub kurier w Polsce, 3 dni robocze",
    them: "Wysyłka z zagranicy - dłuższy czas oczekiwania",
  },
  {
    feature: "Cło i VAT importowy",
    us: "Nie dotyczy - produkcja w Polsce",
    them: "Możliwe przy przesyłkach spoza Unii Europejskiej",
  },
  {
    feature: "Język obsługi i kreatora",
    us: "Polski - kreator, zamówienie i kontakt",
    them: "Angielski - panel i komunikacja",
  },
  {
    feature: "Płatności",
    us: "BLIK, Przelewy24, przelew",
    them: "Karta międzynarodowa lub PayPal",
  },
];

const ADVANTAGES: { icon: React.ElementType; title: string; text: string }[] = [
  {
    icon: Wallet,
    title: "Stała cena 49 zł w złotówkach",
    text: "Płacisz za cały arkusz A4, bez przeliczania z dolarów czy euro. Im mniejsze naklejki, tym więcej zmieścisz na arkuszu i tym niższy koszt sztuki.",
  },
  {
    icon: Package,
    title: "Bez minimalnego nakładu",
    text: "Drukujemy już od 1 arkusza. Przetestujesz jeden wzór albo zamówisz dokładnie tyle, ile potrzebujesz - bez pakietów na kilkadziesiąt sztuk.",
  },
  {
    icon: Truck,
    title: "Paczkomat i wysyłka w 3 dni",
    text: "Odbierasz w paczkomacie lub u kuriera w Polsce. Bez zagranicznej przesyłki, długiego oczekiwania i ryzyka cła.",
  },
  {
    icon: Languages,
    title: "Wszystko po polsku",
    text: "Kreator, zamówienie, płatność BLIK i kontakt z zespołem w tej samej strefie czasowej. Zero bariery językowej.",
  },
  {
    icon: Sparkles,
    title: "Kreator, który robi robotę za Ciebie",
    text: "Wgraj zdjęcie z telefonu, a kreator sam usunie tło i wytnie naklejkę po kształcie. Nie masz grafiki? Opisz pomysł, a generator AI wygeneruje gotowy obraz.",
  },
  {
    icon: ShieldCheck,
    title: "Trwała, wodoodporna folia",
    text: "Druk 300 DPI na grubym winylu z mocnym klejem - odporny na wodę, UV i zadrapania. Po odklejeniu bez śladów na powierzchni.",
  },
];

export default function AlternatywaPage() {
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
              name: "Polska alternatywa dla Sticker Mule i StickerApp",
            },
          ],
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
              <span className="text-foreground font-extrabold">
                Polska alternatywa dla Sticker Mule i StickerApp
              </span>
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            W 100% polska produkcja
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
            Polska alternatywa dla Sticker Mule i StickerApp
          </h1>

          <p className="text-sm sm:text-lg text-foreground/90 font-semibold leading-relaxed">
            Szukasz miejsca, gdzie zamówisz <strong>naklejki z własnym nadrukiem</strong> jak w Sticker Mule
            czy StickerApp, ale bez zagranicznej wysyłki i płacenia w obcej walucie?{" "}
            <strong>malenaklejki.pl</strong> to polska drukarnia naklejek: drukujemy już od{" "}
            <strong>1 arkusza A4 za stałe 49,00 zł</strong>, tniemy po obrysie i wysyłamy do paczkomatu w{" "}
            <strong>3 dni robocze</strong>. Bez minimalnego nakładu, bez cła i bez bariery językowej. Jeśli
            zamawiasz po raz pierwszy, zacznij od przewodnika, jak zamówić{" "}
            <Link
              href="/blog/jak-zamowic-idealne-naklejki-na-zamowienie-z-wlasnym-nadrukiem"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              naklejki na zamówienie z własnym nadrukiem
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
              href="/blog/naklejki-maly-naklad-jak-zamowic-pojedyncze-sztuki-bez-przeplacania"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-border text-foreground text-sm sm:text-base font-bold rounded-2xl hover:border-primary hover:text-primary transition-all duration-300"
            >
              Jak zamówić mały nakład
            </Link>
          </div>
        </section>

        {/* Trust stats */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "49 zł", label: "Za arkusz A4" },
            { value: "od 1 szt.", label: "Bez min. nakładu" },
            { value: "3 dni", label: "Realizacja" },
            { value: "PLN + BLIK", label: "Płatność" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-1 bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 py-5 px-2 shadow-sm"
            >
              <span className="text-xl sm:text-2xl font-black text-primary">{stat.value}</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Comparison table */}
        <section className="mt-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            malenaklejki.pl a Sticker Mule i StickerApp - porównanie
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            Zagraniczne drukarnie naklejek robią świetną robotę, ale dla polskiego klienta wiążą się z
            walutą obcą, dłuższą wysyłką i obsługą po angielsku. Zestawienie najważniejszych różnic:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
            <table className="w-full border-collapse bg-white dark:bg-[#003a3b]/40 text-sm">
              <thead>
                <tr>
                  <th className="bg-[#edf6f2] dark:bg-[#002c2e] text-foreground font-black p-3 sm:p-4 text-left border-b border-border/60">
                    Cecha
                  </th>
                  <th className="bg-primary/10 text-primary font-black p-3 sm:p-4 text-left border-b border-border/60">
                    malenaklejki.pl (Polska)
                  </th>
                  <th className="bg-[#edf6f2] dark:bg-[#002c2e] text-foreground font-black p-3 sm:p-4 text-left border-b border-border/60">
                    Sticker Mule / StickerApp (zagranica)
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 1 ? "bg-[#edf6f2]/30 dark:bg-[#002c2e]/20" : ""}>
                    <td className="p-3 sm:p-4 border-b border-border/60 font-black text-foreground align-top">
                      {row.feature}
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-foreground/80 dark:text-[#a0d4c8] font-semibold align-top">
                      <span className="inline-flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={3} />
                        {row.us}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 border-b border-border/60 text-muted-foreground font-medium align-top">
                      <span className="inline-flex items-start gap-2">
                        <X className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" strokeWidth={3} />
                        {row.them}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
            Uwaga: cechy zagranicznych drukarni opisują ogólny model zamawiania z zagranicy do Polski i mogą
            się zmieniać - aktualne warunki (ceny, minimalne nakłady, czas dostawy) sprawdź bezpośrednio u
            danego dostawcy. Nazwy Sticker Mule i StickerApp należą do ich właścicieli i służą tu wyłącznie do
            porównania.
          </p>
        </section>

        {/* Advantages */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Dlaczego malenaklejki.pl to najlepsza polska alternatywa
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

        {/* How to order */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Jak zamówić naklejki w polskiej drukarni krok po kroku
          </h2>
          <ol className="space-y-4">
            {[
              {
                title: "Wgraj grafikę do kreatora",
                text: "Masz gotowe logo lub zdjęcie? Wgraj plik PNG, JPG albo PDF. Zwykłe zdjęcie z telefonu też wystarczy - sami usuniemy tło i wytniemy naklejkę po kształcie motywu. Nie masz grafiki? Opisz pomysł tekstem, a generator AI wygeneruje gotowy obraz.",
              },
              {
                title: "Wybierz kształt cięcia i rozmiar",
                text: "Zdecyduj o cięciu po obrysie, w koło albo w prostokąt, ustaw wymiary i liczbę sztuk na arkuszu A4. Kreator sam pilnuje, żeby naklejki na siebie nie nachodziły.",
              },
              {
                title: "Sprawdź podgląd 3D i zamów",
                text: "Obejrzyj realistyczny podgląd 3D gotowego arkusza, zapłać BLIK-iem lub przez Przelewy24, a naklejki wyślemy do paczkomatu w 3 dni robocze.",
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
            Przy grafikach z ostrymi szpicami najlepiej sprawdza się{" "}
            <Link
              href="/blog/co-to-jest-die-cut-i-kiss-cut-roznice-w-wyleciach-naklejek-reklamowych"
              className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              cięcie die-cut po obrysie
            </Link>{" "}
            - naklejka wygląda wtedy jak fabryczny element, a nie prostokątna doklejka z widocznym tłem.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
            Polska alternatywa dla zagranicznych drukarni - najczęstsze pytania
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
            Zamów naklejki w polskiej drukarni zamiast za granicą
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Wgraj grafikę do kreatora, wybierz cięcie po obrysie i liczbę sztuk na arkuszu. Naklejki będą
            gotowe w 3 dni robocze za stałe 49,00 zł od arkusza A4 - bez minimalnego nakładu, bez cła i bez
            przeliczania walut.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> Realizacja 3 dni
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" /> Paczkomat w Polsce
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Wodoodporna folia
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
