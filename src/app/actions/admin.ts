"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/admin/audit";
import { zonedBoundary } from "@/lib/admin/filters";
import { deleteOrderLayouts } from "@/lib/orders/layout";
import { sweepAbandonedOrders } from "@/lib/orders/sweep";
import { sendPaidOrderNotifications } from "@/lib/orders/notifications";
import { issueInvoiceForOrder, issueInvoiceForOrderSafely } from "@/lib/orders/invoicing";
import { sendOrderToBaseLinker } from "@/lib/baselinker";
import { FULFILLMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/orders/status";

type Result<T = object> = ({ success: true } & T) | { success: false; error: string };

/**
 * Każda akcja panelu sprawdza uprawnienia samodzielnie.
 *
 * Akcje serwerowe są wystawione pod własnymi adresami i można je wywołać
 * z pominięciem interfejsu, więc ukrycie przycisku niczego nie zabezpiecza.
 */
async function requireAdminActor(): Promise<{ email: string } | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { email: session.email ?? "administrator" };
}

const DENIED = { success: false, error: "Brak uprawnień." } as const;

function refreshAdminViews(orderId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/kosz");
  revalidatePath("/admin/raporty");
  revalidatePath("/admin/statystyki");
  if (orderId) revalidatePath(`/admin/zamowienia/${orderId}`);
}

/* ------------------------------------------------------------------ */
/* Statusy                                                             */
/* ------------------------------------------------------------------ */

const statusSchema = z.object({
  orderId: z.string().min(1).max(128),
  status: z.enum(Object.keys(PAYMENT_STATUSES) as [string, ...string[]]).optional(),
  fulfillmentStatus: z
    .enum(Object.keys(FULFILLMENT_STATUSES) as [string, ...string[]])
    .optional(),
  trackingNumber: z.string().max(100).optional(),
  notify: z.boolean().default(false),
});

export async function updateOrderStatus(raw: unknown): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = statusSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Błędne dane." };
  const input = parsed.data;

  const ref = db.collection("orders").doc(input.orderId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  const before = snapshot.data()!;
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  const changes: string[] = [];

  if (input.status && input.status !== before.status) {
    update.status = input.status;
    update["payment.status"] = input.status;
    changes.push(`płatność: ${before.status} → ${input.status}`);

    if (input.status === "PAID") {
      if (!before.paidAt) update.paidAt = new Date().toISOString();
      // Ręczne oznaczenie zapłaty też wyjmuje zamówienie z kosza — inaczej
      // zamówienie sprzątnięte jako nieopłacone zostałoby poza ewidencją.
      if (before.deletedAt) {
        update.deletedAt = null;
        changes.push("przywrócone z kosza (zaksięgowano płatność)");
      }
    }
  }

  if (input.fulfillmentStatus && input.fulfillmentStatus !== before.fulfillmentStatus) {
    update.fulfillmentStatus = input.fulfillmentStatus;
    changes.push(`realizacja: ${before.fulfillmentStatus ?? "NEW"} → ${input.fulfillmentStatus}`);
  }

  if (input.trackingNumber !== undefined && input.trackingNumber !== before.trackingNumber) {
    update.trackingNumber = input.trackingNumber || null;
    changes.push(`przesyłka: ${before.trackingNumber ?? "—"} → ${input.trackingNumber || "—"}`);
  }

  if (changes.length === 0) return { success: true };

  await ref.update(update);
  const after = { ...before, ...update, id: input.orderId };

  // Oznaczenie zapłaty musi dojść tam, gdzie dochodzi po płatności online:
  // do klienta i do sprzedawcy z plikami. BaseLinker celowo zostaje z płatnością
  // nieustawioną — tam wpłatę księguje sprzedawca ręcznie.
  if (update.status === "PAID") {
    // Faktura w inFakcie powstaje niezależnie od powiadomień — przelew tradycyjny
    // i sprzedaż dopisana ręcznie mają trafić do księgowości tak samo jak płatność online.
    await issueInvoiceForOrderSafely(input.orderId);

    if (input.notify) {
      try {
        await sendPaidOrderNotifications(after, { orderId: input.orderId });
      } catch (error) {
        console.error("updateOrderStatus notifications error:", error);
      }
    }
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Zmiana statusu",
    orderId: input.orderId,
    orderNumber: before.orderNumber,
    details: changes.join("; ") + (input.notify ? " (wysłano powiadomienia)" : ""),
  });

  refreshAdminViews(input.orderId);
  return { success: true };
}

/**
 * Ponowna wysyłka powiadomień o płatności dla zamówienia, które jest już
 * PAID w bazie — np. gdy webhook P24 ustawił status, ale mail nie doszedł
 * (padła wysyłka albo funkcja została ubita w trakcie). `updateOrderStatus`
 * tego nie obsługuje: pomija zapis, gdy status się nie zmienia, więc dla
 * zamówienia już oznaczonego jako opłacone nie ma jak ponowić maili.
 */
export async function resendPaidOrderNotifications(orderId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ref = db.collection("orders").doc(orderId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  const data = snapshot.data()!;
  const order = { ...data, id: orderId };
  if (data.status !== "PAID") {
    return { success: false, error: "Zamówienie nie jest oznaczone jako opłacone." };
  }

  try {
    await sendPaidOrderNotifications(order, { orderId });
  } catch (error) {
    console.error("resendPaidOrderNotifications error:", error);
    return { success: false, error: "Wysyłka nie powiodła się. Sprawdź logi." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Ponowna wysyłka powiadomień o płatności",
    orderId,
    orderNumber: data.orderNumber,
  });

  refreshAdminViews(orderId);
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Edycja danych zamówienia                                            */
/* ------------------------------------------------------------------ */

const itemSchema = z.object({
  id: z.string().max(128).optional(),
  name: z.string().min(1).max(300),
  sheetQuantity: z.coerce.number().int().min(1).max(10000),
  pricePerSheet: z.coerce.number().min(0).max(100000),
  taxRate: z.coerce.number().min(0).max(100),
});

const editSchema = z.object({
  orderId: z.string().min(1).max(128),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100),
  email: z.string().email().max(254),
  phone: z.string().trim().max(30),
  deliveryMethod: z.string().max(40),
  street: z.string().trim().max(100),
  building: z.string().trim().max(20),
  postalCode: z.string().trim().max(20),
  city: z.string().trim().max(100),
  lockerId: z.string().trim().max(100),
  lockerAddress: z.string().trim().max(250),
  wantsInvoice: z.boolean(),
  nip: z.string().trim().max(20),
  companyName: z.string().trim().max(200),
  paymentMethod: z.string().max(40),
  shipping: z.coerce.number().min(0).max(10000),
  internalNote: z.string().max(2000),
  items: z.array(itemSchema).min(1).max(100),
});

export async function updateOrder(raw: unknown): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = editSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane." };
  }
  const input = parsed.data;

  const ref = db.collection("orders").doc(input.orderId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };
  const before = snapshot.data()!;

  const subtotal =
    Math.round(
      input.items.reduce((sum, item) => sum + item.pricePerSheet * item.sheetQuantity, 0) * 100
    ) / 100;
  const total = Math.round((subtotal + input.shipping) * 100) / 100;

  // Obrazy i układy arkuszy zostają nietknięte — panel edytuje dane zamówienia,
  // nigdy plików produkcyjnych.
  const existingItems: Record<string, unknown>[] = before.items ?? [];
  const items = input.items.map((item, index) => {
    const original = existingItems.find((candidate) => candidate.id === item.id) ?? {};
    return {
      ...original,
      id: item.id || `pozycja-${index + 1}`,
      name: item.name,
      sheetQuantity: item.sheetQuantity,
      pricePerSheet: item.pricePerSheet,
      taxRate: item.taxRate,
    };
  });

  await ref.update({
    customer: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    },
    customerEmailLower: input.email.toLowerCase().trim(),
    delivery: {
      method: input.deliveryMethod,
      courierDetails:
        input.deliveryMethod === "kurier"
          ? {
              street: input.street,
              building: input.building,
              postalCode: input.postalCode,
              city: input.city,
            }
          : null,
      paczkomatDetails:
        input.deliveryMethod === "paczkomat"
          ? { lockerId: input.lockerId, address: input.lockerAddress }
          : null,
    },
    billing: {
      wantsInvoice: input.wantsInvoice,
      nip: input.wantsInvoice ? input.nip : null,
      companyName: input.wantsInvoice ? input.companyName : null,
    },
    "payment.method": input.paymentMethod,
    paymentMethod: input.paymentMethod,
    items,
    totals: { subtotal, shipping: input.shipping, total },
    internalNote: input.internalNote || null,
    updatedAt: new Date().toISOString(),
  });

  await recordAudit({
    actorEmail: actor.email,
    action: "Edycja zamówienia",
    orderId: input.orderId,
    orderNumber: before.orderNumber,
    details:
      before.totals?.total !== total
        ? `kwota: ${(before.totals?.total ?? 0).toFixed(2)} zł → ${total.toFixed(2)} zł`
        : "zmiana danych zamówienia",
  });

  refreshAdminViews(input.orderId);
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Kosz                                                                */
/* ------------------------------------------------------------------ */

export async function moveOrderToTrash(orderId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  await ref.update({ deletedAt: new Date().toISOString() });
  await recordAudit({
    actorEmail: actor.email,
    action: "Przeniesienie do kosza",
    orderId: String(orderId),
    orderNumber: snapshot.data()?.orderNumber,
  });

  refreshAdminViews(String(orderId));
  return { success: true };
}

export async function restoreOrder(orderId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  await ref.update({ deletedAt: null });
  await recordAudit({
    actorEmail: actor.email,
    action: "Przywrócenie z kosza",
    orderId: String(orderId),
    orderNumber: snapshot.data()?.orderNumber,
  });

  refreshAdminViews(String(orderId));
  return { success: true };
}

/**
 * Trwałe usunięcie — tylko z kosza i tylko po przepisaniu numeru zamówienia.
 * Dwa kroki, bo tej operacji nie da się cofnąć, a usunięte zamówienie znika
 * również z ewidencji sprzedaży.
 */
export async function deleteOrderPermanently(input: {
  orderId: string;
  confirmOrderNumber: string;
}): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ref = db.collection("orders").doc(String(input?.orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  const order = snapshot.data()!;
  if (!order.deletedAt) {
    return { success: false, error: "Najpierw przenieś zamówienie do kosza." };
  }
  if (order.orderNumber !== input?.confirmOrderNumber) {
    return { success: false, error: "Numer zamówienia nie zgadza się." };
  }

  await deleteOrderLayouts(String(input.orderId));
  await ref.delete();

  await recordAudit({
    actorEmail: actor.email,
    action: "Trwałe usunięcie",
    orderId: null,
    orderNumber: order.orderNumber,
    details: `kwota ${(order.totals?.total ?? 0).toFixed(2)} zł, klient ${order.customer?.email ?? "—"}`,
  });

  refreshAdminViews();
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Ręczne dodanie zamówienia                                           */
/* ------------------------------------------------------------------ */

const manualSchema = editSchema.omit({ orderId: true }).extend({
  source: z.string().max(40),
  status: z.enum(Object.keys(PAYMENT_STATUSES) as [string, ...string[]]),
  createdAt: z.string().max(30),
  paidAt: z.string().max(30).optional(),
});

function generateOrderNumber(): string {
  const now = new Date();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `MNK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${suffix}`;
}

export async function createManualOrder(raw: unknown): Promise<Result<{ orderId: string }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = manualSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane." };
  }
  const input = parsed.data;

  const subtotal =
    Math.round(
      input.items.reduce((sum, item) => sum + item.pricePerSheet * item.sheetQuantity, 0) * 100
    ) / 100;
  const total = Math.round((subtotal + input.shipping) * 100) / 100;

  const ref = db.collection("orders").doc();
  const orderNumber = generateOrderNumber();

  await ref.set({
    id: ref.id,
    orderNumber,
    source: input.source || "manual",
    status: input.status,
    fulfillmentStatus: "NEW",
    userId: null,
    customerEmailLower: input.email.toLowerCase().trim(),
    deletedAt: null,
    createdAt: new Date(input.createdAt).toISOString(),
    paidAt: input.status === "PAID" ? new Date(input.paidAt || input.createdAt).toISOString() : null,
    customer: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    },
    delivery: {
      method: input.deliveryMethod,
      courierDetails:
        input.deliveryMethod === "kurier"
          ? {
              street: input.street,
              building: input.building,
              postalCode: input.postalCode,
              city: input.city,
            }
          : null,
      paczkomatDetails:
        input.deliveryMethod === "paczkomat"
          ? { lockerId: input.lockerId, address: input.lockerAddress }
          : null,
    },
    billing: {
      wantsInvoice: input.wantsInvoice,
      nip: input.wantsInvoice ? input.nip : null,
      companyName: input.wantsInvoice ? input.companyName : null,
    },
    payment: { method: input.paymentMethod, status: input.status },
    paymentMethod: input.paymentMethod,
    items: input.items.map((item, index) => ({
      id: item.id || `pozycja-${index + 1}`,
      name: item.name,
      sheetQuantity: item.sheetQuantity,
      pricePerSheet: item.pricePerSheet,
      taxRate: item.taxRate,
      imageUrl: "",
      deliveryForm: "sheet",
      layoutPath: null,
    })),
    totals: { subtotal, shipping: input.shipping, total },
    internalNote: input.internalNote || null,
  });

  // Zamówienie dodane ręcznie jako opłacone też ma swoją fakturę.
  if (input.status === "PAID") await issueInvoiceForOrderSafely(ref.id);

  await recordAudit({
    actorEmail: actor.email,
    action: "Ręczne dodanie zamówienia",
    orderId: ref.id,
    orderNumber,
    details: `${total.toFixed(2)} zł, źródło: ${input.source || "manual"}`,
  });

  refreshAdminViews(ref.id);
  return { success: true, orderId: ref.id };
}

/* ------------------------------------------------------------------ */
/* Integracje                                                          */
/* ------------------------------------------------------------------ */

/** Wysyła zamówienie do BaseLinkera na żądanie — np. dodane ręcznie w panelu. */
export async function pushOrderToBaseLinker(orderId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Zamówienie nie istnieje." };

  const order = snapshot.data()!;
  if (order.baselinkerOrderId) {
    return { success: false, error: "To zamówienie jest już w BaseLinkerze." };
  }

  const result = await sendOrderToBaseLinker(order);
  if (result?.status !== "SUCCESS") {
    return { success: false, error: result?.error_message || "BaseLinker odrzucił zamówienie." };
  }

  await ref.update({ baselinkerOrderId: result.order_id });
  await recordAudit({
    actorEmail: actor.email,
    action: "Wysyłka do BaseLinkera",
    orderId: String(orderId),
    orderNumber: order.orderNumber,
    details: `ID w BaseLinkerze: ${result.order_id}`,
  });

  refreshAdminViews(String(orderId));
  return { success: true };
}

/** Wystawia fakturę na żądanie — po nieudanej próbie automatycznej. */
export async function issueOrderInvoice(orderId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const result = await issueInvoiceForOrder(String(orderId), { force: true });
  if (!result.ok) {
    return { success: false, error: result.error ?? "Nie udało się wystawić faktury." };
  }

  const snapshot = await db.collection("orders").doc(String(orderId)).get();
  await recordAudit({
    actorEmail: actor.email,
    action: "Wystawienie faktury (inFakt)",
    orderId: String(orderId),
    orderNumber: snapshot.data()?.orderNumber,
    details: result.skipped
      ? `Faktura już istniała: ${result.number ?? "brak numeru"}`
      : `Numer faktury: ${result.number ?? "nieznany"}`,
  });

  refreshAdminViews(String(orderId));
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Sprzedaż poza sklepem                                               */
/* ------------------------------------------------------------------ */

const manualSaleSchema = z.object({
  /** Dzień sprzedaży w formacie z pola `<input type="date">`. */
  soldOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Podaj datę sprzedaży"),
  sheets: z.coerce.number().int().min(1, "Podaj liczbę arkuszy").max(10000),
  /** Kwota brutto jest wymagana — bez niej nie policzymy zysku z wpisu. */
  amount: z.coerce.number().gt(0, "Podaj kwotę brutto").max(1000000),
  note: z.string().trim().max(200).default(""),
});

/**
 * Dopisuje sprzedaż, która ominęła sklep — mailem, z ręki, przez znajomych.
 *
 * Trzymamy ją w osobnej kolekcji, nie jako zamówienie: nie ma klienta, adresu
 * ani plików do druku, a wrzucona do `orders` zaśmiecałaby listę zamówień
 * i ewidencję sprzedaży. Statystyki dolewają ją do arkuszy ze sklepu.
 */
export async function addManualSale(raw: unknown): Promise<Result<{ id: string }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = manualSaleSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Błędne dane." };
  }
  const input = parsed.data;

  const [year, month, day] = input.soldOn.split("-").map(Number);
  // Zapisujemy początek wybranego dnia w czasie warszawskim. Bez tego sprzedaż
  // z pierwszego dnia miesiąca potrafiłaby wpaść do miesiąca poprzedniego.
  const soldAt = zonedBoundary(year, month, day);

  const ref = await db.collection("manualSales").add({
    soldAt,
    sheets: input.sheets,
    amount: Math.round(input.amount * 100) / 100,
    note: input.note,
    createdBy: actor.email,
    createdAt: new Date().toISOString(),
  });

  await recordAudit({
    actorEmail: actor.email,
    action: "Dopisanie sprzedaży poza sklepem",
    details: `${input.sheets} ark. z dnia ${input.soldOn}${
      input.amount ? `, ${input.amount.toFixed(2)} zł` : ""
    }${input.note ? `, ${input.note}` : ""}`,
  });

  refreshAdminViews();
  return { success: true, id: ref.id };
}

/** Kasuje ręczny wpis — pomyłkę prościej usunąć niż poprawiać. */
export async function deleteManualSale(saleId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = z.string().min(1).max(128).safeParse(saleId);
  if (!parsed.success) return { success: false, error: "Błędne dane." };

  const ref = db.collection("manualSales").doc(parsed.data);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Ten wpis już nie istnieje." };

  const before = snapshot.data()!;
  await ref.delete();

  await recordAudit({
    actorEmail: actor.email,
    action: "Usunięcie sprzedaży poza sklepem",
    details: `${before.sheets ?? 0} ark. z dnia ${String(before.soldAt ?? "").slice(0, 10)}`,
  });

  refreshAdminViews();
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Sprzątanie porzuconych zamówień                                     */
/* ------------------------------------------------------------------ */

/**
 * Przenosi do kosza zamówienia, które czekają na płatność dłużej niż tydzień
 * i nie mają wybranej formy płatności (próg: ABANDONED_AFTER_DAYS).
 *
 * Docelowo robi to zadanie cykliczne (`/api/cron/check-unpaid-orders`), ale
 * dopóki nie ma harmonogramu, ten przycisk pozwala uruchomić sprzątanie ręcznie.
 */
export async function runAbandonedSweep(): Promise<Result<{ moved: number }>> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const result = await sweepAbandonedOrders({ actorEmail: actor.email });
  refreshAdminViews();
  return { success: true, moved: result.moved };
}
