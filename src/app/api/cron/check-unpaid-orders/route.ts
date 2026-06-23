import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { getTransactionBySessionId } from "@/lib/p24";
import {
  buildUnpaidOrderSellerEmailHtml,
  buildCustomerEmailHtml,
  buildSellerEmailHtml,
  buildOrderAttachments,
} from "@/lib/emails";

export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  try {
    // 1. Zabezpieczenie endpointu w produkcji
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("Authorization");

    if (process.env.NODE_ENV === "production" && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("Próba nieautoryzowanego wywołania endpointu Cron.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Uruchamianie Cron: Sprawdzanie nieopłaconych zamówień...");

    // 2. Pobranie zamówień oczekujących na płatność
    const ordersSnap = await db.collection("orders")
      .where("status", "==", "PENDING_PAYMENT")
      .get();

    const now = new Date();
    const timeThreshold = new Date(now.getTime() - 25 * 60 * 1000); // 25 minut temu

    const unpaidOrders: any[] = [];
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      const createdAt = new Date(data.createdAt);
      if (createdAt < timeThreshold && !data.failureNotificationSent) {
        unpaidOrders.push({ id: doc.id, ...data });
      }
    });

    console.log(`Znaleziono ${unpaidOrders.length} potencjalnie nieopłaconych zamówień.`);

    const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
    const siteFromEmail = adminEmail;

    for (const order of unpaidOrders) {
      console.log(`Analizowanie zamówienia ${order.orderNumber} (ID: ${order.id})...`);
      
      let isActuallyPaid = false;
      let p24OrderId = null;

      try {
        // Sprawdzamy status transakcji bezpośrednio w Przelewy24 (używając pierwotnego ID jako sessionId)
        const p24Tx = await getTransactionBySessionId(order.id);
        
        // Jeśli P24 ma transakcję i jest w niej przypisane niezerowe orderId, to znaczy że transakcja jest opłacona.
        // Oznacza to, że webhook z jakiegoś powodu nie zaktualizował bazy. Robimy synchronizację awaryjną.
        if (p24Tx && p24Tx.orderId && p24Tx.orderId > 0) {
          isActuallyPaid = true;
          p24OrderId = p24Tx.orderId;
        }
      } catch (err) {
        console.error(`Błąd pobierania szczegółów z P24 dla sesji ${order.id}:`, err);
      }

      const orderRef = db.collection("orders").doc(order.id);

      if (isActuallyPaid) {
        console.log(`[Cron Fallback] Zamówienie ${order.orderNumber} jest opłacone w P24 (P24 ID: ${p24OrderId}). Aktualizacja statusu na PAID.`);
        
        // Zmień status na PAID
        await orderRef.update({
          status: "PAID",
          paidAt: new Date().toISOString(),
          p24OrderId: p24OrderId,
        });

        // Wyślij normalne e-maile o udanej płatności
        const attachments = await buildOrderAttachments(order.items || [], order.orderNumber);

        // Email do klienta
        const customerEmailPayload = {
          sender: { name: "MałeNaklejki", email: siteFromEmail },
          to: [{ email: order.customer.email, name: `${order.customer.firstName} ${order.customer.lastName}` }],
          subject: `Opłacono zamówienie ${order.orderNumber} – MałeNaklejki`,
          htmlContent: buildCustomerEmailHtml(order, order.orderNumber),
        };
        await sendEmail(customerEmailPayload);

        // Email do sprzedawcy
        const sellerEmailPayload: any = {
          sender: { name: "MałeNaklejki – System zamówień", email: siteFromEmail },
          to: [{ email: adminEmail, name: "MałeNaklejki – Sprzedawca" }],
          subject: `🛒 Nowe OPŁACONE zamówienie ${order.orderNumber} – ${order.customer.firstName} ${order.customer.lastName} (${order.totals.total.toFixed(2).replace('.', ',')} zł)`,
          htmlContent: buildSellerEmailHtml(order, order.orderNumber),
        };
        if (attachments.length > 0) {
          sellerEmailPayload.attachment = attachments;
        }
        await sendEmail(sellerEmailPayload);

      } else {
        console.log(`Zamówienie ${order.orderNumber} NIE zostało opłacone. Oznaczanie jako PAYMENT_FAILED i wysyłanie alertu.`);

        // Zmień status na PAYMENT_FAILED i ustaw flagę powiadomienia
        await orderRef.update({
          status: "PAYMENT_FAILED",
          failureNotificationSent: true,
          paymentFailedAt: new Date().toISOString(),
        });

        // Wyślij e-mail o braku płatności do sprzedawcy
        const unpaidEmailPayload = {
          sender: { name: "MałeNaklejki – Alert płatności", email: siteFromEmail },
          to: [{ email: adminEmail, name: "MałeNaklejki – Sprzedawca" }],
          subject: `⚠️ Brak płatności dla zamówienia ${order.orderNumber} (${order.totals.total.toFixed(2).replace('.', ',')} zł)`,
          htmlContent: buildUnpaidOrderSellerEmailHtml(order, order.orderNumber),
        };
        await sendEmail(unpaidEmailPayload);
      }
    }

    return NextResponse.json({ success: true, processedCount: unpaidOrders.length });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
