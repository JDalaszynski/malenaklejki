"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">

      {/* Hero success card */}
      <div className="w-full bg-card border border-border/70 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-8 py-10 text-center overflow-hidden border-b border-border/40">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-xl" />

          {/* Check icon */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/15 border-4 border-primary/30 mb-6 mx-auto shadow-[0_0_40px_rgba(169,228,215,0.3)]">
            <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={2} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Dziękujemy za zamówienie!
          </h1>
          <p className="text-muted-foreground font-medium text-base sm:text-lg max-w-md mx-auto">
            Twoje naklejki trafiły do produkcji. <br />Zabieramy się do realizacji!
          </p>
        </div>

        {/* Order number section */}
        {orderNumber && (
          <div className="px-8 py-6 border-b border-border/40">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
              Numer Twojego zamówienia
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-muted/20 border border-border/60 rounded-2xl px-6 py-3 flex items-center gap-4">
                <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-foreground">
                  {orderNumber}
                </span>
                <button
                  onClick={handleCopy}
                  title="Kopiuj numer zamówienia"
                  className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email confirmation note */}
        <div className="px-8 py-5 bg-muted/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Wysłaliśmy potwierdzenie na Twój adres e-mail ze szczegółami zamówienia.
          </p>
        </div>
      </div>



      {/* Estimated delivery */}
      <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-extrabold text-foreground text-base">Szacowany czas realizacji</p>
            <p className="text-muted-foreground text-sm font-medium mt-0.5">
              Produkcja i wysyłka: <strong className="text-foreground">3 dni roboczych</strong> od złożenia zamówienia i jego opłacenia.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          <Sparkles className="w-5 h-5" />
          Zamów więcej naklejek
        </Link>
        <Link
          href="/kontakt"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-card border border-border/70 text-foreground hover:bg-muted/30 h-14 px-8 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Kontakt
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Branding footer note */}
      <div className="mt-10 text-center animate-in fade-in duration-700 delay-300">
        <p className="text-xs text-muted-foreground font-medium">
          Dziękujemy, że wybrałeś{" "}
          <span className="font-extrabold text-foreground">MałeNaklejki</span>! 🩷
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="animate-pulse font-extrabold text-xl text-primary">
                Ładowanie…
              </div>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
