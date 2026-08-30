import "server-only";

import { db } from "@/lib/firebase/admin";
import { buildCustomerEmailHtml, buildSellerEmailHtml, buildOrderAttachments } from "@/lib/emails";
import { sendTransactionalEmail } from "@/lib/email/auth";
import { buildVacationEmailNotice } from "@/lib/settings/vacationEmail";
import { getVacationSettingsFresh } from "@/lib/settings/vacationStore";

/**
 * Powiadomienia wysyłane po zaksięgowaniu płatności.
 *
 * Ta sama ścieżka obsługuje webhook Przelewy24 i ręczne oznaczenie zamówienia
 * jako opłacone w panelu — dzięki temu przelew tradycyjny i zamówienia dodane
 * ręcznie kończą się dokładnie tym samym zestawem wiadomości co płatność online.
 *
 * Wiadomość do sprzedawcy jest tu najważniejsza — bez niej zamówienie wygląda
 * na nieopłacone, mimo że pieniądze doszły. Dlatego każdy wcześniejszy krok
 * (ustawienia przerwy, mail do klienta, budowanie załączników) jest osobno
 * zabezpieczony: jego awaria nie może zabrać maila sprzedawcy.
 */
export async function sendPaidOrderNotifications(
  order: FirebaseFirestore.DocumentData,
  options: { orderId: string; withAttachments?: boolean }
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  // Gość dostaje w potwierdzeniu propozycję zamiany zamówienia w konto.
  const claimUrl = order.userId
    ? undefined
    : `${appUrl}/zamowienie-sukces?orderNumber=${encodeURIComponent(order.orderNumber)}&orderId=${options.orderId}&konto=1`;

  if (order.customer?.email) {
    try {
      let vacationNotice = "";
      try {
        vacationNotice = buildVacationEmailNotice(await getVacationSettingsFresh());
      } catch (error) {
        console.error("Powiadomienia: nie udało się odczytać ustawień przerwy:", error);
      }

      await sendTransactionalEmail({
        sender: { name: "MałeNaklejki", email: adminEmail },
        to: [
          {
            email: order.customer.email,
            name: `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim(),
          },
        ],
        subject: `Opłacono zamówienie ${order.orderNumber} - MałeNaklejki`,
        htmlContent: buildCustomerEmailHtml(order, order.orderNumber, claimUrl, vacationNotice),
      });
    } catch (error) {
      console.error(`Powiadomienia: mail do klienta (${order.orderNumber}) nie poszedł:`, error);
    }
  }

  const sellerPayload: Record<string, unknown> = {
    sender: { name: "MałeNaklejki - System zamówień", email: adminEmail },
    to: [{ email: adminEmail, name: "MałeNaklejki - Sprzedawca" }],
    subject: `🛒 Zamówienie OPŁACONE ${order.orderNumber} - ${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""} (${(order.totals?.total ?? 0).toFixed(2).replace(".", ",")} zł)`,
    htmlContent: buildSellerEmailHtml(order, order.orderNumber),
  };

  if (options.withAttachments !== false) {
    try {
      const attachments = await buildOrderAttachments(order.items ?? [], order.orderNumber);
      if (attachments.length > 0) sellerPayload.attachment = attachments;
    } catch (error) {
      // Arkusze da się pobrać z panelu — mail o płatności ma dojść tak czy tak.
      console.error(`Powiadomienia: załączniki do ${order.orderNumber} nie powstały:`, error);
    }
  }

  const sent = await sendTransactionalEmail(sellerPayload);
  if (sent) await markPaidNotificationsSent(options.orderId);
}

/**
 * Znacznik wysłanego powiadomienia o płatności. Po nim cron poznaje zamówienia,
 * przy których webhook zdążył ustawić PAID, ale przerwał się przed mailami.
 */
async function markPaidNotificationsSent(orderId: string): Promise<void> {
  try {
    await db
      .collection("orders")
      .doc(String(orderId))
      .update({ paidNotificationsSentAt: new Date().toISOString() });
  } catch (error) {
    console.error(`Powiadomienia: nie zapisano znacznika przy ${orderId}:`, error);
  }
}
