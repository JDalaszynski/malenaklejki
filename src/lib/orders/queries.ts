import "server-only";

import { db } from "@/lib/firebase/admin";

export type CustomerOrderItem = {
  id: string;
  imageUrl: string;
  widthCm: number;
  heightCm: number;
  stickersPerSheet: number;
  sheetQuantity: number;
  pricePerSheet: number;
  deliveryForm: "sheet" | "individual";
  /** Czy da się otworzyć ten arkusz w kreatorze (zamówienia sprzed wdrożenia go nie mają). */
  editable: boolean;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  paidAt: string | null;
  status: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  invoiceUrl: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  delivery: {
    street?: string;
    building?: string;
    city?: string;
    postalCode?: string;
    lockerId?: string;
    lockerAddress?: string;
  };
  billing: { wantsInvoice: boolean; nip: string | null; companyName: string | null };
  customer: { firstName: string; lastName: string; email: string; phone: string };
  totals: { subtotal: number; shipping: number; total: number };
  items: CustomerOrderItem[];
};

/**
 * Zamienia dokument z bazy na dane pokazywane klientowi.
 *
 * Celowo nie przepuszczamy tu całego dokumentu: plik produkcyjny z liniami
 * cięcia (`cutLinesImageUrl`), ścieżki do układów, identyfikatory BaseLinkera
 * i notatki wewnętrzne zostają po stronie serwera.
 */
function toCustomerOrder(id: string, data: FirebaseFirestore.DocumentData): CustomerOrder {
  const courier = data.delivery?.courierDetails ?? {};
  const locker = data.delivery?.paczkomatDetails ?? {};

  return {
    id,
    orderNumber: data.orderNumber ?? id,
    createdAt: data.createdAt ?? "",
    paidAt: data.paidAt ?? null,
    status: data.status ?? "PENDING_PAYMENT",
    fulfillmentStatus: data.fulfillmentStatus ?? "NEW",
    trackingNumber: data.trackingNumber ?? null,
    invoiceUrl: data.invoiceUrl ?? null,
    paymentMethod: data.payment?.method ?? data.paymentMethod ?? "",
    deliveryMethod: data.delivery?.method ?? "",
    delivery: {
      street: courier.street,
      building: courier.building,
      city: courier.city,
      postalCode: courier.postalCode,
      lockerId: locker.lockerId,
      lockerAddress: locker.address,
    },
    billing: {
      wantsInvoice: Boolean(data.billing?.wantsInvoice),
      nip: data.billing?.nip ?? null,
      companyName: data.billing?.companyName ?? null,
    },
    customer: {
      firstName: data.customer?.firstName ?? "",
      lastName: data.customer?.lastName ?? "",
      email: data.customer?.email ?? "",
      phone: data.customer?.phone ?? "",
    },
    totals: {
      subtotal: data.totals?.subtotal ?? 0,
      shipping: data.totals?.shipping ?? 0,
      total: data.totals?.total ?? 0,
    },
    items: (data.items ?? []).map((item: Record<string, unknown>, index: number) => ({
      id: (item.id as string) ?? `pozycja-${index + 1}`,
      imageUrl: (item.imageUrl as string) ?? "",
      widthCm: (item.widthCm as number) ?? 0,
      heightCm: (item.heightCm as number) ?? 0,
      stickersPerSheet: (item.stickersPerSheet as number) ?? 0,
      sheetQuantity: (item.sheetQuantity as number) ?? 1,
      pricePerSheet: (item.pricePerSheet as number) ?? 0,
      deliveryForm: (item.deliveryForm as "sheet" | "individual") ?? "sheet",
      editable: Boolean(item.layoutPath),
    })),
  };
}

/** Zamówienia zalogowanej osoby, od najnowszego. */
export async function listUserOrders(uid: string, limit = 50): Promise<CustomerOrder[]> {
  const snapshot = await db
    .collection("orders")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .filter((doc) => !doc.data().deletedAt)
    .map((doc) => toCustomerOrder(doc.id, doc.data()));
}

/**
 * Pojedyncze zamówienie — wyłącznie własne. Sprawdzenie właściciela jest tutaj,
 * a nie w komponencie strony, żeby nie dało się go pominąć z żadnego miejsca.
 */
export async function getUserOrder(orderId: string, uid: string): Promise<CustomerOrder | null> {
  const snapshot = await db.collection("orders").doc(orderId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data()!;
  if (data.userId !== uid || data.deletedAt) return null;

  return toCustomerOrder(snapshot.id, data);
}

/** Surowy dokument dla operacji serwerowych (np. odczytu układu arkusza). */
export async function getRawUserOrder(
  orderId: string,
  uid: string
): Promise<FirebaseFirestore.DocumentData | null> {
  const snapshot = await db.collection("orders").doc(orderId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data()!;
  if (data.userId !== uid || data.deletedAt) return null;
  return data;
}
