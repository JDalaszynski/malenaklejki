"use client";

import { useEffect, Suspense } from "react";
import { useCartStore } from "@/store/cartStore";
import { Header } from "@/components/layout/Header";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
      <CheckCircle2 className="w-24 h-24 text-secondary mb-6" />
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Dziękujemy za zamówienie!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Twoja płatność przebiegła pomyślnie. Właśnie zabieramy się za przygotowanie Twoich naklejek.
      </p>
      
      {orderId && (
        <div className="bg-card border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">Numer Twojego zamówienia:</p>
          <p className="font-mono font-bold text-lg">{orderId}</p>
        </div>
      )}

      <p className="text-muted-foreground mb-8">
        Szczegóły zamówienia oraz potwierdzenie wysłaliśmy na Twój adres email.
      </p>

      <Link
        href="/"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
      >
        Wróć do sklepu
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<div className="p-16 text-center">Ładowanie...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
