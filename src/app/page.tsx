import { getFeaturedPosts } from "@/lib/blog";
import { HomePageClient } from "./HomePageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrustBar } from "@/components/home/TrustBar";
import { UseCasesSection } from "@/components/home/UseCasesSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { PaymentsBar } from "@/components/home/PaymentsBar";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CreatorPowersSection } from "@/components/home/CreatorPowersSection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { LatestBlogPosts } from "@/components/blog/LatestBlogPosts";
import { SeoContentSection } from "@/components/home/SeoContentSection";

export default async function Home() {
  const featuredPosts = (await getFeaturedPosts(6)).map(post => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    readingTime: post.readingTime,
    image: post.image,
    tags: post.tags,
    pillar: post.pillar,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Personalizowane naklejki A4 wycinane po obrysie",
          description: "Wydrukuj swoje własne, personalizowane naklejki na arkuszach A4 w prosty i przyjemny sposób. Wytniemy je idealnie po kształcie Twoich grafik.",
          image: "https://www.malenaklejki.pl/images/logo/favicon.png",
          brand: {
            "@type": "Brand",
            name: "MałeNaklejki",
          },
          offers: {
            "@type": "Offer",
            url: "https://www.malenaklejki.pl",
            price: "49.00",
            priceCurrency: "PLN",
            availability: "https://schema.org/InStock",
            priceValidUntil: "2027-12-31",
            seller: {
              "@type": "Organization",
              name: "MałeNaklejki"
            }
          }
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Jakiej jakości pliki powinienem wgrać do kreatora?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Najlepsze rezultaty uzyskasz wgrywając pliki w formacie PNG lub JPG o rozdzielczości 300 DPI. Kreator automatycznie ocenia jakość grafiki i ostrzeże Cię komunikatem, jeśli rozdzielczość będzie zbyt niska (poniżej 100 DPI).",
              },
            },
            {
              "@type": "Question",
              name: "Co oznacza cięcie po konturze (obrysie)?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Nasze maszyny plotujące wytną naklejkę dokładnie wzdłuż krawędzi Twojego obrazka (z pominięciem przezroczystego tła). W kreatorze możesz wybrać opcję 'Kontur', aby zobaczyć podgląd linii cięcia naniesiony na Twoją grafikę.",
              },
            },
            {
              "@type": "Question",
              name: "Ile naklejek zmieści się na jednym arkuszu A4?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "To zależy od Ciebie! Możesz umieścić jedną ogromną naklejkę (do 19 cm szerokości) lub kilkadziesiąt mniejszych (np. o średnicy 3-4 cm). Nasz system automatycznie pilnuje, aby naklejki nie nakładały się na siebie.",
              },
            },
            {
              "@type": "Question",
              name: "Czy mogę edytować arkusz po dodaniu do koszyka?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Po dodaniu arkusza do koszyka kompozycja jest zapisywana i generowany jest plik produkcyjny. Wszelkie poprawki wymagają ponownego ułożenia arkusza, dlatego przed zatwierdzeniem upewnij się w podglądzie 2D/3D, że wszystko wygląda poprawnie.",
              },
            },
            {
              "@type": "Question",
              name: "Jaki jest czas realizacji i koszt dostawy?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Wszystkie zamówienia drukujemy i wysyłamy w ciągu 3 dni roboczych. Koszt dostawy wynosi 19,99 zł, a bezpieczną i szybką płatność realizujemy za pośrednictwem Przelewy24 (karta, BLIK, przelew).",
              },
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Jak zamówić naklejki z własnym nadrukiem online",
          description: "Stwórz własne naklejki na arkuszu A4 w 3 prostych krokach — od wgrania pliku do odbioru paczki.",
          totalTime: "PT5M",
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: "PLN",
            value: "49.00",
          },
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Dodaj i dostosuj grafiki",
              text: "Wgraj zdjęcia lub grafiki z telefonu albo komputera, lub stwórz je za pomocą wbudowanego generatora AI. Wybierz rozmiar każdej naklejki oraz jej linię cięcia (kontur, koło lub prostokąt).",
              image: "https://www.malenaklejki.pl/images/kroki/krok-1-dodaj-dostosuj-naklejki.png",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Rozmieść na arkuszu A4",
              text: "Układaj i przeciągaj naklejki na podglądzie arkusza. Inteligentny kreator dopilnuje, aby naklejki na siebie nie nachodziły i optymalnie wykorzystały miejsce.",
              image: "https://www.malenaklejki.pl/images/kroki/krok-2-rozmiesc-na-arkuszu-a4-naklejki.png",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Sprawdź w 3D i zamów",
              text: "Obejrzyj realistyczną wizualizację 3D gotowego arkusza, dodaj go do koszyka i sfinalizuj bezpieczne zamówienie za pomocą BLIK lub Przelewy24. Wysyłka w 3 dni robocze.",
              image: "https://www.malenaklejki.pl/images/kroki/krok-3-sprawdz-3d-i-zamow-naklejki.png",
            },
          ],
        }}
      />
      <HomePageClient>
        <section id="seo-marketing-section" className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 pt-10 sm:pt-14 pb-16 sm:pb-20">
          <TrustBar />
          <WhyUsSection />
          <PaymentsBar />
          <UseCasesSection />
          <HowItWorksSection />
          <PricingSection />
          <CreatorPowersSection />
          <FAQSection />
          <SeoContentSection />
          <FinalCTASection />
        </section>

        <LatestBlogPosts initialPosts={featuredPosts} />
      </HomePageClient>
    </>
  );
}
