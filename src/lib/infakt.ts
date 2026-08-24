/**
 * Integracja z inFakt — faktura VAT wystawiana automatycznie po zaksięgowaniu
 * płatności. Ten plik odpowiada wyłącznie za rozmowę z API i za zamianę
 * zamówienia na treść faktury; zapisem wyniku przy zamówieniu i obsługą
 * ponowień zajmuje się `lib/orders/invoicing`.
 *
 * Tworzenie faktury w inFakcie jest asynchroniczne: POST zwraca numer
 * referencyjny zlecenia, a dopiero odpytanie o status daje UUID faktury.
 */

// Adres paczkomatu bywa zapisany jednym stringiem z geowidgetu InPostu —
// rozbijamy go tą samą funkcją co przy wysyłce do BaseLinkera, żeby faktura
// i zamówienie w BaseLinkerze pokazywały ten sam adres.
import { splitPointAddress } from "@/lib/baselinker";

/** Stawka VAT — sklep sprzedaje wyłącznie ze stawką podstawową. */
export const INFAKT_TAX_SYMBOL = "23";

/** Jedyna pozycja na fakturze ma jednostkę „szt.” i ilość 1. */
export const INFAKT_UNIT = "szt.";

/**
 * Sposób płatności przekazywany do inFaktu. BLIK w sklepie jest obsługiwany
 * przez Przelewy24, więc na fakturze wygląda tak samo jak zwykła płatność P24.
 */
export const INFAKT_PAYMENT_METHODS: Record<string, string> = {
  przelewy24: "przelewy24",
  blik: "przelewy24",
  przelew: "transfer",
  stripe: "card",
  vinted: "other",
  manual: "other",
};

/** Odstępy między kolejnymi sprawdzeniami statusu zlecenia (łącznie ~9 s). */
const POLL_DELAYS_MS = [700, 900, 1200, 1500, 2000, 2500];

const API_URL = (process.env.INFAKT_API_URL || "https://api.infakt.pl/api/v3").replace(/\/+$/, "");

/** Biała lista podatników VAT (Ministerstwo Finansów) — źródło adresu firmy. */
const WHITE_LIST_URL = "https://wl-api.mf.gov.pl/api/search/nip";

export class InfaktError extends Error {
  /** Numer referencyjny zlecenia — zapisujemy go, gdy nie doczekaliśmy się wyniku. */
  readonly taskReference?: string;
  readonly details?: unknown;

  constructor(message: string, options: { taskReference?: string; details?: unknown } = {}) {
    super(message);
    this.name = "InfaktError";
    this.taskReference = options.taskReference;
    this.details = options.details;
  }
}

/* ------------------------------------------------------------------ */
/* Kształt danych                                                      */
/* ------------------------------------------------------------------ */

export interface InfaktService {
  name: string;
  tax_symbol: string;
  unit: string;
  quantity: number;
  /** Wartość brutto pozycji w groszach — netto i VAT dolicza inFakt. */
  gross_price: number;
}

export interface InfaktInvoice {
  status: "paid";
  paid_date: string;
  paid_price: number;
  payment_method: string;
  invoice_date: string;
  sale_date: string;
  payment_date: string;
  notes: string;
  client_country: string;
  client_business_activity_kind: "private_person" | "other_business";
  client_company_name?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_tax_code?: string;
  client_street?: string;
  client_street_number?: string;
  client_city?: string;
  client_post_code?: string;
  services: InfaktService[];
}

/** Kształt zamówienia z Firestore w zakresie potrzebnym do faktury. */
export interface InfaktOrderSource {
  orderNumber?: string;
  createdAt?: string;
  paidAt?: string | null;
  customer?: {
    firstName?: string;
    lastName?: string;
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
  billing?: {
    wantsInvoice?: boolean;
    nip?: string | null;
    companyName?: string | null;
  } | null;
  payment?: { method?: string } | null;
  totals?: { total?: number } | null;
  items?: Record<string, unknown>[] | null;
}

export interface InfaktCreatedInvoice {
  uuid: string;
  number: string | null;
  taskReference: string;
}

/* ------------------------------------------------------------------ */
/* Pomocnicze                                                          */
/* ------------------------------------------------------------------ */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Data w formacie RRRR-MM-DD wyliczona dla polskiej strefy czasowej.
 * `paidAt` jest zapisywane w UTC, więc płatność po 1:00 w nocy latem trafiłaby
 * na fakturę z poprzednim dniem, gdyby liczyć ją po prostu z ISO.
 */
export function warsawDate(iso?: string | null): string {
  const parsed = iso ? new Date(iso) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(date);
}

/** Zostawia z NIP-u same cyfry — klienci wpisują go z myślnikami i spacjami. */
export function normalizeNip(raw?: string | null): string {
  return (raw || "").replace(/\D/g, "");
}

/** Kod pocztowy w formacie NN-NNN; inFakt odrzuca inne zapisy. */
export function formatPostCode(raw?: string | null): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return (raw || "").trim();
}

/**
 * Rozbija „Kwiatowa 5A" na ulicę i numer budynku, bo inFakt trzyma je osobno.
 * Gdy numeru nie da się wydzielić, cała wartość zostaje w polu ulicy.
 */
export function splitStreetAndNumber(raw: string): { street: string; number: string } {
  const value = (raw || "").trim().replace(/\s+/g, " ");
  const match = value.match(/^(.+?)\s+(\d+[A-Za-z]?(?:\s*[/-]\s*\d+[A-Za-z]?)?)$/);
  if (!match) return { street: value, number: "" };
  return {
    street: match[1].replace(/[.,]+$/, "").trim(),
    number: match[2].replace(/\s+/g, ""),
  };
}

/** Liczba arkuszy z całego zamówienia — trafia do nazwy pozycji na fakturze. */
export function countSheets(items: Record<string, unknown>[]): number {
  const total = items.reduce((sum, item) => sum + Number(item.sheetQuantity ?? 0), 0);
  return total > 0 ? total : 1;
}

/** Nazwa jedynej pozycji faktury. */
export function buildServiceName(items: Record<string, unknown>[]): string {
  return `Naklejki (${countSheets(items)} szt.) wraz z dostawą`;
}

/* ------------------------------------------------------------------ */
/* Adres nabywcy                                                       */
/* ------------------------------------------------------------------ */

export interface InvoiceAddress {
  street: string;
  streetNumber: string;
  city: string;
  postCode: string;
}

/**
 * Adres rozliczeniowy faktury. Przy paczkomacie celowo bierzemy adres punktu —
 * to jedyny adres, jaki klient podaje przy tej formie dostawy.
 */
export function resolveBillingAddress(order: InfaktOrderSource): InvoiceAddress {
  const delivery = order.delivery ?? {};

  if (delivery.method === "paczkomat") {
    const locker = delivery.paczkomatDetails ?? {};
    const parsed = splitPointAddress(locker.address);
    const { street, number } = splitStreetAndNumber(parsed.address || locker.address || "");
    return {
      street,
      streetNumber: number,
      city: locker.city || parsed.city || "",
      postCode: formatPostCode(locker.postalCode || parsed.postcode),
    };
  }

  const courier = delivery.courierDetails ?? {};
  return {
    street: courier.street ?? "",
    streetNumber: courier.building ?? "",
    city: courier.city ?? "",
    postCode: formatPostCode(courier.postalCode),
  };
}

export interface CompanyFromRegistry extends InvoiceAddress {
  name: string;
}

/** Adres z Białej listy przychodzi jednym stringiem: „WIERZBIĘCICE 1B, 61-569 POZNAŃ". */
function parseRegistryAddress(raw: string): InvoiceAddress {
  const match = (raw || "").match(/^(.*?),\s*(\d{2}-\d{3})\s+(.+)$/);
  if (!match) {
    const { street, number } = splitStreetAndNumber(raw || "");
    return { street, streetNumber: number, city: "", postCode: "" };
  }
  const { street, number } = splitStreetAndNumber(match[1]);
  return { street, streetNumber: number, city: match[3].trim(), postCode: match[2] };
}

/**
 * Dane firmy po NIP-ie z Białej listy podatników VAT.
 *
 * inFakt nie ma własnej końcówki do GUS-u, a w zamówieniu zbieramy od klienta
 * tylko NIP i nazwę firmy — bez adresu. Rejestr MF jest darmowy, nie wymaga
 * klucza i zwraca nazwę razem z adresem siedziby.
 */
export async function fetchCompanyByNip(nip: string): Promise<CompanyFromRegistry | null> {
  const digits = normalizeNip(nip);
  if (digits.length !== 10) return null;

  try {
    const response = await fetch(`${WHITE_LIST_URL}/${digits}?date=${warsawDate()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Biała lista MF:", response.status, await response.text());
      return null;
    }
    const data = await response.json();
    const subject = data?.result?.subject;
    if (!subject?.name) return null;

    const address = subject.workingAddress || subject.residenceAddress || "";
    return { name: String(subject.name).trim(), ...parseRegistryAddress(address) };
  } catch (error) {
    console.error("Biała lista MF — błąd połączenia:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Budowanie faktury                                                   */
/* ------------------------------------------------------------------ */

type ClientFields = Pick<
  InfaktInvoice,
  | "client_business_activity_kind"
  | "client_company_name"
  | "client_first_name"
  | "client_last_name"
  | "client_tax_code"
  | "client_street"
  | "client_street_number"
  | "client_city"
  | "client_post_code"
>;

async function resolveClient(
  order: InfaktOrderSource,
  address: InvoiceAddress,
  warnings: string[]
): Promise<ClientFields> {
  const customer = order.customer ?? {};
  const firstName = (customer.firstName ?? "").trim();
  const lastName = (customer.lastName ?? "").trim();
  const nip = normalizeNip(order.billing?.nip);

  const asPrivatePerson = (): ClientFields => ({
    client_business_activity_kind: "private_person",
    client_first_name: firstName,
    client_last_name: lastName,
    client_street: address.street,
    client_street_number: address.streetNumber,
    client_city: address.city,
    client_post_code: address.postCode,
  });

  if (!order.billing?.wantsInvoice || nip.length !== 10) {
    if (order.billing?.wantsInvoice) {
      warnings.push(
        `Klient prosił o fakturę na firmę, ale NIP „${order.billing?.nip ?? ""}" jest nieprawidłowy — faktura wystawiona na osobę prywatną.`
      );
    }
    return asPrivatePerson();
  }

  const registry = await fetchCompanyByNip(nip);
  if (!registry) {
    warnings.push(
      `Nie udało się pobrać danych firmy z Białej listy MF dla NIP ${nip} — użyto nazwy i adresu z zamówienia.`
    );
    return {
      client_business_activity_kind: "other_business",
      client_company_name: (order.billing?.companyName || `${firstName} ${lastName}`).trim(),
      client_tax_code: nip,
      client_street: address.street,
      client_street_number: address.streetNumber,
      client_city: address.city,
      client_post_code: address.postCode,
    };
  }

  // Rejestr bywa niekompletny (np. brak adresu przy zawieszonej działalności) —
  // brakujące pola uzupełniamy adresem z zamówienia, żeby faktura nie przeszła bez adresu.
  const incomplete = !registry.city || !registry.postCode;
  if (incomplete) {
    warnings.push(
      `Biała lista MF nie podała pełnego adresu dla NIP ${nip} — brakujące pola uzupełniono adresem z zamówienia.`
    );
  }

  return {
    client_business_activity_kind: "other_business",
    client_company_name: registry.name,
    client_tax_code: nip,
    client_street: registry.street || address.street,
    client_street_number: registry.streetNumber || address.streetNumber,
    client_city: registry.city || address.city,
    client_post_code: registry.postCode || address.postCode,
  };
}

/**
 * Zamienia zamówienie na treść faktury: zawsze jedna pozycja z ceną brutto
 * równą kwocie, którą klient faktycznie zapłacił (towar razem z dostawą).
 *
 * `warnings` to sygnały do sprawdzenia przez sprzedawcę — faktura i tak
 * powstaje, ale któreś dane trzeba było wziąć z zamówienia zamiast z rejestru.
 */
export async function buildInvoicePayload(
  order: InfaktOrderSource
): Promise<{ invoice: InfaktInvoice; warnings: string[] }> {
  const warnings: string[] = [];
  const items = order.items ?? [];
  const grossPrice = Math.round(((order.totals?.total ?? 0) + Number.EPSILON) * 100);
  const date = warsawDate(order.paidAt ?? order.createdAt);

  const address = resolveBillingAddress(order);
  const client = await resolveClient(order, address, warnings);

  const invoice: InfaktInvoice = {
    // Faktura powstaje od razu jako wystawiona i opłacona — sklep księguje
    // wyłącznie zamówienia, za które pieniądze już wpłynęły.
    status: "paid",
    paid_date: date,
    paid_price: grossPrice,
    payment_method: INFAKT_PAYMENT_METHODS[order.payment?.method ?? ""] ?? "other",
    invoice_date: date,
    sale_date: date,
    payment_date: date,
    notes: order.orderNumber ? `Zamówienie: ${order.orderNumber}` : "",
    client_country: "PL",
    ...client,
    services: [
      {
        name: buildServiceName(items),
        tax_symbol: INFAKT_TAX_SYMBOL,
        unit: INFAKT_UNIT,
        quantity: 1,
        gross_price: grossPrice,
      },
    ],
  };

  return { invoice, warnings };
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

function describeErrors(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  const errors = (record.invoice_errors ?? record.errors ?? record.error) as unknown;

  if (typeof errors === "string") return errors;
  if (errors && typeof errors === "object") {
    return Object.entries(errors as Record<string, unknown>)
      .map(([field, messages]) => `${field}: ${[messages].flat().join(", ")}`)
      .join("; ");
  }
  return "";
}

async function callInfakt<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = process.env.INFAKT_API_KEY;
  if (!apiKey) throw new InfaktError("Brak INFAKT_API_KEY w zmiennych środowiskowych.");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "X-inFakt-ApiKey": apiKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = describeErrors(data) || text.slice(0, 300);
    throw new InfaktError(`inFakt API ${response.status}: ${detail}`, { details: data });
  }

  return data as T;
}

interface InfaktTaskStatus {
  invoice_task_reference_number: string;
  processing_code: number;
  processing_description?: string;
  invoice_uuid?: string;
  invoice_errors?: Record<string, string[]>;
}

/** Status zlecenia utworzenia faktury: 100/120/140 — w toku, 201 — gotowe, 422 — odrzucone. */
export async function getInvoiceTaskStatus(taskReference: string): Promise<InfaktTaskStatus> {
  return callInfakt<InfaktTaskStatus>(
    `/async/invoices/status/${encodeURIComponent(taskReference)}.json`
  );
}

/** Szczegóły wystawionej faktury — potrzebujemy z nich numeru. */
export async function getInvoice(uuid: string): Promise<{ uuid: string; number?: string }> {
  return callInfakt(`/invoices/${encodeURIComponent(uuid)}.json`);
}

async function waitForInvoiceUuid(taskReference: string): Promise<string> {
  for (const delay of POLL_DELAYS_MS) {
    await sleep(delay);
    const status = await getInvoiceTaskStatus(taskReference);

    if (status.processing_code === 201 && status.invoice_uuid) return status.invoice_uuid;
    if (status.processing_code === 422) {
      throw new InfaktError(
        `inFakt odrzucił fakturę: ${describeErrors(status) || status.processing_description || "brak szczegółów"}`,
        { details: status }
      );
    }
  }

  // Zlecenie nadal się przetwarza. Nie ponawiamy tworzenia — numer referencyjny
  // zapisujemy przy zamówieniu, żeby dało się dokończyć sprawdzanie później.
  throw new InfaktError("inFakt nie zdążył przetworzyć faktury — sprawdź status za chwilę.", {
    taskReference,
  });
}

async function fetchInvoiceNumber(uuid: string): Promise<string | null> {
  try {
    const details = await getInvoice(uuid);
    return details?.number ?? null;
  } catch (error) {
    // Numer jest tylko informacją dla panelu — faktura już istnieje.
    console.error("inFakt: nie udało się pobrać numeru faktury:", error);
    return null;
  }
}

/** Dokańcza zlecenie, o którym wiemy tylko tyle, że zostało przyjęte. */
export async function resolveInvoiceTask(
  taskReference: string
): Promise<InfaktCreatedInvoice | null> {
  const status = await getInvoiceTaskStatus(taskReference);
  if (status.processing_code !== 201 || !status.invoice_uuid) return null;

  return {
    uuid: status.invoice_uuid,
    number: await fetchInvoiceNumber(status.invoice_uuid),
    taskReference,
  };
}

/** Wystawia fakturę i czeka na jej numer. */
export async function createInvoice(invoice: InfaktInvoice): Promise<InfaktCreatedInvoice> {
  const created = await callInfakt<{ invoice_task_reference_number: string }>(
    "/async/invoices.json",
    { method: "POST", body: JSON.stringify({ invoice }) }
  );

  const taskReference = created?.invoice_task_reference_number;
  if (!taskReference) {
    throw new InfaktError("inFakt nie zwrócił numeru referencyjnego zlecenia.", {
      details: created,
    });
  }

  const uuid = await waitForInvoiceUuid(taskReference);
  return { uuid, number: await fetchInvoiceNumber(uuid), taskReference };
}
