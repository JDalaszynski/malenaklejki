import { Header } from "@/components/layout/Header";
import { ProjectOrderForm } from "@/components/contact/ProjectOrderForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Zamów Projekt Naklejki - MałeNaklejki",
  description: "Zaprojektujemy dla Ciebie idealną grafikę na naklejkę według Twojego pomysłu! Indywidualne projekty, profesjonalny grafik, cena już od 100 zł. Skontaktuj się z nami!",
  alternates: {
    canonical: "/zamow-projekt",
  },
};

export default function ZamowProjektPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e]">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
        {/* Page Title & Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Zamów Projekt Naklejki
          </h1>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Potrzebujesz profesjonalnie zaprojektowanej grafiki na swoje wlepki lub etykiety? Przekształcimy Twój pomysł w gotowy do druku projekt!
          </p>
        </div>

        {/* Info & Form Component */}
        <ProjectOrderForm />
      </main>

      <Footer />
    </div>
  );
}
