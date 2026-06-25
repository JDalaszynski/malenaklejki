"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, CheckCircle2, Loader2, AlertCircle, Palette, Coins, Clock, Sparkles } from "lucide-react";
import { sendDesignInquiry } from "@/app/actions/contact";

const designSchema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail"),
  message: z.string().min(10, "Opis Twojego pomysłu musi mieć co najmniej 10 znaków"),
});

type DesignFormData = z.infer<typeof designSchema>;

export function ProjectOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DesignFormData>({
    resolver: zodResolver(designSchema),
  });

  const onSubmit = async (data: DesignFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await sendDesignInquiry(data);
      if (res.success) {
        setIsSuccess(true);
        reset();
      } else {
        setSubmitError(res.error || "Wystąpił błąd podczas wysyłania zapytania.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Nie udało się połączyć z serwerem. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-8">
      {/* Left Column: Service Details */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 order-2 lg:order-1">
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground leading-tight">
                  Twój pomysł, nasze wykonanie
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">Kompleksowe projektowanie graficzne naklejek</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Marzysz o naklejce, ale nie masz gotowego projektu ani umiejętności graficznych? Nasz zespół stworzy dla Ciebie unikalną grafikę na naklejkę od zera. Przygotujemy projekt w formie wektorowej, idealnie dopasowany do wydruku i wycięcia po obrysie.
            </p>

            {/* Features list */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">100% Oryginalny projekt</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Ilustracje, logo, grafika użytkowa - dostosowane do Twoich potrzeb.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">Poprawki w cenie</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Będziemy pracować nad projektem, dopóki nie będziesz w pełni zadowolony.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-secondary/15 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">Przejrzysta wycena</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Koszt usługi zależy od skomplikowania, z ceną startową już od 100 zł.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="mt-8 pt-6 border-t border-border/60 bg-gradient-to-br from-primary/5 to-secondary/5 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-[22px] flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Cena usługi</p>
              <p className="text-sm font-semibold text-muted-foreground">indywidualna wycena</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-muted-foreground mr-1">od</span>
              <span className="text-3xl font-black text-primary">100 zł</span>
            </div>
          </div>
        </div>

        {/* Czas odpowiedzi info */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 rounded-3xl p-6 shadow-sm">
          <h4 className="font-extrabold text-sm text-foreground mb-1">Jak to działa?</h4>
          <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
            Opisz nam w formularzu obok swój pomysł. W ciągu 24h otrzymasz od nas mailową wycenę oraz wstępne informacje. Po opłaceniu zamówienia nasz grafik przystąpi do pracy, a gotowy projekt prześlemy mailowo do użytku własnego.
          </p>
        </div>
      </div>

      {/* Right Column: Contact Form */}
      <div className="lg:col-span-7 flex flex-col order-1 lg:order-2">
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="design-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground">
                      Wyślij zapytanie o projekt
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Opisz krótko swój pomysł na naklejkę (np. logo dla warsztatu, ilustracja pieska, wesoły napis) i podaj e-mail, na który odeślemy wycenę.
                    </p>
                  </div>

                  {submitError && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-2xl flex items-start gap-2.5 text-sm font-semibold">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                      Twój adres e-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      disabled={isSubmitting}
                      {...register("email")}
                      className={`flex h-12 w-full rounded-xl border ${errors.email ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                        } bg-background px-4 py-2 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none`}
                      placeholder="np. jan.kowalski@gmail.com"
                    />
                    {errors.email && (
                      <p className="text-xs font-bold text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                      Wiadomość (Opis Twojego pomysłu)
                    </label>
                    <textarea
                      id="message"
                      rows={7}
                      disabled={isSubmitting}
                      {...register("message")}
                      className={`flex w-full rounded-xl border ${errors.message ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                        } bg-background px-4 py-3 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none resize-none`}
                      placeholder="Napisz, co ma przedstawiać naklejka, jaki ma mieć kształt, rozmiar oraz kolorystykę..."
                    />
                    {errors.message && (
                      <p className="text-xs font-bold text-destructive">{errors.message.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-6 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wysyłanie zapytania...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Wyślij zapytanie o wycenę
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center py-12 space-y-4 flex-grow my-auto"
              >
                <div className="w-16 h-16 bg-secondary/15 text-secondary rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-foreground">Zapytanie zostało wysłane!</h3>
                <p className="text-sm font-semibold text-muted-foreground max-w-sm leading-relaxed">
                  Otrzymaliśmy Twoją wiadomość z pomysłem na naklejkę. Przeanalizujemy ją i skontaktujemy się z Tobą pod adresem e-mail w ciągu 24 godzin z darmową wyceną.
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground h-10 px-6 transition-all cursor-pointer"
                >
                  Napisz kolejne zapytanie
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
