import { Header } from "@/components/layout/Header";
import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Kontakt - MałeNaklejki",
  description: "Skontaktuj się z nami! Odpowiemy na wszystkie Twoje pytania dotyczące zamówienia, kreatora naklejek lub opcji personalizacji.",
};

export default function KontaktPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
        {/* Page Title & Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Skontaktuj się z nami
          </h1>
          <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
            Masz pytania dotyczące Kreatora, Generatora AI, technicznych kwestii wydruku lub chcesz złożyć nietypowe zamówienie? Jesteśmy do Twojej dyspozycji!
          </p>
        </div>

        {/* Contact Form & Info Columns */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
