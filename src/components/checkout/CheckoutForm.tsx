"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { InPostGeowidget } from "./InPostGeowidget";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/app/actions/createOrder";
import { Loader2, X, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStickersNoun } from "@/lib/utils/polish";

const checkoutSchema = z.object({
  email: z.string().email({ message: "Proszę podać poprawny adres e-mail" }),
  firstName: z.string().min(2, { message: "Imię jest wymagane" }),
  lastName: z.string().min(2, { message: "Nazwisko jest wymagane" }),
  phone: z.string().min(9, { message: "Proszę podać poprawny numer telefonu" }),
  deliveryMethod: z.enum(["kurier", "paczkomat"]),
  paymentMethod: z.enum(["przelewy24", "blik", "przelew"]),
  street: z.string().optional(),
  building: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  lockerId: z.string().optional(),
  lockerAddress: z.string().optional(),
  wantsInvoice: z.boolean(),
  nip: z.string().optional(),
  companyName: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Akceptacja regulaminu jest wymagana",
  }),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === "kurier") {
    if (!data.street) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ulica jest wymagana", path: ["street"] });
    if (!data.building) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numer budynku jest wymagany", path: ["building"] });
    if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Miejscowość jest wymagana", path: ["city"] });
    if (!data.postalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Kod pocztowy jest wymagany", path: ["postalCode"] });
  }
  if (data.deliveryMethod === "paczkomat") {
    if (!data.lockerId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Proszę wybrać Paczkomat z mapy", path: ["lockerId"] });
  }
  if (data.wantsInvoice) {
    if (!data.nip) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numer NIP jest wymagany", path: ["nip"] });
    if (!data.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nazwa firmy jest wymagana", path: ["companyName"] });
  }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/** Generates an A4 PDF (base64) from an image URL by fetching it and embedding it directly.
 *  This preserves the exact 0.85 quality JPEG data uploaded to Firebase without re-compression,
 *  and avoids blocking the main thread during checkout.
 *  For print PDFs, pass item.imageUrl (color composite).
 *  For cut-lines PDFs, pass item.cutLinesImageUrl (black shapes on white).
 */
async function generatePdfBase64(imageUrl: string): Promise<string> {
  const { jsPDF } = await import("jspdf");

  // Fetch the image via proxy to avoid CORS
  const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl}`);
  }
  const blob = await response.blob();

  // Convert the blob directly to a base64 data URL
  const base64DataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image blob"));
    reader.readAsDataURL(blob);
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(base64DataUrl, "JPEG", 0, 0, 210, 297);

  const pdfOutput = pdf.output("datauristring");
  return pdfOutput.split(",")[1];
}



export function CheckoutForm() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaczkomatModal, setShowPaczkomatModal] = useState(false);
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "paczkomat",
      paymentMethod: "przelewy24",
      wantsInvoice: false,
      termsAccepted: false,
    },
  });

  const { watch, register, handleSubmit, setValue, formState: { errors } } = form;

  const deliveryMethod = watch("deliveryMethod");
  const paymentMethod = watch("paymentMethod");
  const wantsInvoice = watch("wantsInvoice");
  const lockerId = watch("lockerId");
  const lockerAddress = watch("lockerAddress");

  const subtotal = getTotalPrice();
  const shippingCost = deliveryMethod === "kurier" ? 19.99 : 19.99;
  const total = subtotal + shippingCost;

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      alert("Twój koszyk jest pusty");
      return;
    }

    setIsSubmitting(true);

    // Yield to let React render the loading overlay and let the browser paint
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      // Generate PDF attachments for each item
      const pdfAttachments: Array<{ base64: string; name: string }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemIndex = i + 1;

        try {
          // Print PDF – from the stored color composite image
          const printBase64 = await generatePdfBase64(item.imageUrl);
          pdfAttachments.push({
            base64: printBase64,
            name: `arkusz-${itemIndex}-DRUK.pdf`,
          });

          // Cut-lines PDF – use the dedicated cut-lines image stored at add-to-cart time
          const cutSource = item.cutLinesImageUrl ?? item.imageUrl;
          const cutBase64 = await generatePdfBase64(cutSource);
          pdfAttachments.push({
            base64: cutBase64,
            name: `arkusz-${itemIndex}-LINIE-CIECIA.pdf`,
          });
        } catch (pdfErr) {
          console.warn(`PDF generation failed for item ${itemIndex}:`, pdfErr);
        }
      }

      const payload = {
        ...data,
        items,
        subtotal,
        shippingCost,
        total,
        pdfAttachments,
      };

      const response = await createOrder(payload);

      if (response.success) {
        clearCart();
        // Keep isSubmitting=true so overlay stays visible during navigation
        // (avoids flash of empty cart before success page renders)
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        } else {
          router.push(
            `/zamowienie-sukces?orderNumber=${encodeURIComponent(response.orderNumber!)}&orderId=${response.orderId}`
          );
        }
      } else {
        alert("Błąd podczas tworzenia zamówienia: " + response.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Wystąpił nieoczekiwany błąd");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Twój koszyk jest pusty</h2>
        <button onClick={() => router.push("/")} className="text-primary hover:underline">
          Wróć do strony głównej
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
          <div className="bg-card border border-border/70 rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-5 max-w-sm w-full mx-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-9 h-9 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-xl text-foreground">Składanie zamówienia…</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">Proszę czekać, nie zamykaj okna.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">

          {/* Sekcja A: Dane kontaktowe */}
          <div className="bg-card border border-border/70 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold mb-6">1. Dane kontaktowe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold mb-2 block">Imię<span className="text-destructive"> *</span></label>
                <input {...register("firstName")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                {errors.firstName && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Nazwisko<span className="text-destructive"> *</span></label>
                <input {...register("lastName")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                {errors.lastName && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Adres e-mail<span className="text-destructive"> *</span></label>
                <input {...register("email")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                {errors.email && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-bold mb-2 block">Numer telefonu<span className="text-destructive"> *</span></label>
                <input {...register("phone")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                {errors.phone && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Sekcja B: Dostawa */}
          <div className="bg-card border border-border/70 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold mb-6">2. Adres i metoda dostawy</h2>
            <div className="flex flex-col gap-4 mb-6">
              <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${deliveryMethod === "paczkomat" ? "border-primary bg-primary/5 text-foreground shadow-none" : "border-border/60 bg-card text-foreground hover:bg-muted/30"}`}>
                <input type="radio" value="paczkomat" {...register("deliveryMethod")} className="mr-4 w-5 h-5 text-foreground focus:ring-foreground" />
                <div className="flex-1">
                  <p className="font-extrabold text-lg">Paczkomat InPost</p>
                  <p className={`font-medium text-sm ${deliveryMethod === "paczkomat" ? "text-primary" : "text-muted-foreground"}`}>Wysyłka do punktu (19,99 zł)</p>
                </div>
              </label>
              <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${deliveryMethod === "kurier" ? "border-primary bg-primary/5 text-foreground shadow-none" : "border-border/60 bg-card text-foreground hover:bg-muted/30"}`}>
                <input type="radio" value="kurier" {...register("deliveryMethod")} className="mr-4 w-5 h-5 text-foreground focus:ring-foreground" />
                <div className="flex-1">
                  <p className="font-extrabold text-lg">Przesyłka Kurierska</p>
                  <p className={`font-medium text-sm ${deliveryMethod === "kurier" ? "text-primary" : "text-muted-foreground"}`}>Kurier pod drzwi (19,99 zł)</p>
                </div>
              </label>
            </div>
            {deliveryMethod === "paczkomat" && (
              <div className="space-y-4">
                <div className="bg-muted/20 p-6 rounded-xl border border-border/40">
                  <p className="font-bold text-muted-foreground mb-1">Wybrany punkt:</p>
                  {lockerId ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[#FFCD08] font-extrabold text-xl">{lockerId}</p>
                        <p className="font-medium text-foreground">{lockerAddress}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPaczkomatModal(true)}
                        className="bg-[#FFCD08] hover:bg-[#FFCD08]/90 text-black font-black px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border border-[#FFCD08]/20 shrink-0 self-start sm:self-center"
                      >
                        Zmień Paczkomat
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="inline-block bg-muted/40 text-muted-foreground text-sm font-bold px-4 py-2 rounded-xl border border-border/40">
                        Brak wybranego Paczkomatu
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPaczkomatModal(true)}
                        className="bg-[#FFCD08] hover:bg-[#FFCD08]/90 text-black font-black px-5 py-3 rounded-2xl text-sm transition-all cursor-pointer border border-[#FFCD08]/20 shrink-0 self-start sm:self-center hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Wybierz Paczkomat
                      </button>
                    </div>
                  )}
                  {errors.lockerId && <p className="inline-block bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold px-3 py-1 rounded-lg mt-2">{errors.lockerId.message}</p>}
                </div>
              </div>
            )}

            {deliveryMethod === "kurier" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-in fade-in">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold mb-2 block">Ulica<span className="text-destructive"> *</span></label>
                  <input {...register("street")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.street && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Numer lokalu/domu<span className="text-destructive"> *</span></label>
                  <input {...register("building")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.building && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.building.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Kod pocztowy<span className="text-destructive"> *</span></label>
                  <input {...register("postalCode")} placeholder="00-000" className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.postalCode && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.postalCode.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold mb-2 block">Miejscowość<span className="text-destructive"> *</span></label>
                  <input {...register("city")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.city && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.city.message}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Sekcja C: Faktura */}
          <div className="bg-card border border-border/70 rounded-2xl p-8 shadow-sm">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" {...register("wantsInvoice")} className="mr-4 w-5 h-5 rounded border-gray-300 text-foreground focus:ring-foreground" />
              <h2 className="text-xl font-extrabold">Chcę otrzymać fakturę VAT</h2>
            </label>

            {wantsInvoice && (
              <div className="grid grid-cols-1 gap-6 mt-6 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="text-sm font-bold mb-2 block">NIP<span className="text-destructive"> *</span></label>
                  <input {...register("nip")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.nip && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.nip.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Nazwa firmy<span className="text-destructive"> *</span></label>
                  <input {...register("companyName")} className="flex h-12 w-full rounded-xl border border-slate-300 dark:border-white/20 bg-background px-4 py-2 text-base font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20" />
                  {errors.companyName && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.companyName.message}</p>}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sekcja D: Podsumowanie */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/70 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] sticky top-24">
            <h2 className="text-2xl font-extrabold mb-6">Podsumowanie zamówienia</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-border/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-muted/30 rounded-md overflow-hidden flex-shrink-0 border border-border/40 p-1 flex items-center justify-center">
                      <img src={item.imageUrl} alt="Sticker" className="max-w-full max-h-full object-contain shadow-sm" />
                    </div>
                    <div>
                      <p className="font-extrabold text-base">Naklejki na Arkuszu A4</p>
                      <p className="font-medium text-sm text-muted-foreground">
                        {item.stickersPerSheet} {getStickersNoun(item.stickersPerSheet)}
                      </p>
                      {item.stickersPerSheet > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Tylko {(item.pricePerSheet / item.stickersPerSheet).toFixed(2)} zł za 1 naklejkę!
                        </p>
                      )}
                      <p className="font-bold text-sm text-primary">Sztuk: {item.sheetQuantity} (A4)</p>
                    </div>
                  </div>
                  <p className="font-extrabold text-lg">{(item.pricePerSheet * item.sheetQuantity).toFixed(2)} zł</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 bg-muted/15 p-4 rounded-xl border border-border/40">
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Naklejki</span>
                <span>{subtotal.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Dostawa</span>
                <span>{shippingCost.toFixed(2)} zł</span>
              </div>
              <div className="pt-3 border-t border-border/40 flex justify-between font-bold text-xl text-primary">
                <span>Razem</span>
                <span>{total.toFixed(2)} zł</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Metoda płatności</h3>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "przelewy24" ? "border-primary bg-primary/5 text-foreground shadow-sm" : "border-border/60 bg-card text-foreground hover:bg-muted/30"}`}>
                  <input type="radio" value="przelewy24" {...register("paymentMethod")} className="mr-3 w-4 h-4 text-foreground focus:ring-foreground" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Przelewy24</p>
                    <p className="text-xs text-muted-foreground">Szybki przelew, karta</p>
                  </div>
                  <img src="/images/payment-icons/Przelewy24_logo.png" alt="P24" className="h-5 w-auto object-contain opacity-90" />
                </label>
                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "blik" ? "border-primary bg-primary/5 text-foreground shadow-sm" : "border-border/60 bg-card text-foreground hover:bg-muted/30"}`}>
                  <input type="radio" value="blik" {...register("paymentMethod")} className="mr-3 w-4 h-4 text-foreground focus:ring-foreground" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">BLIK</p>
                    <p className="text-xs text-muted-foreground">Szybka płatność kodem z aplikacji</p>
                  </div>
                  <img src="/images/payment-icons/BLIK-LOGO-RGB.png" alt="BLIK" className="h-5 w-auto object-contain opacity-90" />
                </label>
                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === "przelew" ? "border-primary bg-primary/5 text-foreground shadow-sm" : "border-border/60 bg-card text-foreground hover:bg-muted/30"}`}>
                  <input type="radio" value="przelew" {...register("paymentMethod")} className="mr-3 w-4 h-4 text-foreground focus:ring-foreground" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Przelew tradycyjny</p>
                    <p className="text-xs text-muted-foreground">Dane do przelewu otrzymasz na e-mail</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input type="checkbox" {...register("termsAccepted")} className="mt-1 mr-3 w-5 h-5 rounded border-gray-300 text-foreground flex-shrink-0 focus:ring-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Akceptuję <a href="/regulamin" className="text-primary font-bold hover:underline" target="_blank">regulamin</a> oraz <a href="/polityka-prywatnosci" className="text-primary font-bold hover:underline" target="_blank">politykę prywatności</a>.<span className="text-destructive"> *</span>
                </span>
              </label>
              {errors.termsAccepted && <p className="inline-block bg-destructive/30 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-lg border border-destructive/40 mt-1.5">{errors.termsAccepted.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] h-16 shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : null}
              Kupuję i płacę
            </button>

            <div className="mt-6 pt-6 border-t border-border/40 flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                <span>Płatności obsługuje</span>
                <img
                  src="/images/payment-icons/Przelewy24_logo.png"
                  alt="Przelewy24"
                  className="h-6 w-auto object-contain"
                />
              </div>
              <img
                src="/images/payment-icons/metody-platnosci-przelewy24.png"
                alt="Metody płatności Przelewy24"
                className="w-full max-w-[380px] h-auto object-contain opacity-90"
              />
            </div>
          </div>
        </div>

        {/* Paczkomat Selection Modal */}
        {showPaczkomatModal && (
          <div className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/60">
                <h3 className="font-extrabold text-lg text-foreground">Wybierz Paczkomat InPost</h3>
                <button
                  type="button"
                  onClick={() => setShowPaczkomatModal(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Modal Content */}
              <div className="p-6">
                <InPostGeowidget
                  onPointSelected={(point) => {
                    setValue("lockerId", point.name, { shouldValidate: true });
                    setValue("lockerAddress", point.address);
                    setShowPaczkomatModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
