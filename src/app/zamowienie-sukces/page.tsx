"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getOrderStatus, retryOrderPayment } from "@/app/actions/createOrder";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumberParam = searchParams.get("orderNumber");
  const orderId = searchParams.get("orderId");
  const paymentMethodParam = searchParams.get("paymentMethod");

  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "failed">(
    (paymentMethodParam === "przelew" || paymentMethodParam === "vinted") ? "success" : "loading"
  );
  const [orderNumber, setOrderNumber] = useState<string | null>(orderNumberParam);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [isPrzelew, setIsPrzelew] = useState(paymentMethodParam === "przelew");
  const [isVinted, setIsVinted] = useState(paymentMethodParam === "vinted");

  const pollCountRef = useRef(0);
  const maxPolls = 6; // up to 12 seconds total checking

  useEffect(() => {
    if (paymentMethodParam === "przelew" || paymentMethodParam === "vinted") {
      if (orderId) {
        getOrderStatus(orderId).then((res) => {
          if (res && res.success) {
            if (res.total) setOrderTotal(res.total);
            if (res.orderNumber) setOrderNumber(res.orderNumber);
          }
        });
      }
      return;
    }

    if (!orderId) {
      // Jeśli brak ID zamówienia w URL (np. stare zamówienia), domyślnie pokazujemy sukces
      setPaymentStatus("success");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await getOrderStatus(orderId);
        if (res && res.success) {
          if (res.orderNumber) setOrderNumber(res.orderNumber);
          if (res.total) setOrderTotal(res.total);

          if (res.paymentMethod === "przelew") {
            setIsPrzelew(true);
            setPaymentStatus("success");
            if (intervalId) clearInterval(intervalId);
            return;
          }

          if (res.paymentMethod === "vinted") {
            setIsVinted(true);
            setPaymentStatus("success");
            if (intervalId) clearInterval(intervalId);
            return;
          }

          if (res.status === "PAID") {
            setPaymentStatus("success");
            if (intervalId) clearInterval(intervalId);
            return;
          } else if (res.status === "PAYMENT_FAILED") {
            setPaymentStatus("failed");
            if (intervalId) clearInterval(intervalId);
            return;
          }
        }
      } catch (err) {
        console.error("Błąd podczas sprawdzania statusu:", err);
      }

      pollCountRef.current += 1;
      if (pollCountRef.current >= maxPolls) {
        // Jeśli po określonym czasie status to nadal PENDING_PAYMENT,
        // to pozwalamy klientowi spróbować ponownie (pokazujemy failure/retry screen)
        setPaymentStatus("failed");
        clearInterval(intervalId);
      }
    };

    // Pierwsze sprawdzenie natychmiast
    checkStatus();

    // Odpytywanie bazy co 2 sekundy w poszukiwaniu statusu PAID lub FAILURE z webhooka
    intervalId = setInterval(checkStatus, 2000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, paymentMethodParam]);

  const handleCopy = () => {
    const num = orderNumber || orderNumberParam;
    if (num) {
      navigator.clipboard.writeText(num).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await retryOrderPayment(orderId);
      if (res && res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setRetryError(res?.error || "Nie udało się wygenerować nowej płatności. Spróbuj ponownie.");
        setRetrying(false);
      }
    } catch (err: any) {
      setRetryError(err.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      setRetrying(false);
    }
  };

  // 1. Loading UI
  if (paymentStatus === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full text-center">
        <div className="bg-card border border-border/70 rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2 animate-pulse">
            Weryfikujemy płatność…
          </h2>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Oczekujemy na potwierdzenie transakcji z systemu Przelewy24. Może to potrwać chwilę. Proszę nie zamykać tej karty.
          </p>
        </div>
      </div>
    );
  }

  // 2. Failed / Retry UI
  if (paymentStatus === "failed") {
    return (
      <div className="flex-1 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Failed payment card */}
        <div className="w-full bg-card border border-amber-200/70 dark:border-amber-900/40 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Amber header */}
          <div className="relative bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent px-8 py-10 text-center overflow-hidden border-b border-border/40">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-500/5 blur-xl" />

            {/* Alert icon */}
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/15 border-4 border-amber-500/30 mb-6 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-500" strokeWidth={2} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Płatność nie została sfinalizowana
            </h1>
            <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-md mx-auto">
              Nie otrzymaliśmy jeszcze potwierdzenia płatności. Możesz bezpiecznie spróbować opłacić to samo zamówienie ponownie poniżej.
            </p>
          </div>

          {/* Order info */}
          <div className="px-8 py-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Numer Twojego zamówienia
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xl sm:text-2xl tracking-widest text-foreground">
                  {orderNumber || orderNumberParam}
                </span>
                <button
                  onClick={handleCopy}
                  title="Kopiuj numer zamówienia"
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {orderTotal > 0 && (
              <div className="text-left sm:text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Kwota do zapłaty
                </p>
                <span className="font-black text-xl sm:text-2xl text-foreground">
                  {orderTotal.toFixed(2).replace('.', ',')} zł
                </span>
              </div>
            )}
          </div>

          {/* Action details */}
          <div className="px-8 py-6 bg-muted/10">
            <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">Co się stało?</h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Przelew lub BLIK mógł zostać anulowany, odrzucony przez bank lub sesja płatności wygasła w Przelewy24. Twoje zamówienie jest bezpiecznie zapisane w naszej bazie. Nie musisz ponownie projektować i tworzyć koszyka — skontaktuj się z nami w celu dokończenia transakcji.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 max-w-sm mx-auto">
          <Link
            href="/kontakt"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer"
          >
            Kontakt z obsługą
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Success UI
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
            {isPrzelew ? (
              <>
                Dane do płatności przelewem wysłaliśmy na Twój e-mail.<br />
                Po zaksięgowaniu wpłaty przystąpimy do realizacji zamówienia.
              </>
            ) : isVinted ? (
              <>
                Dedykowany link do płatności przez Vinted wysłaliśmy na Twój e-mail.<br />
                Po zakupieniu oferty na Vinted przystąpimy do realizacji zamówienia.
              </>
            ) : (
              <>
                Twoje naklejki trafiły do produkcji. <br />Zabieramy się do realizacji!
              </>
            )}
          </p>
        </div>

        {/* Order number section */}
        {(orderNumber || orderNumberParam) && (
          <div className="px-8 py-6 border-b border-border/40">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
              Numer Twojego zamówienia
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-muted/20 border border-border/60 rounded-2xl px-6 py-3 flex items-center gap-4">
                <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-foreground">
                  {orderNumber || orderNumberParam}
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
            {isPrzelew ? (
              "Szczegóły zamówienia oraz dane do przelewu znajdziesz w swojej skrzynce e-mail."
            ) : isVinted ? (
              "Szczegóły zamówienia oraz instrukcję zakupu na Vinted wysłaliśmy na Twój adres e-mail."
            ) : (
              "Wysłaliśmy potwierdzenie na Twój adres e-mail ze szczegółami zamówienia."
            )}
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
            <p className="font-extrabold text-foreground text-base">
              {isPrzelew ? "Czas realizacji po zaksięgowaniu wpłaty" : isVinted ? "Czas realizacji po zakupie" : "Szacowany czas realizacji"}
            </p>
            <p className="text-muted-foreground text-sm font-medium mt-0.5">
              {isPrzelew ? (
                <>
                  Produkcja i wysyłka: <strong className="text-foreground">3 dni robocze</strong> od zaksięgowania przelewu na konto.
                </>
              ) : isVinted ? (
                <>
                  Produkcja i wysyłka: <strong className="text-foreground">3 dni robocze</strong> od zakupu oferty na Vinted.
                </>
              ) : (
                <>
                  Produkcja i wysyłka: <strong className="text-foreground">3 dni roboczych</strong> od złożenia zamówienia i jego opłacenia.
                </>
              )}
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
          fallback = {
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
