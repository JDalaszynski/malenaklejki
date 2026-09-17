import "server-only";

import { db } from "@/lib/firebase/admin";
import { buildOrderInProgressEmailHtml, buildOrderShippedEmailHtml } from "@/lib/emails";
import { sendTransactionalEmail } from "@/lib/email/auth";

/**
 * Maile do klienta o postępie realizacji. Wysyła je wyłącznie sprzedawca
 * z panelu — przy zmianie statusu albo przyciskiem — nigdy automat.
 *
 * Rodzaj maila to zarazem status realizacji, przy którym mail ma sens.
 */
export type StatusEmailKind = "IN_PRODUCTION" | "SHIPPED";

/** Pole zamówienia z datą ostatniej wysyłki danego maila. */
export const STATUS_EMAIL_SENT_FIELD: Record<StatusEmailKind, string> = {
  IN_PRODUCTION: "inProductionEmailSentAt",
  SHIPPED: "shippedEmailSentAt",
};

export const STATUS_EMAIL_LABEL: Record<StatusEmailKind, string> = {
  IN_PRODUCTION: "Realizujemy Twoje zamówienie",
  SHIPPED: "Wysłane",
};

export type StatusEmailResult = { ok: true; sentAt: string } | { ok: false; error: string };

export async function sendOrderStatusEmail(
  kind: StatusEmailKind,
  order: FirebaseFirestore.DocumentData,
  orderId: string
): Promise<StatusEmailResult> {
  const email: string | undefined = order.customer?.email;
  if (!email) return { ok: false, error: "Zamówienie nie ma adresu e-mail klienta." };

  const adminEmail = process.env.ADMIN_EMAIL || "kontakt@malenaklejki.pl";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  // Gość nie ma konta, więc link do szczegółów zamówienia prowadziłby do logowania donikąd.
  const orderUrl = order.userId ? `${appUrl}/konto/zamowienia/${orderId}` : undefined;

  const subject =
    kind === "IN_PRODUCTION"
      ? `Realizujemy Twoje zamówienie ${order.orderNumber} - MałeNaklejki`
      : `Wysłaliśmy Twoje zamówienie ${order.orderNumber} - MałeNaklejki`;

  const htmlContent =
    kind === "IN_PRODUCTION"
      ? buildOrderInProgressEmailHtml(order, order.orderNumber, orderUrl)
      : buildOrderShippedEmailHtml(order, order.orderNumber, {
          trackingUrl: order.trackingUrl,
          trackingNumber: order.trackingNumber,
          orderUrl,
        });

  const sent = await sendTransactionalEmail({
    sender: { name: "MałeNaklejki", email: adminEmail },
    to: [
      {
        email,
        name: `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim() || email,
      },
    ],
    subject,
    htmlContent,
  });
  if (!sent) return { ok: false, error: "Brevo nie przyjął wiadomości. Sprawdź logi." };

  const sentAt = new Date().toISOString();
  try {
    await db.collection("orders").doc(orderId).update({ [STATUS_EMAIL_SENT_FIELD[kind]]: sentAt });
  } catch (error) {
    // Mail już wyszedł — brak daty w panelu nie może udawać, że wysyłka padła.
    console.error(`Maile o statusie: nie zapisano daty wysyłki przy ${orderId}:`, error);
  }
  return { ok: true, sentAt };
}
