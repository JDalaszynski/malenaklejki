import "server-only";

import { db } from "@/lib/firebase/admin";

export type AdminOrderItem = {
  id: string;
  name: string;
  imageUrl: string;
  cutLinesImageUrl: string | null;
  widthCm: number;
  heightCm: number;
  stickersPerSheet: number;
  sheetQuantity: number;
  pricePerSheet: number;
  taxRate: number;
  deliveryForm: "sheet" | "individual";
  hasLayout: boolean;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  source: string;
  createdAt: string;
  paidAt: string | null;
  deletedAt: string | null;
  status: string;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  internalNote: string | null;
  userId: string | null;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  delivery: {
    method: string;
    street: string;
    building: string;
    postalCode: string;
    city: string;
    lockerId: string;
    lockerAddress: string;
  };
  billing: { wantsInvoice: boolean; nip: string | null; companyName: string | null };
  payment: { method: string; transactionId: string | null };
  totals: { subtotal: number; shipping: number; total: number };
  items: AdminOrderItem[];
  baselinkerOrderId: number | null;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  /** Stan wystawiania faktury w inFakcie (`lib/orders/invoicing`). */
  infakt: {
    status: string;
    number: string | null;
    uuid: string | null;
    issuedAt: string | null;
    error: string | null;
    warnings: string[];
  } | null;
};

export type OrderFilters = {
  from?: string;
  to?: string;
  dateField?: "createdAt" | "paidAt";
  status?: string;
  fulfillmentStatus?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  invoice?: "yes" | "no";
  search?: string;
  trash?: boolean;
};

export function toAdminOrder(id: string, data: FirebaseFirestore.DocumentData): AdminOrder {
  const courier = data.delivery?.courierDetails ?? {};
  const locker = data.delivery?.paczkomatDetails ?? {};

  return {
    id,
    orderNumber: data.orderNumber ?? id,
    source: data.source ?? "shop",
    createdAt: data.createdAt ?? "",
    paidAt: data.paidAt ?? null,
    deletedAt: data.deletedAt ?? null,
    status: data.status ?? "PENDING_PAYMENT",
    fulfillmentStatus: data.fulfillmentStatus ?? "NEW",
    trackingNumber: data.trackingNumber ?? null,
    internalNote: data.internalNote ?? null,
    userId: data.userId ?? null,
    customer: {
      firstName: data.customer?.firstName ?? "",
      lastName: data.customer?.lastName ?? "",
      email: data.customer?.email ?? "",
      phone: data.customer?.phone ?? "",
    },
    delivery: {
      method: data.delivery?.method ?? "",
      street: courier.street ?? "",
      building: courier.building ?? "",
      postalCode: courier.postalCode ?? "",
      city: courier.city ?? "",
      lockerId: locker.lockerId ?? "",
      lockerAddress: locker.address ?? "",
    },
    billing: {
      wantsInvoice: Boolean(data.billing?.wantsInvoice),
      nip: data.billing?.nip ?? null,
      companyName: data.billing?.companyName ?? null,
    },
    payment: {
      method: data.payment?.method ?? data.paymentMethod ?? "",
      transactionId: data.p24OrderId ? String(data.p24OrderId) : null,
    },
    totals: {
      subtotal: data.totals?.subtotal ?? 0,
      shipping: data.totals?.shipping ?? 0,
      total: data.totals?.total ?? 0,
    },
    items: (data.items ?? []).map((item: Record<string, unknown>, index: number) => ({
      id: (item.id as string) ?? `pozycja-${index + 1}`,
      name:
        (item.name as string) ??
        `Naklejki ${item.widthCm ?? ""}×${item.heightCm ?? ""} cm`,
      imageUrl: (item.imageUrl as string) ?? "",
      cutLinesImageUrl: (item.cutLinesImageUrl as string) ?? null,
      widthCm: (item.widthCm as number) ?? 0,
      heightCm: (item.heightCm as number) ?? 0,
      stickersPerSheet: (item.stickersPerSheet as number) ?? 0,
      sheetQuantity: (item.sheetQuantity as number) ?? 1,
      pricePerSheet: (item.pricePerSheet as number) ?? 0,
      taxRate: (item.taxRate as number) ?? 23,
      deliveryForm: (item.deliveryForm as "sheet" | "individual") ?? "sheet",
      hasLayout: Boolean(item.layoutPath),
    })),
    baselinkerOrderId: data.baselinkerOrderId ?? null,
    invoiceNumber: data.invoiceNumber ?? null,
    invoiceUrl: data.invoiceUrl ?? null,
    infakt: data.infakt
      ? {
          status: data.infakt.status ?? "",
          number: data.infakt.number ?? null,
          uuid: data.infakt.uuid ?? null,
          issuedAt: data.infakt.issuedAt ?? null,
          error: data.infakt.error ?? null,
          warnings: data.infakt.warnings ?? [],
        }
      : null,
  };
}

/**
 * Zakres dat filtrujemy w zapytaniu (to jedyne, co Firestore robi tanio bez
 * indeksów złożonych), a resztę warunków w pamięci.
 *
 * Filtrowanie po `deletedAt` musi być w pamięci z konkretnego powodu: Firestore
 * traktuje brak pola inaczej niż wartość `null`, więc zapytanie
 * `where("deletedAt", "==", null)` pominęłoby wszystkie zamówienia sprzed
 * wdrożenia kosza — czyli całą dotychczasową historię sklepu.
 */
export async function listOrders(
  filters: OrderFilters,
  limit = 500
): Promise<AdminOrder[]> {
  const dateField = filters.dateField ?? "createdAt";

  let query: FirebaseFirestore.Query = db.collection("orders");
  if (filters.from) query = query.where(dateField, ">=", filters.from);
  if (filters.to) query = query.where(dateField, "<=", filters.to);

  const snapshot = await query.orderBy(dateField, "desc").limit(limit).get();
  const orders = snapshot.docs.map((doc) => toAdminOrder(doc.id, doc.data()));

  const search = filters.search?.trim().toLowerCase();

  return orders.filter((order) => {
    if (filters.trash ? !order.deletedAt : Boolean(order.deletedAt)) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.fulfillmentStatus && order.fulfillmentStatus !== filters.fulfillmentStatus) {
      return false;
    }
    if (filters.paymentMethod && order.payment.method !== filters.paymentMethod) return false;
    if (filters.deliveryMethod && order.delivery.method !== filters.deliveryMethod) return false;
    if (filters.invoice === "yes" && !order.billing.wantsInvoice) return false;
    if (filters.invoice === "no" && order.billing.wantsInvoice) return false;

    if (search) {
      const haystack = [
        order.orderNumber,
        order.customer.email,
        order.customer.firstName,
        order.customer.lastName,
        order.customer.phone,
        order.billing.nip ?? "",
        order.billing.companyName ?? "",
        order.trackingNumber ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export async function getOrder(orderId: string): Promise<AdminOrder | null> {
  const snapshot = await db.collection("orders").doc(orderId).get();
  if (!snapshot.exists) return null;
  return toAdminOrder(snapshot.id, snapshot.data()!);
}

export type OrderStats = {
  count: number;
  paidCount: number;
  unpaidCount: number;
  grossTotal: number;
  netTotal: number;
  vatTotal: number;
  averageOrder: number;
};

/**
 * Podsumowanie dla wybranego okresu.
 *
 * Kwoty w sklepie są brutto, więc netto liczymy w drugą stronę (brutto ÷ 1,23),
 * zaokrąglając na poziomie pojedynczego zamówienia — dokładnie tak samo jak
 * w raporcie CSV, żeby obie liczby zawsze się zgadzały.
 */
export function summarize(orders: AdminOrder[], vatRate = 23): OrderStats {
  const paid = orders.filter((order) => order.status === "PAID");

  let grossTotal = 0;
  let netTotal = 0;
  let vatTotal = 0;

  for (const order of paid) {
    const gross = order.totals.total;
    const net = Math.round((gross / (1 + vatRate / 100)) * 100) / 100;
    grossTotal = Math.round((grossTotal + gross) * 100) / 100;
    netTotal = Math.round((netTotal + net) * 100) / 100;
    vatTotal = Math.round((vatTotal + (gross - net)) * 100) / 100;
  }

  return {
    count: orders.length,
    paidCount: paid.length,
    unpaidCount: orders.length - paid.length,
    grossTotal,
    netTotal,
    vatTotal,
    averageOrder: paid.length ? Math.round((grossTotal / paid.length) * 100) / 100 : 0,
  };
}
