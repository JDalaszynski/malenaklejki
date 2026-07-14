import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { Metadata } from "next";
import { Shield, Leaf, Heart, Zap, Award, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "O nas — MałeNaklejki | Polski producent naklejek z własnym nadrukiem",
  description:
    "Poznaj MałeNaklejki — polskiego producenta personalizowanych naklejek. Drukujemy na trwałej folii winylowej, bez minimalnego nakładu, z wysyłką w 3 dni robocze.",
  alternates: {
    canonical: "/o-nas",
  },
  openGraph: {
    title: "O nas — MałeNaklejki | Polski producent naklejek",
    description:
      "Poznaj MałeNaklejki — polskiego producenta personalizowanych naklejek. Drukujemy na trwałej folii winylowej, bez minimalnego nakładu.",
    url: "https://www.malenaklejki.pl/o-nas",
    type: "website",
  },
};

const VALUES = [
  {
    icon: Shield,
    title: "Jakość bez kompromisów",
    desc: "Drukujemy wyłącznie na trwałej folii winylowej ze wzmocnionym klejem. Nasze naklejki są wodoodporne, odporne na ścieranie i tłuszcze.",
  },
  {
    icon: Leaf,
    title: "Bez minimalnego nakładu",
    desc: "Zamawiasz dokładnie tyle, ile potrzebujesz — od jednego arkusza A4. Koniec z marnowaniem materiałów na tysiące zbędnych sztuk.",
  },
  {
    icon: Zap,
    title: "Szybkość realizacji",
    desc: "Każde zamówienie drukujemy i wysyłamy w ciągu 3 dni roboczych. Całość od projektu do paczki trwa zwykle mniej niż tydzień.",
  },
  {
    icon: Heart,
    title: "Prostota dla klienta",
    desc: "Nasz kreator online działa w przeglądarce — bez instalacji, bez rejestracji. Wgraj plik, ułóż naklejki i zamów w kilka minut.",
  },
  {
    icon: Award,
    title: "Technologia AI w cenie",
    desc: "Wbudowany generator AI tworzy unikalne wzory na podstawie Twojego opisu. Automatyczne usuwanie tła i inteligentne cięcie po obrysie — bez dodatkowych opłat.",
  },
  {
    icon: Users,
    title: "Dla każdego",
    desc: "Obsługujemy mikroprzedsiębiorstwa, artystów, rodziny i organizatorów imprez. Każdy, kto potrzebuje naklejek w małej ilości, znajdzie u nas rozwiązanie.",
  },
] as const;

export default function ONasPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MałeNaklejki",
          url: "https://www.malenaklejki.pl",
          logo: "https://www.malenaklejki.pl/images/logo/favicon.png",
          description:
            "MałeNaklejki to polski producent personalizowanych naklejek z własnym nadrukiem. Oferujemy druk na trwałej folii winylowej, cięcie po obrysie i zamówienia od 1 arkusza A4 — bez minimalnego nakładu.",
          foundingDate: "2024",
          areaServed: {
            "@type": "Country",
            name: "PL",
          },
          knowsAbout: [
            "Druk naklejek na folii winylowej",
            "Naklejki personalizowane z własnym nadrukiem",
            "Cięcie po obrysie (die cut)",
            "Etykiety samoprzylepne dla małych firm",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            url: "https://www.malenaklejki.pl/kontakt",
            availableLanguage: "Polish",
          },
          sameAs: [],
        }}
      />
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
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-heading">
            O nas — <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">MałeNaklejki</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
            Jesteśmy polskim producentem personalizowanych naklejek z własnym nadrukiem.
            Wierzymy, że każdy — od rodzica organizującego kuchnię, przez artystę tworzącego merch,
            po małą firmę brandującą opakowania — zasługuje na profesjonalne naklejki bez hurtowych
            minimalnych nakładów i skomplikowanych procesów.
          </p>
        </div>

        {/* Nasza historia */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Nasza historia i misja
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
            <p>
              MałeNaklejki powstało z prostej frustracji: zamawianie kilku naklejek w tradycyjnej
              drukarni oznaczało konieczność zamówienia setek lub tysięcy sztuk, długi czas oczekiwania
              i wysokie koszty przygotowalni. Postanowiliśmy to zmienić.
            </p>
            <p>
              Stworzyliśmy platformę, która pozwala każdemu — bez umiejętności graficznych i bez
              minimalnego zamówienia — zaprojektować i zamówić profesjonalne naklejki w kilka minut.
              Nasz kreator online działa bezpośrednio w przeglądarce: wgrywasz plik z telefonu
              lub komputera, a my drukujemy na trwałej folii winylowej i wycinamy naklejki idealnie
              po kształcie Twojej grafiki.
            </p>
            <p>
              Stała cena <strong className="text-foreground">49,00 zł za arkusz A4</strong> — niezależnie
              od liczby naklejek, ich kształtu i wzoru. Brak ukrytych kosztów, brak minimalnego nakładu.
              Realizacja i wysyłka w 3 dni robocze.
            </p>
          </div>
        </section>

        {/* Co nas wyróżnia */}
        <section className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading text-center">
            Co nas wyróżnia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 dark:border-white/10 bg-white dark:bg-[#003a3b] p-5 shadow-sm"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon aria-hidden className="w-5 h-5" />
                </span>
                <h3 className="text-sm font-black text-foreground">{title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm font-semibold leading-relaxed">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Ekspertyza (E-E-A-T) */}
        <section className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Nasza ekspertyza
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
            <p>
              Nasz zespół łączy doświadczenie w <strong className="text-foreground">druku cyfrowym</strong>,{" "}
              <strong className="text-foreground">rozwoju oprogramowania</strong> i{" "}
              <strong className="text-foreground">e-commerce</strong>. Dzięki temu kreator
              MałeNaklejki nie jest kolejnym formularzem zamówienia — to zaawansowane narzędzie webowe
              z automatycznym usuwaniem tła, generatorem AI, podglądem 3D i inteligentnym systemem
              rozmieszczania naklejek na arkuszu.
            </p>
            <p>
              Drukujemy na maszynach cyfrowych wysokiej klasy, używając najwyższej jakości folii
              winylowej z mocnym klejem. Każdy arkusz przechodzi kontrolę jakości przed wysyłką.
              Na naszym{" "}
              <Link href="/blog" className="text-primary font-bold underline underline-offset-4">
                blogu
              </Link>{" "}
              regularnie publikujemy poradniki o przygotowywaniu plików do druku, inspiracje
              na zastosowania naklejek i przewodniki dla małych firm.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Gotowy na własne naklejki?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base font-semibold max-w-lg mx-auto">
            Otwórz kreator i stwórz swój pierwszy arkusz — bez rejestracji, bez minimalnego zamówienia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-sm sm:text-base font-extrabold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl transition-all"
            >
              Otwórz kreator naklejek
            </Link>
            <Link
              href="/kontakt"
              className="text-primary hover:text-primary/80 text-sm font-extrabold underline underline-offset-4 transition-colors"
            >
              Skontaktuj się z nami
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
