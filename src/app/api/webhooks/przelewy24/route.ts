import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/p24";
import { db } from "@/lib/firebase/admin";
import { buildCustomerEmailHtml, buildSellerEmailHtml } from "@/lib/emails";

export const dynamic = "force-dynamic";

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

    const sessionId = body.sessionId; // to nasz orderRef.id
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
    const orderRef = db.collection("orders").doc(sessionId);
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
    });
    console.log(`P24: Zamówienie ${sessionId} oznaczone jako PAID.`);

    // 4. Pobranie i wysłanie e-maili
    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const siteFromEmail = adminEmail;

    // Zbuduj załączniki (jeśli istnieją z momentu tworzenia koszyka)
    const attachments: Array<{ content: string; name: string; type: string }> = [];
    if (orderData.pdfAttachments && Array.isArray(orderData.pdfAttachments)) {
      for (const att of orderData.pdfAttachments) {
        const prefix = orderData.orderNumber.replace(/[^a-zA-Z0-9-]/g, "_");
        const attachmentName = `${prefix}-${att.name}`;
        attachments.push({
          content: att.base64,
          name: attachmentName,
          type: "application/pdf",
        });
      }
      // Opcjonalnie: usunięcie wielkich plików PDF z bazy po wysłaniu e-maila, by oszczędzić miejsce
      // await orderRef.update({ pdfAttachments: null });
    }

    // E-mail do klienta
    const customerEmailPayload = {
      sender: { name: "MałeNaklejki", email: siteFromEmail },
      to: [{ email: orderData.customer.email, name: `${orderData.customer.firstName} ${orderData.customer.lastName}` }],
      subject: `Opłacono zamówienie ${orderData.orderNumber} – MałeNaklejki`,
      htmlContent: buildCustomerEmailHtml(orderData, orderData.orderNumber),
    };
    await sendEmail(customerEmailPayload);

    // E-mail do sprzedawcy
    const sellerEmailPayload: any = {
      sender: { name: "MałeNaklejki – System zamówień", email: siteFromEmail },
      to: [{ email: adminEmail, name: "MałeNaklejki – Sprzedawca" }],
      subject: `🛒 Nowe OPŁACONE zamówienie ${orderData.orderNumber} – ${orderData.customer.firstName} ${orderData.customer.lastName} (${orderData.totals.total.toFixed(2)} zł)`,
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
