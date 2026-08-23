"use server";

import { z } from "zod";
import { timingSafeEqual } from "crypto";

import { db } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/dal";
import { consumeRateLimit, formatRetryAfter } from "@/lib/auth/rateLimit";
import { createAccountFromOrder } from "@/lib/auth/accountFromOrder";
import { headers } from "next/headers";

type Result = { success: true; email: string } | { success: false; error: string };

const schema = z.object({
  orderId: z.string().min(1).max(128),
  orderNumber: z.string().min(1).max(64),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .max(200)
    .refine((v) => /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(v), "Hasło musi zawierać literę")
    .refine((v) => /[0-9]/.test(v), "Hasło musi zawierać cyfrę"),
  marketingConsent: z.boolean().default(false),
});

function sameOrderNumber(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Zamienia zamówienie złożone bez logowania w konto — gość ustawia tylko hasło,
 * resztę danych bierzemy z samego zamówienia.
 *
 * Dostęp potwierdza znajomość pary identyfikator + numer zamówienia, czyli tego,
 * co gość ma w adresie ekranu podziękowania i w mailu. Konto powstaje jako
 * niepotwierdzone, więc do czasu kliknięcia w link z maila nie odsłania
 * żadnych danych ani wcześniejszych zamówień.
 */
export async function claimOrderAccount(raw: unknown): Promise<Result> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane" };
  }
  const input = parsed.data;

  const headersList = await headers();
  const ip = (headersList.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const limit = await consumeRateLimit(`claim:${ip}`, 5, 60 * 60 * 1000, true);
  if (!limit.ok) {
    return { success: false, error: `Zbyt wiele prób. Spróbuj ${formatRetryAfter(limit.retryAfterMs)}.` };
  }

  const session = await getSession();
  if (session) return { success: false, error: "Jesteś już zalogowany." };

  const snapshot = await db.collection("orders").doc(input.orderId).get();
  if (!snapshot.exists) return { success: false, error: "Nie znaleźliśmy tego zamówienia." };

  const order = snapshot.data()!;
  if (!sameOrderNumber(order.orderNumber ?? "", input.orderNumber)) {
    return { success: false, error: "Nie znaleźliśmy tego zamówienia." };
  }
  if (order.userId) {
    return { success: false, error: "To zamówienie jest już przypisane do konta. Zaloguj się." };
  }

  const email: string = (order.customer?.email ?? "").toLowerCase().trim();
  if (!email) return { success: false, error: "To zamówienie nie ma adresu e-mail." };

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
  const created = await createAccountFromOrder(order, input.password, input.marketingConsent, appUrl);

  if (!created.ok) {
    return { success: false, error: created.message };
  }

  // To jedno zamówienie przypisujemy od razu — gość właśnie udowodnił, że jest
  // jego właścicielem. Pozostałe dołączą po potwierdzeniu adresu e-mail.
  await snapshot.ref.update({ userId: created.uid, linkedAt: new Date().toISOString() });

  return { success: true, email: created.email };
}
