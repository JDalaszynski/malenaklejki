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
  paymentMethod: z.enum(["przelewy24", "blik", "przelew"]),
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
import { buildManualTransferEmailHtml, buildNewOrderSellerEmailHtml } from "@/lib/emails";

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
    .map(item => `${item.sheetQuantity}x Naklejki na Arkuszu A4`)
    .join(", ");

  // Format to show Order Number, E-mail, Amount and Goods Type
  const desc = `Zamowienie: ${orderNumber} | E-mail: ${email} | Kwota: ${total.toFixed(2)} zł | Towar: ${itemsSummary}`;

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

    // Send email to seller immediately with files
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
      const siteFromEmail = adminEmail;

      const attachments: Array<{ content: string; name: string; type: string }> = [];
      if (finalData.pdfAttachments && Array.isArray(finalData.pdfAttachments)) {
        for (const att of finalData.pdfAttachments) {
          const prefix = orderNumber.replace(/[^a-zA-Z0-9-]/g, "_");
          const attachmentName = `${prefix}-${att.name}`;
          attachments.push({
            content: att.base64,
            name: attachmentName,
            type: "application/pdf",
          });
        }
      }

      const sellerEmailPayload: any = {
        sender: { name: "MałeNaklejki – System zamówień", email: siteFromEmail },
        to: [{ email: adminEmail, name: "MałeNaklejki – Sprzedawca" }],
        subject: `🛒 Nowe zamówienie ${orderNumber} – ${finalData.firstName} ${finalData.lastName} (${finalData.total.toFixed(2)} zł)`,
        htmlContent: buildNewOrderSellerEmailHtml(finalData, orderNumber),
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderNumber)}&orderId=${orderRef.id}`;

    if (finalData.paymentMethod === "przelew") {
      // Wyślij e-mail z danymi do przelewu
      const emailHtml = buildManualTransferEmailHtml(finalData, orderNumber);
      await sendEmail({
        sender: { name: "MałeNaklejki", email: "kontakt@malenaklejki.pl" },
        to: [{ email: finalData.email, name: `${finalData.firstName} ${finalData.lastName}` }],
        subject: `Zamówienie ${orderNumber} - dane do przelewu`,
        htmlContent: emailHtml,
      });

      if (finalData.pdfAttachments && Array.isArray(finalData.pdfAttachments)) {
        await orderRef.update({
          pdfAttachments: finalData.pdfAttachments
        });
      }

      return {
        success: true,
        orderId: orderRef.id,
        orderNumber,
        redirectUrl: returnUrl, // Bezpośrednio na ekran sukcesu
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderData.orderNumber)}&orderId=${orderId}`;
    const statusUrl = `${appUrl}/api/webhooks/przelewy24`;

    const expectedTotalGrosze = Math.round((orderData.totals?.total || 0) * 100);
    const p24Description = buildP24Description(
      orderData.orderNumber,
      orderData.customer.email,
      orderData.totals?.total || 0,
      orderData.items || []
    );

    const p24Response = await registerTransaction({
      sessionId: `${orderId}_retry${Date.now()}`,
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

