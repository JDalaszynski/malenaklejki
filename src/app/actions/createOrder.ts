"use server";

import { db } from "@/lib/firebase/admin";
import { z } from "zod";
import { checkRateLimit } from "@/lib/utils/rateLimit";
import { escapeHtml } from "@/lib/utils/sanitize";
import { headers } from "next/headers";

const OrderItemSchema = z.object({
  id: z.string().optional(),
  widthCm: z.number().min(1).max(100),
  heightCm: z.number().min(1).max(100),
  stickersPerSheet: z.number().int().min(0).max(1000),
  sheetQuantity: z.number().int().min(1).max(1000),
  pricePerSheet: z.number().min(0).max(10000),
  imageUrl: z.string(),
  cutLinesImageUrl: z.string().optional().nullable(),
}).passthrough();

const CreateOrderSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().regex(/^[0-9+\s\-()]{7,20}$/),
  deliveryMethod: z.enum(["kurier", "paczkomat"]),
  street: z.string().max(100).optional(),
  building: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  lockerId: z.string().max(100).optional(),
  lockerAddress: z.string().max(250).optional(),
  wantsInvoice: z.boolean(),
  nip: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  items: z.array(OrderItemSchema).min(1).max(100),
  pdfAttachments: z.array(z.object({
    base64: z.string(),
    name: z.string().max(200),
  })).optional(),
});

import { registerTransaction } from "@/lib/p24";

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

export async function createOrder(rawData: any) {
  try {
    // 1. Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`order-${ip}`, 5, 3600000)) {
      return { success: false, error: "Zbyt wiele prób utworzenia zamówienia. Spróbuj później." };
    }

    // 2. Validate input using Zod
    const result = CreateOrderSchema.safeParse(rawData);
    if (!result.success) {
      console.error("Zod Validation Error:", result.error);
      return { success: false, error: "Błędne dane zamówienia. Spróbuj ponownie." };
    }
    const data = result.data;

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

    // Usuwamy pole `stickers` (które zawiera zagnieżdżone tablice, np. contourPolygons[][]), 
    // ponieważ Firebase Firestore nie obsługuje tablic w tablicach. Ponadto, nie potrzebujemy
    // zapamiętywać ułożenia pojedynczych naklejek w bazie – wystarczą nam wygenerowane pliki PDF.
    const itemsToSave = finalData.items.map((item) => {
      const { stickers, ...rest } = item as any;
      return rest;
    });

    const orderData = {
      id: orderRef.id,
      orderNumber,
      status: "PENDING_PAYMENT",
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
            }
            : null,
      },
      billing: {
        wantsInvoice: finalData.wantsInvoice,
        nip: finalData.wantsInvoice ? finalData.nip : null,
        companyName: finalData.wantsInvoice ? finalData.companyName : null,
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

    // 6. Init P24 Transaction
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderNumber)}&orderId=${orderRef.id}`;
    const statusUrl = `${appUrl}/api/webhooks/przelewy24`;

    const p24Response = await registerTransaction({
      sessionId: orderRef.id, // używamy orderRef.id jako sessionId w P24, musi być unikalny dla każdej próby
      amount: Math.round(finalData.total * 100), // konwersja na grosze
      currency: "PLN",
      description: `Zamówienie ${orderNumber}`,
      email: finalData.email,
      client: `${finalData.firstName} ${finalData.lastName}`,
      urlReturn: returnUrl,
      urlStatus: statusUrl,
    });

    // Zapisujemy w Firestore PDF-y by webhook mógł je wysłać.
    // Aby nie obciążać bazy wielkimi stringami Base64, ewentualnie moglibyśmy użyć Storage.
    // Dla uproszczenia (do limitu Firestore 1MB) zapiszemy je tymczasowo,
    // ale bezpieczniej jest wysyłać je z frontendu bez bazy, lub po prostu nie dołączać ich do webhooka.
    // W tej implementacji dodajemy je do bazy, bo i tak wcześniej tak robiliśmy:
    if (finalData.pdfAttachments && Array.isArray(finalData.pdfAttachments)) {
      await orderRef.update({
        pdfAttachments: finalData.pdfAttachments
      });
    }

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
