import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/p24";
import { db } from "@/lib/firebase/admin";
import { buildCustomerEmailHtml, buildSellerEmailHtml, buildOrderAttachments } from "@/lib/emails";
import { issueInvoiceForOrderSafely } from "@/lib/orders/invoicing";

export const dynamic = "force-dynamic";
// Wystawienie faktury w inFakcie to kilka sekund odpytywania o status zlecenia.
export const maxDuration = 30;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("P24 Webhook Received:", body);

    // 1. Sprawdzenie sygnatury z webhooka
    if (!verifyWebhookSignature(body)) {
      console.error("Nieprawidłowa sygnatura webhooka P24");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const sessionId = body.sessionId; // to nasz orderRef.id, lub orderRef.id + "_retry..."
    const orderIdFromSession = sessionId.split('_')[0];
    const orderId = body.orderId;
    const amount = body.amount;
    const currency = body.currency;

    // 2. Weryfikacja transakcji w P24 (wymagane przez API P24 by zakończyć płatność)
    try {
      await verifyTransaction({
        sessionId,
        orderId,
        amount,
        currency,
      });
      console.log(`P24: Transakcja ${sessionId} zweryfikowana pomyślnie`);
    } catch (e: any) {
      console.error(`P24: Błąd weryfikacji transakcji ${sessionId}:`, e);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    // 3. Aktualizacja zamówienia w Firestore
    const orderRef = db.collection("orders").doc(orderIdFromSession);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`P24: Zamówienie ${sessionId} nie istnieje w bazie.`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data()!;
    if (orderData.status === "PAID") {
      console.log(`P24: Zamówienie ${sessionId} jest już opłacone.`);
      return NextResponse.json({ status: "ok" }, { status: 200 }); // Ignorujemy duplikaty
    }

    await orderRef.update({
      status: "PAID",
      paidAt: new Date().toISOString(),
      p24OrderId: orderId,
      // Spóźniona płatność wyjmuje zamówienie z kosza. Nieopłacone zamówienia
      // trafiają tam po tygodniu, a przelew tradycyjny bywa księgowany później —
      // bez tego opłacone zamówienie zostałoby w koszu i wypadło z ewidencji.
      deletedAt: null,
    });
    console.log(`P24: Zamówienie ${sessionId} oznaczone jako PAID.`);

    // Faktura w inFakcie — wystawiana automatycznie za każde opłacone zamówienie.
    await issueInvoiceForOrderSafely(orderIdFromSession);

    // Płatności celowo nie przenosimy do BaseLinkera — zamówienie ma tam
    // zostać nieopłacone, sprzedawca księguje wpłatę ręcznie.

    // 4. Pobranie i wysłanie e-maili
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const siteFromEmail = adminEmail;

    const attachments = await buildOrderAttachments(orderData.items || [], orderData.orderNumber);

    // Gość dostaje w potwierdzeniu propozycję zamiany zamówienia w konto.
    // Zalogowani mają je już przypisane, więc dla nich pomijamy ten blok.
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    const claimUrl = orderData.userId
      ? undefined
      : `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(orderData.orderNumber)}&orderId=${orderIdFromSession}&konto=1`;

    // E-mail do klienta
    const customerEmailPayload = {
      sender: { name: "MałeNaklejki", email: siteFromEmail },
      to: [{ email: orderData.customer.email, name: `${orderData.customer.firstName} ${orderData.customer.lastName}` }],
      subject: `Opłacono zamówienie ${orderData.orderNumber} - MałeNaklejki`,
      htmlContent: buildCustomerEmailHtml(orderData, orderData.orderNumber, claimUrl),
    };
    await sendEmail(customerEmailPayload);

    // E-mail do sprzedawcy
    const sellerEmailPayload: any = {
      sender: { name: "MałeNaklejki - System zamówień", email: siteFromEmail },
      to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
      subject: `🛒 Nowe OPŁACONE zamówienie ${orderData.orderNumber} - ${orderData.customer.firstName} ${orderData.customer.lastName} (${orderData.totals.total.toFixed(2).replace('.', ',')} zł)`,
      htmlContent: buildSellerEmailHtml(orderData, orderData.orderNumber),
    };
    if (attachments.length > 0) {
      sellerEmailPayload.attachment = attachments;
    }
    await sendEmail(sellerEmailPayload);

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("P24 Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
