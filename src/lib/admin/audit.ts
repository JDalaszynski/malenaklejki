import "server-only";

import { db } from "@/lib/firebase/admin";

export type AuditEntry = {
  id: string;
  at: string;
  actorEmail: string;
  action: string;
  orderId: string | null;
  orderNumber: string | null;
  details: string;
};

/**
 * Dziennik zmian w panelu.
 *
 * Przy raportach księgowych możliwość odtworzenia „kto, kiedy i co zmienił"
 * bywa jedyną drogą do wyjaśnienia rozjazdu kwot — dlatego każda operacja
 * administratora zostawia tu ślad, także zmiana statusu i usunięcie.
 */
export async function recordAudit(entry: {
  actorEmail: string;
  action: string;
  orderId?: string | null;
  orderNumber?: string | null;
  details?: string;
}): Promise<void> {
  try {
    await db.collection("auditLog").add({
      at: new Date().toISOString(),
      actorEmail: entry.actorEmail,
      action: entry.action,
      orderId: entry.orderId ?? null,
      orderNumber: entry.orderNumber ?? null,
      details: entry.details ?? "",
    });
  } catch (error) {
    console.error("recordAudit error:", error);
  }
}

export async function listAuditForOrder(orderId: string, limit = 50): Promise<AuditEntry[]> {
  try {
    const snapshot = await db
      .collection("auditLog")
      .where("orderId", "==", orderId)
      .limit(limit)
      .get();

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AuditEntry, "id">) }))
      .sort((a, b) => b.at.localeCompare(a.at));
  } catch (error) {
    console.error("listAuditForOrder error:", error);
    return [];
  }
}

/** Czytelny opis różnicy między starą a nową wartością pola. */
export function describeChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  labels: Record<string, string>
): string {
  const parts: string[] = [];
  for (const [key, label] of Object.entries(labels)) {
    const from = before[key];
    const to = after[key];
    if (to === undefined) continue;
    if (JSON.stringify(from) === JSON.stringify(to)) continue;
    parts.push(`${label}: „${from ?? "—"}" → „${to ?? "—"}"`);
  }
  return parts.join("; ");
}
