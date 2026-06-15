"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Building2, Send, CheckCircle2, Loader2, AlertCircle, MapPin } from "lucide-react";
import { sendContactMessage } from "@/app/actions/contact";

const contactSchema = z.object({
  name: z.string().min(3, "Imię i nazwisko musi mieć co najmniej 3 znaki"),
  email: z.string().email("Podaj poprawny adres e-mail"),
  subject: z.string().min(5, "Temat musi mieć co najmniej 5 znaków"),
  message: z.string().min(10, "Wiadomość musi mieć co najmniej 10 znaków"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await sendContactMessage(data);
      if (res.success) {
        setIsSuccess(true);
        reset();
      } else {
        setSubmitError(res.error || "Wystąpił błąd podczas wysyłania wiadomości.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Nie udało się połączyć z serwerem. Spróbuj ponownie później.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Contact Cards */}
      <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-foreground">
            Dane kontaktowe
          </h3>

          <div className="space-y-4">
            {/* Email Card */}
            <motion.a
              href="mailto:kontakt@malenaklejki.pl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Napisz do nas</p>
                <p className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">kontakt@malenaklejki.pl</p>
              </div>
            </motion.a>

            {/* Phone Card */}
            <motion.a
              href="tel:695527166"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Zadzwoń do nas</p>
                <p className="text-base font-extrabold text-foreground group-hover:text-secondary transition-colors">695 527 166</p>
              </div>
            </motion.a>

            {/* Address Card */}
            <div className="flex items-start gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Siedziba firmy</p>
                <p className="text-sm font-extrabold text-foreground leading-snug">
                  ul. Geodetów 41<br />
                  64-100 Trzebiny
                </p>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="flex items-start gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent-foreground flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">Dane rejestrowe</p>
                <p className="text-sm font-extrabold text-foreground">Jakub Dalaszyński</p>
                <div className="text-xs font-semibold text-muted-foreground space-y-0.5">
                  <p>NIP: 6972414844</p>
                  <p>REGON: 544772342</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Card */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 rounded-3xl p-6 shadow-sm">
          <h4 className="font-extrabold text-sm text-foreground mb-2">Czas odpowiedzi</h4>
          <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
            Na wszystkie pytania przesłane przez formularz kontaktowy lub bezpośrednio na adres e-mail staramy się odpowiedzieć w ciągu <strong>24 godzin</strong> (w dni robocze).
          </p>
        </div>
      </div>

      {/* Right Column: Contact Form */}
      <div className="lg:col-span-7 order-1 lg:order-2">
        <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground">
                    Napisz wiadomość
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Masz pytania dotyczące zamówienia, kreatora naklejek lub potrzebujesz niestandardowego formatu? Skontaktuj się z nami!
                  </p>
                </div>

                {submitError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-2xl flex items-start gap-2.5 text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    id="name"
                    disabled={isSubmitting}
                    {...register("name")}
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.name ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                    } bg-background px-4 py-2 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none`}
                    placeholder="np. Jan Kowalski"
                  />
                  {errors.name && (
                    <p className="text-xs font-bold text-destructive">{errors.name.message}</p>
                  )}
                </div>

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
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.email ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                    } bg-background px-4 py-2 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none`}
                    placeholder="np. jan.kowalski@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-xs font-bold text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Temat wiadomości
                  </label>
                  <input
                    type="text"
                    id="subject"
                    disabled={isSubmitting}
                    {...register("subject")}
                    className={`flex h-12 w-full rounded-xl border ${
                      errors.subject ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                    } bg-background px-4 py-2 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none`}
                    placeholder="np. Pytanie o zamówienie #12345"
                  />
                  {errors.subject && (
                    <p className="text-xs font-bold text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Treść wiadomości
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    disabled={isSubmitting}
                    {...register("message")}
                    className={`flex w-full rounded-xl border ${
                      errors.message ? "border-destructive ring-destructive/20" : "border-foreground/15 dark:border-white/10 hover:border-foreground/25"
                    } bg-background px-4 py-3 text-sm font-semibold placeholder:text-muted-foreground/45 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 shadow-none resize-none`}
                    placeholder="Wpisz treść swojej wiadomości..."
                  />
                  {errors.message && (
                    <p className="text-xs font-bold text-destructive">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <motion.button
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-2xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-12 px-6 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Wyślij wiadomość
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
                className="flex flex-col items-center justify-center text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-secondary/15 text-secondary rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-foreground">Wiadomość została wysłana!</h3>
                <p className="text-sm font-semibold text-muted-foreground max-w-sm leading-relaxed">
                  Dziękujemy za kontakt. Twoja wiadomość trafiła prosto do naszej skrzynki. Odpowiemy na nią najszybciej, jak to możliwe!
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 inline-flex items-center justify-center rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground h-10 px-6 transition-all cursor-pointer"
                >
                  Napisz kolejną wiadomość
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
