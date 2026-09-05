export interface BLProduct {
  /** Magazyn, z którego pochodzi produkt ("db" = katalog wewnętrzny BaseLinkera). */
  storage?: string;
  /** ID magazynu; dla katalogu wewnętrznego BaseLinker oczekuje 0. */
  storage_id?: number;
  product_id?: string;
  name: string;
  price_brutto: number;
  tax_rate: number;
  quantity: number;
  weight?: number;
  /** Atrybuty pozycji, np. "Naklejki: na arkuszu". */
  attributes?: string;
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

/** Jedyny produkt, jaki trafia do BaseLinkera — pozycje różnią się ceną i ilością. */
export const BL_PRODUCT = {
  id: "17059",
  name: "Naklejki na Arkuszu A4 - MałeNaklejki",
} as const;

/**
 * Zdjęcie pozycji w BaseLinkerze. Zamówienia mają tylko jeden produkt z katalogu,
 * więc miniaturą jest po prostu logo sklepu. BaseLinker nie przyjmuje zdjęcia
 * w `addOrder` — miniatura w zamówieniu bierze się ze zdjęcia produktu w katalogu,
 * dlatego ustawiamy je na produkcie (`ensureProductImage`).
 */
export function getProductImageUrl(): string {
  const fromEnv = process.env.BASELINKER_PRODUCT_IMAGE_URL;
  if (fromEnv) return fromEnv;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://malenaklejki.pl").replace(/\/+$/, "");
  return `${appUrl}/images/logo/malenaklejki-logo-light.png`;
}

/**
 * Cena brutto pozycji przekazywana do BaseLinkera. Stała — w BaseLinkerze
 * zamówienia mają wyglądać jednakowo, niezależnie od ceny wyliczonej w sklepie.
 */
export const BL_UNIT_PRICE_BRUTTO = 18.45;

/** Koszt dostawy przekazywany do BaseLinkera — również stały. */
export const BL_DELIVERY_PRICE = 19.99;

/** Nazwa customowego pola zamówienia w BaseLinkerze, do którego kopiujemy uwagi. */
export const BL_NOTES_FIELD_NAME = "Uwagi";

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
/** Opis sposobu dostarczenia naklejek — ta sama treść w uwagach i w atrybutach pozycji. */
export function describeDeliveryForm(item: Record<string, unknown>): string {
  return item.deliveryForm === "individual" ? "pocięte na pojedyncze sztuki" : "na arkuszu";
}

/** Atrybut pozycji w BaseLinkerze — widoczny przy produkcie w zamówieniu. */
export function buildProductAttributes(item: Record<string, unknown>): string {
  return `Naklejki: ${describeDeliveryForm(item)}`;
}

export function buildOrderComments(
  items: Record<string, unknown>[],
  deliveryMethod?: string
): string {
  const lines = items.map(
    (item, index) => `Pozycja ${index + 1}: ${describeDeliveryForm(item)}`
  );

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
    // Login klienta ma zostać pusty.
    user_login: "",
    currency: "PLN",
    payment_method: BL_PAYMENT_METHOD,
    payment_method_cod: 0,
    // Zamówienie w BaseLinkerze zawsze jest nieopłacone — także wtedy, gdy klient
    // zapłacił online. Płatność sprzedawca księguje w BaseLinkerze ręcznie, więc
    // sklep celowo nigdy jej tam nie ustawia (nie ma wywołania `setOrderPayment`).
    paid: 0,
    delivery_method:
      BL_DELIVERY_METHODS[delivery.method as keyof typeof BL_DELIVERY_METHODS] ??
      delivery.method ??
      "",
    delivery_price: BL_DELIVERY_PRICE,
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
      // Wskazanie katalogu wewnętrznego wiąże pozycję z produktem w BaseLinkerze —
      // bez tego zamówienie pokazuje pozycję bez miniatury.
      storage: "db",
      storage_id: 0,
      product_id: BL_PRODUCT.id,
      name: order.orderNumber ? `${BL_PRODUCT.name} - ${order.orderNumber}` : BL_PRODUCT.name,
      price_brutto: BL_UNIT_PRICE_BRUTTO,
      attributes: buildProductAttributes(item),
      tax_rate: (item.taxRate as number) ?? 23,
      quantity: (item.sheetQuantity as number) ?? 1,
    })),
    // Pola Termin i Druk zostają puste — nie wypełniamy extra_field_1/2.
  };
}

/** Treść customowego pola "Uwagi": uwagi do zamówienia + nasz numer zamówienia. */
export function buildNotesFieldValue(order: BLOrderSource): string {
  const comments = buildOrderComments(order.items ?? [], order.delivery?.method);
  const number = order.orderNumber ? `Zamówienie: ${order.orderNumber}` : "";
  return [comments, number].filter(Boolean).join("\n");
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
      signal: AbortSignal.timeout(15000),
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

/** Lista customowych pól zamówień zdefiniowanych na koncie BaseLinkera. */
async function getOrderExtraFields(): Promise<{ extra_field_id: string; name: string }[]> {
  const data = await callBaseLinkerAPI("getOrderExtraFields", {});
  return data?.status === "SUCCESS" ? data.extra_fields ?? [] : [];
}

/**
 * ID customowego pola "Uwagi". BaseLinker nadaje je sam, więc raz na proces
 * pytamy o listę pól i szukamy po nazwie; `BASELINKER_NOTES_FIELD_ID` pozwala
 * wskazać je ręcznie, gdyby nazwa pola się zmieniła.
 */
let notesFieldIdPromise: Promise<string | null> | null = null;

function resolveNotesFieldId(): Promise<string | null> {
  const fromEnv = process.env.BASELINKER_NOTES_FIELD_ID;
  if (fromEnv) return Promise.resolve(fromEnv);

  notesFieldIdPromise ??= getOrderExtraFields()
    .then((fields) => {
      const target = BL_NOTES_FIELD_NAME.toLowerCase();
      const match = fields.find((field) => field.name?.trim().toLowerCase() === target);
      if (!match) {
        console.warn(`BaseLinker: brak customowego pola "${BL_NOTES_FIELD_NAME}".`);
        notesFieldIdPromise = null; // spróbujemy jeszcze raz przy kolejnym zamówieniu
        return null;
      }
      return String(match.extra_field_id);
    })
    .catch((error) => {
      console.error("BaseLinker: nie udało się pobrać listy pól dodatkowych:", error);
      notesFieldIdPromise = null;
      return null;
    });

  return notesFieldIdPromise;
}

/**
 * Zdjęcie produktu w katalogu BaseLinkera.
 *
 * `addOrder` nie przyjmuje żadnego pola ze zdjęciem — miniatura widoczna przy
 * pozycji zamówienia pochodzi ze zdjęcia produktu w katalogu. Dlatego raz na
 * proces sprawdzamy, czy produkt `BL_PRODUCT.id` ma zdjęcie, i jeśli nie —
 * podstawiamy logo sklepu. `addInventoryProduct` z podanym `product_id`
 * aktualizuje wyłącznie przekazane pola, więc reszta karty produktu zostaje.
 */
let productImagePromise: Promise<void> | null = null;

/** Katalogi (inventories) na koncie BaseLinkera. */
async function getInventories(): Promise<{ inventory_id: number }[]> {
  const data = await callBaseLinkerAPI("getInventories", {});
  return data?.status === "SUCCESS" ? data.inventories ?? [] : [];
}

/** Katalog, w którym leży nasz produkt, razem z jego aktualnymi zdjęciami. */
async function findProductInInventories(): Promise<{
  inventoryId: number;
  hasImage: boolean;
} | null> {
  const fromEnv = process.env.BASELINKER_INVENTORY_ID;
  const inventories = fromEnv
    ? [{ inventory_id: Number(fromEnv) }]
    : await getInventories();

  for (const inventory of inventories) {
    const data = await callBaseLinkerAPI("getInventoryProductsData", {
      inventory_id: inventory.inventory_id,
      products: [BL_PRODUCT.id],
    });
    const product = data?.status === "SUCCESS" ? data.products?.[BL_PRODUCT.id] : null;
    if (!product) continue;

    const images = product.images ?? {};
    return {
      inventoryId: inventory.inventory_id,
      hasImage: Object.values(images).some((image) => Boolean(image)),
    };
  }

  return null;
}

async function setProductImage(): Promise<void> {
  const found = await findProductInInventories();
  if (!found) {
    console.warn(`BaseLinker: nie znaleziono produktu ${BL_PRODUCT.id} w żadnym katalogu.`);
    return;
  }
  if (found.hasImage) return;

  const result = await callBaseLinkerAPI("addInventoryProduct", {
    inventory_id: found.inventoryId,
    product_id: BL_PRODUCT.id,
    images: { 0: `url:${getProductImageUrl()}` },
  });

  if (result?.status === "SUCCESS") {
    console.log(`BaseLinker: ustawiono logo jako zdjęcie produktu ${BL_PRODUCT.id}.`);
  } else {
    console.error("BaseLinker: nie udało się ustawić zdjęcia produktu:", result);
  }
}

/**
 * Dba o to, żeby produkt w katalogu miał zdjęcie. Wywoływane przy wysyłce
 * zamówienia; nigdy nie rzuca i nie blokuje zapisu zamówienia.
 */
export function ensureProductImage(): Promise<void> {
  productImagePromise ??= setProductImage().catch((error) => {
    console.error("BaseLinker: błąd przy ustawianiu zdjęcia produktu:", error);
    productImagePromise = null; // spróbujemy jeszcze raz przy kolejnym zamówieniu
  });
  return productImagePromise;
}

/**
 * Buduje parametry z zamówienia, dopina uwagi do customowego pola "Uwagi"
 * i wysyła zamówienie do BaseLinkera.
 */
export async function sendOrderToBaseLinker(order: BLOrderSource) {
  const params = buildBaseLinkerOrderParams(order);
  const notes = buildNotesFieldValue(order);

  const fieldId = await resolveNotesFieldId();
  if (fieldId) {
    // extra_field_1/2 to osobne parametry API, pozostałe pola idą w custom_extra_fields.
    if (fieldId === "1") params.extra_field_1 = notes;
    else if (fieldId === "2") params.extra_field_2 = notes;
    else params.custom_extra_fields = { [Number(fieldId)]: notes };
  }

  // Miniatura pozycji bierze się ze zdjęcia produktu w katalogu — pilnujemy,
  // żeby było ustawione, zanim zamówienie pojawi się w BaseLinkerze.
  await ensureProductImage();

  return await addOrderToBaseLinker(params);
}
