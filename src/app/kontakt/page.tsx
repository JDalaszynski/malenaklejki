import { Header } from "@/components/layout/Header";
import { ContactForm } from "@/components/contact/ContactForm";
import Link from "next/link";

export const metadata = {
  title: "Kontakt - MałeNaklejki",
  description: "Skontaktuj się z nami! Odpowiemy na wszystkie Twoje pytania dotyczące zamówienia, kreatora naklejek lub opcji personalizacji.",
};

export default function KontaktPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-12 bg-gradient-to-r from-[#fdf2f8] via-[#f5f3ff] to-[#ecfeff] border-t border-border/60">
        <div className="max-w-5xl mx-auto flex flex-col items-center px-4 gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/regulamin" className="hover:underline">Regulamin</Link>
            <Link href="/polityka-prywatnosci" className="hover:underline">Polityka prywatności</Link>
            <Link href="/pliki-cookies" className="hover:underline">Pliki cookies</Link>
            <Link href="/kontakt" className="hover:underline">Kontakt</Link>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2">&copy; {new Date().getFullYear()} MałeNaklejki. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
