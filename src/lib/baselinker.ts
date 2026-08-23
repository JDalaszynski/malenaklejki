export interface BLProduct {
  product_id?: string;
  name: string;
  price_brutto: number;
  tax_rate: number;
  quantity: number;
  weight?: number;
}

export interface BLOrderParameters {
  order_status_id?: number;
  custom_source_id?: number;
  date_add: number;
  user_comments?: string;
  admin_comments?: string;
  phone: string;
  email: string;
  user_login: string;
  currency: string;
  payment_method: string;
  payment_method_cod: number;
  paid: number;
  delivery_method: string;
  delivery_price: number;
  delivery_fullname: string;
  delivery_company: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_country_code: string;
  invoice_fullname: string;
  invoice_company: string;
  invoice_nip: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postcode: string;
  invoice_country_code: string;
  want_invoice: number;
  /** Odbiór w punkcie (paczkomat) — nazwa punktu. */
  delivery_point_name?: string;
  /** Odbiór w punkcie — identyfikator punktu (np. POZ01A). */
  delivery_point_id?: string;
  delivery_point_address?: string;
  delivery_point_city?: string;
  delivery_point_postcode?: string;
  extra_field_1?: string;
  extra_field_2?: string;
  custom_extra_fields?: Record<number, string>;
  products: BLProduct[];
}

/** Status "Nowe zamówienia" w BaseLinkerze. */
export const BL_NEW_ORDER_STATUS_ID = 65507;

/** Sposób płatności przekazywany do BaseLinkera — zawsze taki sam. */
export const BL_PAYMENT_METHOD = "przelew 14 dni";

/** Nazwy sposobów wysyłki tak, jak mają wyglądać w BaseLinkerze. */
export const BL_DELIVERY_METHODS = {
  paczkomat: "InPost Paczkomaty",
  kurier: "Przesyłka Kurierska",
} as const;

/**
 * Dane do faktury w BaseLinkerze są stałe — zawsze sprzedawca, niezależnie
 * od tego, jakie dane klient podał w zamówieniu. Prośba klienta o fakturę
 * (jego NIP, nazwa firmy) celowo nie trafia do BaseLinkera w ogóle.
 */
export const BL_INVOICE_DATA = {
  company: "Jakub Dalaszyński",
  fullname: "Jakub Dalaszyński",
  address: "Geodetów 41",
  postcode: "64-100",
  city: "Trzebiny",
  countryCode: "PL",
  nip: "695527166",
} as const;

/** Kształt zamówienia zapisanego w Firestore, w zakresie potrzebnym BaseLinkerowi. */
export interface BLOrderSource {
  orderNumber?: string;
  createdAt?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  delivery?: {
    method?: string;
    courierDetails?: {
      street?: string;
      building?: string;
      city?: string;
      postalCode?: string;
    } | null;
    paczkomatDetails?: {
      lockerId?: string;
      address?: string;
      city?: string;
      postalCode?: string;
    } | null;
  } | null;
  totals?: { shipping?: number } | null;
  items?: Record<string, unknown>[] | null;
}

/**
 * Rozbija adres paczkomatu ("ul. Kwiatowa 5, 61-001 Poznań") na części,
 * bo BaseLinker trzyma adres punktu, kod i miasto w osobnych polach.
 * Starsze zamówienia mają tylko sklejony adres z geowidgetu InPostu.
 */
export function splitPointAddress(raw?: string | null): {
  address: string;
  postcode: string;
  city: string;
} {
  const value = (raw || "").trim();
  if (!value) return { address: "", postcode: "", city: "" };

  const match = value.match(/^(.*?)[\s,]*(\d{2}-\d{3})\s+(.+)$/);
  if (!match) return { address: value, postcode: "", city: "" };

  return {
    address: match[1].replace(/[\s,]+$/, "").trim(),
    postcode: match[2],
    city: match[3].trim(),
  };
}

/**
 * Uwagi do zamówienia: czy naklejki mają zostać na arkuszu, czy wycięte,
 * a przy kurierze dodatkowo adnotacja o nadaniu anonimowym.
 */
export function buildOrderComments(
  items: Record<string, unknown>[],
  deliveryMethod?: string
): string {
  const lines = items.map((item, index) => {
    const form =
      item.deliveryForm === "individual"
        ? "pocięte na pojedyncze sztuki"
        : "na arkuszu";
    return `Pozycja ${index + 1}: ${form}`;
  });

  if (deliveryMethod === "kurier") lines.push("Kurier anonim");

  return lines.join("\n");
}

/**
 * Buduje komplet parametrów `addOrder` z zamówienia zapisanego w Firestore.
 * Jedno miejsce dla sklepu i dla ręcznej wysyłki z panelu, żeby zamówienia
 * w BaseLinkerze zawsze wyglądały tak samo.
 */
export function buildBaseLinkerOrderParams(order: BLOrderSource): BLOrderParameters {
  const customer = order.customer ?? {};
  const delivery = order.delivery ?? {};
  const isCourier = delivery.method === "kurier";
  const isPoint = delivery.method === "paczkomat";
  const courier = delivery.courierDetails ?? {};
  const locker = delivery.paczkomatDetails ?? {};
  const items = order.items ?? [];

  // Adres punktu: najpierw dane rozbite przy wyborze paczkomatu, a dla
  // starszych zamówień to, co da się wyciągnąć ze sklejonego adresu.
  const parsedPoint = splitPointAddress(locker.address);
  const pointCity = locker.city || parsedPoint.city;
  const pointPostcode = locker.postalCode || parsedPoint.postcode;

  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : NaN;

  return {
    order_status_id: BL_NEW_ORDER_STATUS_ID,
    date_add: Math.floor((Number.isNaN(createdAt) ? Date.now() : createdAt) / 1000),
    phone: customer.phone || "",
    email: customer.email || "",
    user_login: customer.email || "",
    currency: "PLN",
    payment_method: BL_PAYMENT_METHOD,
    payment_method_cod: 0,
    paid: 0,
    delivery_method:
      BL_DELIVERY_METHODS[delivery.method as keyof typeof BL_DELIVERY_METHODS] ??
      delivery.method ??
      "",
    delivery_price: order.totals?.shipping ?? 0,
    delivery_fullname: `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim(),
    delivery_company: "",
    // Adres dostawy wypełniamy tylko dla kuriera — paczkomat ma własne pola punktu.
    delivery_address: isCourier
      ? `${courier.street ?? ""} ${courier.building ?? ""}`.trim()
      : "",
    delivery_city: isCourier ? courier.city ?? "" : "",
    delivery_postcode: isCourier ? courier.postalCode ?? "" : "",
    delivery_country_code: "PL",
    delivery_point_name: isPoint ? locker.lockerId ?? "" : "",
    delivery_point_id: isPoint ? locker.lockerId ?? "" : "",
    delivery_point_address: isPoint ? parsedPoint.address || locker.address || "" : "",
    delivery_point_city: isPoint ? pointCity : "",
    delivery_point_postcode: isPoint ? pointPostcode : "",
    invoice_fullname: BL_INVOICE_DATA.fullname,
    invoice_company: BL_INVOICE_DATA.company,
    invoice_nip: BL_INVOICE_DATA.nip,
    invoice_address: BL_INVOICE_DATA.address,
    invoice_city: BL_INVOICE_DATA.city,
    invoice_postcode: BL_INVOICE_DATA.postcode,
    invoice_country_code: BL_INVOICE_DATA.countryCode,
    want_invoice: 1,
    user_comments: buildOrderComments(items, delivery.method),
    products: items.map((item) => ({
      name:
        (item.name as string) ||
        `Naklejki ${item.widthCm}x${item.heightCm}cm (${item.stickersPerSheet} szt/arkusz)`,
      price_brutto: (item.pricePerSheet as number) ?? 0,
      tax_rate: (item.taxRate as number) ?? 23,
      quantity: (item.sheetQuantity as number) ?? 1,
    })),
    extra_field_1: order.orderNumber ?? "",
  };
}

/**
 * Zwraca token do BaseLinkera z process.env.
 * Funkcja wewnetrzna.
 */
function getBLToken(): string {
  const token = process.env.BASELINKER_TOKEN;
  if (!token) {
    console.warn("Brak BASELINKER_TOKEN w .env.local!");
  }
  return token || "";
}

/**
 * Wykonuje żądanie do API BaseLinkera
 */
async function callBaseLinkerAPI(method: string, parameters: object) {
  const token = getBLToken();
  if (!token) {
    return { status: "ERROR", error_message: "Brak tokenu BaseLinker" };
  }

  const url = "https://api.baselinker.com/connector.php";
  const body = new URLSearchParams();
  body.append("method", method);
  body.append("parameters", JSON.stringify(parameters));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-BLToken": token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`BaseLinker API Error [${method}]:`, error);
    return { status: "ERROR", error_message: error.message };
  }
}

/**
 * Wysyła nowe zamówienie do systemu BaseLinker
 */
export async function addOrderToBaseLinker(params: BLOrderParameters) {
  return await callBaseLinkerAPI("addOrder", params);
}

/**
 * Oznacza zamówienie jako opłacone w systemie BaseLinker
 */
export async function setOrderPayment(orderId: number, paymentAmount: number, paymentDate: number, paymentComment: string) {
  return await callBaseLinkerAPI("setOrderPayment", {
    order_id: orderId,
    payment_done: paymentAmount,
    payment_date: paymentDate,
    payment_comment: paymentComment,
  });
}
