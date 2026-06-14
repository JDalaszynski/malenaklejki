"use client";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Header } from "@/components/layout/Header";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header zen={true} />
      
      <main className="flex-1 flex flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dostawa i płatność</h1>
          <p className="text-muted-foreground mt-2 font-medium text-lg">Wypełnij poniższe dane, aby sfinalizować zamówienie.</p>
        </div>

        <CheckoutForm />
      </main>
    </div>
  );
}
