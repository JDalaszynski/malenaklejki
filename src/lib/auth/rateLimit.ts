import "server-only";

import { createHash } from "crypto";
import { db } from "@/lib/firebase/admin";

export type RateLimitResult = {
  ok: boolean;
  /** Ile milisekund pozostało do zresetowania licznika. */
  retryAfterMs: number;
};

/**
 * Licznik prób trzymany w Firestore.
 *
 * Wariant z pamięci procesu (src/lib/utils/rateLimit.ts) nie działa na Vercelu:
 * każde żądanie może trafić do nowej instancji funkcji, więc licznik startuje
 * od zera. Przy formularzu kontaktowym to tylko niedoskonałość, ale przy
 * logowaniu oznaczałoby brak jakiegokolwiek limitu prób zgadywania hasła.
 *
 * @param failClosed przy niedostępnej bazie: `true` blokuje operację
 *   (używane przy logowaniu i resecie hasła), `false` przepuszcza ją.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  failClosed = false
): Promise<RateLimitResult> {
  const docId = createHash("sha256").update(key).digest("hex");
  const ref = db.collection("rateLimits").doc(docId);

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const now = Date.now();
      const data = snap.exists ? (snap.data() as { count: number; resetAt: number }) : null;

      if (!data || now >= data.resetAt) {
        tx.set(ref, {
          count: 1,
          resetAt: now + windowMs,
          // Pole pod politykę TTL Firestore — stare liczniki znikają same.
          expiresAt: new Date(now + windowMs + 24 * 60 * 60 * 1000),
        });
        return { ok: true, retryAfterMs: windowMs };
      }

      if (data.count >= limit) {
        return { ok: false, retryAfterMs: data.resetAt - now };
      }

      tx.update(ref, { count: data.count + 1 });
      return { ok: true, retryAfterMs: data.resetAt - now };
    });
  } catch (error) {
    console.error("consumeRateLimit error:", error);
    return { ok: !failClosed, retryAfterMs: 0 };
  }
}

/** Zeruje licznik — wywoływane po udanym logowaniu. */
export async function resetRateLimit(key: string): Promise<void> {
  const docId = createHash("sha256").update(key).digest("hex");
  try {
    await db.collection("rateLimits").doc(docId).delete();
  } catch (error) {
    console.error("resetRateLimit error:", error);
  }
}

export function formatRetryAfter(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 1) return "za chwilę";
  if (minutes < 60) return `za ${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return `za ${hours} godz.`;
}
