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
  /** Zamówienie pominięte w statystykach (ewidencja CSV bierze je normalnie). */
  excludedFromStats: boolean;
  trackingNumber: string | null;
  /** Link do śledzenia wklejony ręcznie w panelu — trafia do maila „Wysłane”. */
  trackingUrl: string | null;
  /** Kiedy ostatnio poszedł do klienta mail „Realizujemy Twoje zamówienie”. */
  inProductionEmailSentAt: string | null;
  /** Kiedy ostatnio poszedł do klienta mail „Wysłane”. */
  shippedEmailSentAt: string | null;
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
    excludedFromStats: Boolean(data.excludedFromStats),
    trackingNumber: data.trackingNumber ?? null,
    trackingUrl: data.trackingUrl ?? null,
    inProductionEmailSentAt: data.inProductionEmailSentAt ?? null,
    shippedEmailSentAt: data.shippedEmailSentAt ?? null,
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
 * Pola, które czyta `toAdminOrder` — i tylko one.
 *
 * Projekcja jest tu najważniejszą optymalizacją listy, nie mikrooptymalizacją.
 * Zamówienia nosiły kiedyś pole `pdfAttachments` — arkusze do druku wklejone
 * w base64 wprost do dokumentu. Ważyło 5,2 MB, czyli 98% całej kolekcji,
 * i nic w aplikacji go nie czytało; panel ściągał te megabajty przy każdym
 * wejściu. Samo pole zostało skasowane z bazy
 * (`scripts/usun-pdfattachments.ts`), ale projekcja zostaje: lista ma brać
 * tylko to, co pokazuje, i nie tyć z powrotem, kiedy do zamówienia dojdzie
 * kolejne obszerne pole.
 */
const LIST_FIELDS = [
  "orderNumber",
  "source",
  "createdAt",
  "paidAt",
  "deletedAt",
  "status",
  "fulfillmentStatus",
  "excludedFromStats",
  "trackingNumber",
  "trackingUrl",
  "inProductionEmailSentAt",
  "shippedEmailSentAt",
  "internalNote",
  "userId",
  "customer",
  "delivery",
  "billing",
  "payment",
  "paymentMethod",
  "p24OrderId",
  "totals",
  "items",
  "baselinkerOrderId",
  "invoiceNumber",
  "invoiceUrl",
  "infakt",
] as const;

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
  return (await fetchOrders(filters, limit)).orders;
}

/** To samo co `listOrders`, plus ile dokumentów faktycznie przyszło z bazy. */
async function fetchOrders(
  filters: OrderFilters,
  limit: number
): Promise<{ orders: AdminOrder[]; fetched: number }> {
  const dateField = filters.dateField ?? "createdAt";

  let query: FirebaseFirestore.Query = db.collection("orders");
  if (filters.from) query = query.where(dateField, ">=", filters.from);
  if (filters.to) query = query.where(dateField, "<=", filters.to);

  const snapshot = await query
    .orderBy(dateField, "desc")
    .limit(limit)
    .select(...LIST_FIELDS)
    .get();
  const orders = snapshot.docs.map((doc) => toAdminOrder(doc.id, doc.data()));

  const search = filters.search?.trim().toLowerCase();

  const matching = orders.filter((order) => {
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

  return { orders: matching, fetched: snapshot.size };
}

/** Ile zamówień mieści się na jednej stronie listy w panelu. */
export const ORDERS_PAGE_SIZE = 50;

export type OrdersPage = {
  orders: AdminOrder[];
  /** Ile zamówień pasuje do filtrów — nie tylko ile widać na tej stronie. */
  total: number;
  page: number;
  pageCount: number;
  /** Zapytanie dobiło do limitu, więc starsze zamówienia mogły nie wejść. */
  capped: boolean;
};

/**
 * Jedna strona listy zamówień.
 *
 * Stronicujemy w pamięci, a nie kursorem Firestore, i jest ku temu powód:
 * większość filtrów panelu (status, realizacja, metoda, faktura, kosz,
 * wyszukiwarka) i tak działa po stronie aplikacji — patrz `listOrders`.
 * Kursor po surowym zapytaniu zwracałby strony o losowej długości i nie dałby
 * uczciwej liczby wyników, a to ona mówi sprzedawcy, ile naprawdę znalazł.
 *
 * Samo zapytanie jest tanie dzięki projekcji `LIST_FIELDS`; kosztem strony
 * było dotąd ściąganie martwych załączników, nie liczba wierszy.
 */
export async function listOrdersPage(
  filters: OrderFilters,
  page = 1,
  pageSize = ORDERS_PAGE_SIZE,
  limit = 500
): Promise<OrdersPage> {
  const { orders, fetched } = await fetchOrders(filters, limit);

  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;

  return {
    orders: orders.slice(start, start + pageSize),
    total: orders.length,
    page: current,
    pageCount,
    capped: fetched >= limit,
  };
}

export async function getOrder(orderId: string): Promise<AdminOrder | null> {
  const snapshot = await db.collection("orders").doc(orderId).get();
  if (!snapshot.exists) return null;
  return toAdminOrder(snapshot.id, snapshot.data()!);
}

/**
 * Cała historia zamówień jednego konta, łącznie z koszem — na stronie klienta
 * w panelu admin liczy się pełny obraz, nie tylko to, co jeszcze widać w liście.
 */
export async function listOrdersForUser(userId: string, limit = 200): Promise<AdminOrder[]> {
  const snapshot = await db
    .collection("orders")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .select(...LIST_FIELDS)
    .get();

  return snapshot.docs.map((doc) => toAdminOrder(doc.id, doc.data()));
}

