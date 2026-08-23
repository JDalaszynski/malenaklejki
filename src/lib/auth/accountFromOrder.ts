import "server-only";

import { FirebaseAuthError } from "firebase-admin/auth";

import { adminAuth, db } from "@/lib/firebase/admin";
import { sendVerificationEmail } from "@/lib/email/auth";

export type AccountFromOrderResult =
  | { ok: true; uid: string; email: string }
  | { ok: false; reason: "exists" | "invalid" | "error"; message: string };

/**
 * Zakłada konto na podstawie zamówienia — profil wypełniamy danymi, które gość
 * i tak właśnie podał, więc jedyne, o co go prosimy, to hasło.
 *
 * Używane w dwóch miejscach: przy zaznaczeniu „załóż konto" w formularzu
 * zamówienia i na ekranie podziękowania. Logika jest wspólna, żeby oba wejścia
 * tworzyły dokładnie taki sam profil.
 */
export async function createAccountFromOrder(
  order: FirebaseFirestore.DocumentData,
  password: string,
  marketingConsent: boolean,
  appUrl: string
): Promise<AccountFromOrderResult> {
  const email: string = (order.customer?.email ?? "").toLowerCase().trim();
  if (!email) return { ok: false, reason: "invalid", message: "Zamówienie nie ma adresu e-mail." };

  try {
    const record = await adminAuth.createUser({
      email,
      password,
      displayName:
        `${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim() || undefined,
      emailVerified: false,
    });

    const courier = order.delivery?.courierDetails;
    const locker = order.delivery?.paczkomatDetails;

    await db.collection("users").doc(record.uid).set({
      uid: record.uid,
      email,
      firstName: order.customer?.firstName ?? "",
      lastName: order.customer?.lastName ?? "",
      phone: order.customer?.phone ?? "",
      marketingConsent,
      defaultAddress: courier?.street
        ? {
            street: courier.street ?? "",
            building: courier.building ?? "",
            postalCode: courier.postalCode ?? "",
            city: courier.city ?? "",
          }
        : null,
      defaultLocker: locker?.lockerId
        ? { lockerId: locker.lockerId, address: locker.address ?? "" }
        : null,
      invoiceDetails: order.billing?.nip
        ? { companyName: order.billing.companyName ?? "", nip: order.billing.nip }
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ordersLinkedAt: null,
    });

    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: `${appUrl}/konto?powitanie=1`,
      handleCodeInApp: false,
    });
    await sendVerificationEmail(email, order.customer?.firstName ?? "", link);

    return { ok: true, uid: record.uid, email };
  } catch (error) {
    if (error instanceof FirebaseAuthError && error.code === "auth/email-already-exists") {
      return {
        ok: false,
        reason: "exists",
        message: "Konto na ten adres już istnieje. Zaloguj się — zamówienie dołączy automatycznie.",
      };
    }
    console.error("createAccountFromOrder error:", error);
    return { ok: false, reason: "error", message: "Nie udało się założyć konta." };
  }
}
