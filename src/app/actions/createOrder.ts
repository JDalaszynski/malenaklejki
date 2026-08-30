"use server";

import { db, FieldValue } from "@/lib/firebase/admin";
import { z } from "zod";
import { consumeRateLimit, formatRetryAfter } from "@/lib/auth/rateLimit";
import { readSession } from "@/lib/auth/session";
import { attachCartLayout } from "@/lib/orders/layout";
import { createAccountFromOrder } from "@/lib/auth/accountFromOrder";
import { headers } from "next/headers";
import { formatLongDate, resolveVacation } from "@/lib/settings/vacation";
import { buildVacationEmailNotice } from "@/lib/settings/vacationEmail";
import { getVacationSettingsFresh } from "@/lib/settings/vacationStore";

const OrderItemSchema = z.object({
  id: z.string().optional(),
  widthCm: z.number().min(1).max(100),
  heightCm: z.number().min(1).max(100),
  stickersPerSheet: z.number().int().min(0).max(1000),
  sheetQuantity: z.number().int().min(1).max(1000),
  pricePerSheet: z.number().min(0).max(10000),
  imageUrl: z.string(),
  cutLinesImageUrl: z.string().optional().nullable(),
  deliveryForm: z.enum(["sheet", "individual"]).default("sheet"),
  /** Ścieżka do układu arkusza wgranego przez kreator (`layouts/carts/...`). */
  layoutPath: z.string().max(300).optional().nullable(),
}).passthrough();

const CreateOrderSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().regex(/^[0-9+\s\-()]{7,20}$/),
  deliveryMethod: z.enum(["kurier", "paczkomat"]),
  paymentMethod: z.enum(["przelewy24", "blik", "przelew"]),
  street: z.string().max(100).optional(),
  building: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  lockerId: z.string().max(100).optional(),
  lockerAddress: z.string().max(250).optional(),
  lockerCity: z.string().max(100).optional(),
  lockerPostalCode: z.string().max(20).optional(),
  wantsInvoice: z.boolean(),
  nip: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  items: z.array(OrderItemSchema).min(1).max(100),
  // Gość może przy okazji założyć konto — hasło nigdzie nie jest zapisywane
  // razem z zamówieniem, trafia wyłącznie do Firebase Auth.
  accountPassword: z
    .string()
    .min(8)
    .max(200)
    .refine((v) => /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(v) && /[0-9]/.test(v))
    .optional(),
  accountMarketingConsent: z.boolean().optional(),
});

import { registerTransaction } from "@/lib/p24";
import { buildManualTransferEmailHtml, buildNewOrderSellerEmailHtml, buildOrderAttachments } from "@/lib/emails";
import { sendOrderToBaseLinker } from "@/lib/baselinker";

/**
 * Generates a human-readable order number: MNK-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip confusable chars
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MNK-${year}${month}${day}-${suffix}`;
}



/**
 * Helper to build a clean and detailed payment description for Przelewy24 reports.
 */
function buildP24Description(
  orderNumber: string,
  email: string,
  total: number,
  items: any[]
): string {
  const itemsSummary = items
    .map(item => `${item.sheetQuantity}x Zestaw Naklejek`)
    .join(", ");

  // Format to show Order Number, E-mail, Amount and Goods Type
  const desc = `Zamowienie: ${orderNumber} | E-mail: ${email} | Kwota: ${total.toFixed(2).replace('.', ',')} zl | Towar: ${itemsSummary}`;

  // Przelewy24 description max length is 1024 characters, let's truncate if it's too long
  if (desc.length > 1000) {
    return desc.slice(0, 997) + "...";
  }
  return desc;
}

/**
 * Sends an email via Brevo. Returns true on success.
 */
async function sendEmail(payload: object): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not set");
    return false;
  }
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error("Brevo error:", response.status, text);
    return false;
  }
  return true;
}

// Usunięto szablony email. Zostały przeniesione do src/lib/emails.ts i są używane w webhooku P24.

async function doCreateOrder(rawData: any) {
  try {
    // 1. Rate limiting
    const headersList = await headers();
    const ip = (headersList.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const limit = await consumeRateLimit(`order:${ip}`, 5, 3600000);
    if (!limit.ok) {
      return {
        success: false,
        error: `Zbyt wiele prób utworzenia zamówienia. Spróbuj ${formatRetryAfter(limit.retryAfterMs)}.`,
      };
    }

    // 1b. Przerwa urlopowa ze wstrzymaną sprzedażą.
    // Wyszarzony przycisk w kasie niczego nie zabezpiecza — akcja serwerowa ma
    // własny adres, więc blokadę sprawdzamy tutaj, na świeżych ustawieniach.
    const vacationSettings = await getVacationSettingsFresh();
    const vacation = resolveVacation(vacationSettings);
    if (vacation.pauseOrders) {
      return {
        success: false,
        error: vacation.resumesAt
          ? `Chwilowo nie przyjmujemy zamówień — trwa przerwa urlopowa. Wracamy ${formatLongDate(vacation.resumesAt)}.`
          : "Chwilowo nie przyjmujemy zamówień — trwa przerwa urlopowa.",
      };
    }
    const vacationNotice = buildVacationEmailNotice(vacationSettings);

    // 2. Validate input using Zod
    const result = CreateOrderSchema.safeParse(rawData);
    if (!result.success) {
      console.error("Zod Validation Error:", result.error);
      return { success: false, error: "Błędne dane zamówienia. Spróbuj ponownie." };
    }
    const { accountPassword, accountMarketingConsent, ...data } = result.data;

    // 3. Server-side price calculation
    const serverSubtotal = data.items.reduce(
      (sum, item) => sum + item.pricePerSheet * item.sheetQuantity,
      0
    );
    const shippingCost = 19.99;
    const serverTotal = serverSubtotal + shippingCost;

    // Build the final data object with trusted totals
    const finalData = {
      ...data,
      subtotal: serverSubtotal,
      shippingCost,
      total: serverTotal,
    };

    // 4. Generate unique order number
    const orderNumber = generateOrderNumber();

    // 5. Create Firestore Document
    const orderRef = db.collection("orders").doc();

    // Układ arkusza leży już w Storage — kreator wgrał go tam przy dodawaniu
    // do koszyka, bo treść zamówienia jest czyszczona z pola `stickers`
    // (limit rozmiaru żądania). Tutaj tylko przepinamy plik z katalogu koszyka
    // pod zamówienie, żeby dało się później otworzyć ten arkusz w kreatorze.
    const itemsToSave = await Promise.all(
      finalData.items.map(async (item, index) => {
        const { stickers, layoutPath: cartLayoutPath, ...rest } = item as any;
        const itemId: string = rest.id || `pozycja-${index + 1}`;
        const layoutPath = cartLayoutPath
          ? await attachCartLayout(cartLayoutPath, orderRef.id, itemId)
          : null;
        return { ...rest, id: itemId, layoutPath };
      })
    );

    // Zamówienie złożone przez zalogowaną osobę od razu ląduje w jej koncie.
    // Gość dostanie je po założeniu konta i potwierdzeniu adresu e-mail —
    // `customerEmailLower` jest kluczem, po którym je wtedy odnajdujemy.
    const session = await readSession();
    const emailLower = finalData.email.toLowerCase().trim();

    const orderData = {
      id: orderRef.id,
      orderNumber,
      status: "PENDING_PAYMENT",
      fulfillmentStatus: "NEW",
      source: "shop",
      userId: session?.uid ?? null,
      customerEmailLower: emailLower,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      customer: {
        email: finalData.email,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        phone: finalData.phone,
      },
      delivery: {
        method: finalData.deliveryMethod,
        courierDetails:
          finalData.deliveryMethod === "kurier"
            ? {
              street: finalData.street,
              building: finalData.building,
              city: finalData.city,
              postalCode: finalData.postalCode,
            }
            : null,
        paczkomatDetails:
          finalData.deliveryMethod === "paczkomat"
            ? {
              lockerId: finalData.lockerId,
              address: finalData.lockerAddress,
              city: finalData.lockerCity,
              postalCode: finalData.lockerPostalCode,
            }
            : null,
      },
      billing: {
        wantsInvoice: finalData.wantsInvoice,
        nip: finalData.wantsInvoice ? finalData.nip : null,
        companyName: finalData.wantsInvoice ? finalData.companyName : null,
      },
      payment: {
        method: finalData.paymentMethod,
        status: "PENDING_PAYMENT",
      },
      items: itemsToSave,
      totals: {
        subtotal: finalData.subtotal,
        shipping: finalData.shippingCost,
        total: finalData.total,
      },
    };

    // Firebase Firestore nie akceptuje wartości `undefined`.
    // JSON.parse(JSON.stringify()) to szybki i bezpieczny sposób na usunięcie wszystkich kluczy z wartością `undefined` z obiektu.
    const cleanOrderData = JSON.parse(JSON.stringify(orderData));
    await orderRef.set(cleanOrderData);

    // Konto zakładamy po zapisaniu zamówienia — nieudana rejestracja (np. adres
    // ma już konto) nie może zablokować samego zakupu.
    if (accountPassword && !session) {
      const created = await createAccountFromOrder(
        cleanOrderData,
        accountPassword,
        Boolean(accountMarketingConsent),
        (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "")
      );
      if (created.ok) {
        await orderRef.update({ userId: created.uid, linkedAt: new Date().toISOString() });
        console.log(`Założono konto ${created.uid} przy zamówieniu ${orderNumber}`);
      } else {
        console.warn(`Nie założono konta przy zamówieniu ${orderNumber}: ${created.message}`);
      }
    }

    // Wysyłamy zamówienie do BaseLinkera — mapowanie pól siedzi w lib/baselinker,
    // wspólne z ręczną wysyłką z panelu.
    try {
      const blResult = await sendOrderToBaseLinker(cleanOrderData);
      if (blResult && blResult.status === "SUCCESS") {
        await orderRef.update({ baselinkerOrderId: blResult.order_id });
        console.log(`Zapisano zamówienie w BaseLinkerze (ID: ${blResult.order_id})`);
      } else {
        console.error("Błąd zapisu w BaseLinkerze:", blResult);
      }
    } catch (e) {
      console.error("Błąd połączenia z BaseLinkerem:", e);
    }

    // Send email to seller immediately with files
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
      const siteFromEmail = adminEmail;

      const attachments = await buildOrderAttachments(finalData.items, orderNumber);

      const htmlContent = buildNewOrderSellerEmailHtml(finalData, orderNumber);

      let paymentInfo = "";
      if (finalData.paymentMethod === "przelewy24" || finalData.paymentMethod === "blik") {
         paymentInfo = " (Oczekuje na płatność)";
      }

      const subject = `🛒 Nowe zamówienie${paymentInfo} ${orderNumber} - ${finalData.firstName} ${finalData.lastName} (${finalData.total.toFixed(2).replace('.', ',')} zł)`;

      const sellerEmailPayload: any = {
        sender: { name: "MałeNaklejki - System zamówień", email: siteFromEmail },
        to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
        subject,
        htmlContent,
      };
      if (attachments.length > 0) {
        sellerEmailPayload.attachment = attachments;
      }
      await sendEmail(sellerEmailPayload);
      console.log(`Initial seller notification email sent for order ${orderNumber}`);
    } catch (emailErr) {
      console.error("Failed to send initial seller notification email:", emailErr);
    }

    // 6. Handle Payment Routing
    // Ukośnik na końcu adresu z konfiguracji dawałby `//zamowienie-sukces`
    // w adresach powrotu przekazywanych do Przelewy24.
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const returnUrl = `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderNumber)}&orderId=${orderRef.id}`;
    const offlineReturnUrl = `${returnUrl}&paymentMethod=${finalData.paymentMethod}`;

    if (finalData.paymentMethod === "przelew") {
      // Wyślij e-mail z danymi do przelewu
      const emailHtml = buildManualTransferEmailHtml(finalData, orderNumber, vacationNotice);
      await sendEmail({
        sender: { name: "MałeNaklejki", email: "kontakt@malenaklejki.pl" },
        to: [{ email: finalData.email, name: `${finalData.firstName} ${finalData.lastName}` }],
        subject: `Zamówienie ${orderNumber} - dane do przelewu`,
        htmlContent: emailHtml,
      });

      return {
        success: true,
        orderId: orderRef.id,
        orderNumber,
        redirectUrl: offlineReturnUrl, // Bezpośrednio na ekran sukcesu
      };
    }

    // P24 lub BLIK
    const statusUrl = `${appUrl}/api/webhooks/przelewy24`;
    const expectedTotalGrosze = Math.round(finalData.total * 100);
    const p24Description = buildP24Description(orderNumber, finalData.email, finalData.total, finalData.items);

    const p24Response = await registerTransaction({
      sessionId: orderRef.id, // używamy orderRef.id jako sessionId w P24, musi być unikalny dla każdej próby
      amount: expectedTotalGrosze, // konwersja na grosze
      currency: "PLN",
      description: p24Description,
      email: finalData.email,
      client: `${finalData.firstName} ${finalData.lastName}`,
      urlReturn: returnUrl,
      urlStatus: statusUrl,
      methodId: finalData.paymentMethod === "blik" ? 73 : undefined,
    });

    // Zapisujemy w Firestore PDF-y by webhook mógł je wysłać.
    // Aby nie obciążać bazy wielkimi stringami Base64, ewentualnie moglibyśmy użyć Storage.
    // Dla uproszczenia (do limitu Firestore 1MB) zapiszemy je tymczasowo,
    // ale bezpieczniej jest wysyłać je z frontendu bez bazy, lub po prostu nie dołączać ich do webhooka.
    // W tej implementacji dodajemy je do bazy, bo i tak wcześniej tak robiliśmy:


    return {
      success: true,
      orderId: orderRef.id,
      orderNumber,
      redirectUrl: p24Response.paymentUrl,
    };
  } catch (error: any) {
    console.error("createOrder error:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderStatus(orderId: string) {
  try {
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      return { success: false, error: "Zamówienie nie istnieje" };
    }
    const orderData = orderSnap.data()!;
    return {
      success: true,
      status: orderData.status,
      orderNumber: orderData.orderNumber,
      total: orderData.totals?.total || 0,
      paymentMethod: orderData.payment?.method || orderData.paymentMethod || null,
    };
  } catch (error: any) {
    console.error("getOrderStatus error:", error);
    return { success: false, error: error.message };
  }
}

export async function retryOrderPayment(orderId: string) {
  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return { success: false, error: "Zamówienie nie istnieje" };
    }
    const orderData = orderSnap.data()!;

    if (orderData.status === "PAID") {
      return { success: false, error: "Zamówienie jest już opłacone" };
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const returnUrl = `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderData.orderNumber)}&orderId=${orderId}`;
    const statusUrl = `${appUrl}/api/webhooks/przelewy24`;

    const expectedTotalGrosze = Math.round((orderData.totals?.total || 0) * 100);
    const p24Description = buildP24Description(
      orderData.orderNumber,
      orderData.customer.email,
      orderData.totals?.total || 0,
      orderData.items || []
    );

    // Nowa sesja P24 zapisana przy zamówieniu — awaryjne sprawdzanie płatności
    // w cronie pyta o każdą sesję, nie tylko o tę z pierwszego podejścia.
    const retrySessionId = `${orderId}_retry${Date.now()}`;
    await orderRef.update({
      p24SessionIds: FieldValue.arrayUnion(retrySessionId),
    });

    const p24Response = await registerTransaction({
      sessionId: retrySessionId,
      amount: expectedTotalGrosze,
      currency: "PLN",
      description: p24Description,
      email: orderData.customer.email,
      client: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
      urlReturn: returnUrl,
      urlStatus: statusUrl,
    });

    return {
      success: true,
      redirectUrl: p24Response.paymentUrl,
    };
  } catch (error: any) {
    console.error("retryOrderPayment error:", error);
    return { success: false, error: error.message };
  }
}


export async function createOrder(rawData: any) {
  try {
    const result = await doCreateOrder(rawData);
    // Zwracamy string, aby uniknąć błędów serializacji "An error occurred in the Server Components render" Next.js
    return JSON.stringify(result);
  } catch (error: any) {
    console.error("createOrder wrapper error:", error);
    return JSON.stringify({ success: false, error: String(error?.message || error) });
  }
}
