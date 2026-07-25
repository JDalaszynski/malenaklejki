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
import { HOME_FAQS } from "@/components/home/homeFaqData";

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
          mainEntity: HOME_FAQS.map((faq) => ({
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
