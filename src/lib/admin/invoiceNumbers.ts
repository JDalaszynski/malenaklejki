import "server-only";

import { db } from "@/lib/firebase/admin";
import {
  findInvoiceByUuid,
  listInvoicesBySaleDate,
  normalizeNip,
  warsawDate,
  type InfaktInvoiceListItem,
} from "@/lib/infakt";
import { recordAudit } from "./audit";
import type { AdminOrder } from "./queries";

/**
 * Numery faktur do ewidencji sprzedaży, uzgadniane z inFaktem przy każdym
 * generowaniu raportu.
 *
 * Numer zapisany przy zamówieniu w chwili wystawienia nie jest pewny: inFakt
 * przenumerowuje faktury po usunięciu wcześniejszej (tak rozjechały się
 * numery końcem sierpnia 2026). Dlatego źródłem prawdy jest inFakt, a baza
 * dostaje poprawkę, gdy numer się zmienił.
 *
 * Faktury sprzed integracji wystawiano ręcznie, bez numeru zamówienia
 * w uwagach. Takie dopasowujemy po kwocie, dacie sprzedaży i nabywcy — tylko
 * gdy wynik jest jednoznaczny w obie strony.
 */

/** Ręczną fakturę wystawiano zwykle w dniu płatności, najpóźniej kilka dni później. */
const MATCH_WINDOW_DAYS = 3;

/** Firestore przyjmuje najwyżej 30 wartości w zapytaniu `in`. */
const IN_QUERY_LIMIT = 30;

export type InvoiceSyncResult = {
  /** Zamówienia z numerami faktur zgodnymi z inFaktem. */
  orders: AdminOrder[];
  /** `false`, gdy inFakt nie odpowiedział — numery pochodzą wtedy z bazy. */
  verified: boolean;
  /** Numery zamówień bez faktury w inFakcie. */
  missing: string[];
};

type Link = { invoice: InfaktInvoiceListItem; via: "uuid" | "notes" | "match" };

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T12:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(`${a}T12:00:00Z`).getTime() - new Date(`${b}T12:00:00Z`).getTime()) / 86_400_000
  );
}

/** Porównanie nazwisk odporne na wielkość liter, spacje i polskie znaki. */
function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Numer zamówienia z uwag faktury — automat wpisuje tam „Zamówienie: MNK-…”. */
function orderNumberFromNotes(notes: string | null | undefined): string | null {
  return notes?.match(/Zamówienie:\s*(\S+)/)?.[1] ?? null;
}

function paidDate(order: AdminOrder): string {
  return warsawDate(order.paidAt ?? order.createdAt);
}

/** Czy ręcznie wystawiona faktura wygląda na fakturę do tego zamówienia. */
function looksLikeInvoiceFor(order: AdminOrder, invoice: InfaktInvoiceListItem): boolean {
  if (invoice.kind !== "vat") return false;
  if (invoice.gross_price !== Math.round((order.totals.total + Number.EPSILON) * 100)) return false;
  if (Math.abs(daysBetween(invoice.sale_date, paidDate(order))) > MATCH_WINDOW_DAYS) return false;

  const nip = normalizeNip(order.billing.nip);
  if (order.billing.wantsInvoice && nip.length === 10 && normalizeNip(invoice.client_tax_code)) {
    return normalizeNip(invoice.client_tax_code) === nip;
  }

  const buyer = normalizeName(`${order.customer.firstName} ${order.customer.lastName}`);
  const client = normalizeName(`${invoice.client_first_name ?? ""} ${invoice.client_last_name ?? ""}`);
  return buyer !== "" && buyer === client;
}

/** Faktury, które w bazie są już przypięte do zamówień spoza bieżącego zestawienia. */
async function uuidsTakenElsewhere(uuids: string[], orderIds: Set<string>): Promise<Set<string>> {
  const taken = new Set<string>();
  for (let index = 0; index < uuids.length; index += IN_QUERY_LIMIT) {
    const snapshot = await db
      .collection("orders")
      .where("infakt.uuid", "in", uuids.slice(index, index + IN_QUERY_LIMIT))
      .get();
    for (const doc of snapshot.docs) {
      if (!orderIds.has(doc.id)) taken.add(doc.data().infakt.uuid);
    }
  }
  return taken;
}

async function resolveLinks(orders: AdminOrder[]): Promise<Map<string, Link | null>> {
  const dates = orders.map(paidDate).sort();
  const invoices = await listInvoicesBySaleDate(
    shiftDate(dates[0], -MATCH_WINDOW_DAYS),
    shiftDate(dates[dates.length - 1], MATCH_WINDOW_DAYS)
  );

  const byUuid = new Map(invoices.map((invoice) => [invoice.uuid, invoice]));
  const byOrderNumber = new Map<string, InfaktInvoiceListItem>();
  for (const invoice of invoices) {
    const orderNumber = orderNumberFromNotes(invoice.notes);
    if (orderNumber) byOrderNumber.set(orderNumber, invoice);
  }

  // Faktura spoza zakresu dat (np. wystawiona ręcznie tygodnie po płatności)
  // albo usunięta w inFakcie — o to pytamy już pojedynczo.
  const outside = orders
    .map((order) => order.infakt?.uuid)
    .filter((uuid): uuid is string => Boolean(uuid) && !byUuid.has(uuid!));
  const fetched = await Promise.all(outside.map((uuid) => findInvoiceByUuid(uuid)));
  outside.forEach((uuid, index) => {
    const invoice = fetched[index];
    if (invoice) byUuid.set(uuid, invoice);
  });

  const links = new Map<string, Link | null>();
  const claimed = new Set<string>();
  for (const invoice of invoices) {
    if (orderNumberFromNotes(invoice.notes)) claimed.add(invoice.uuid);
  }

  const unlinked: AdminOrder[] = [];
  for (const order of orders) {
    const uuid = order.infakt?.uuid;
    if (uuid) {
      const invoice = byUuid.get(uuid);
      links.set(order.id, invoice ? { invoice, via: "uuid" } : null);
      claimed.add(uuid);
      continue;
    }
    const invoice = byOrderNumber.get(order.orderNumber);
    if (invoice) {
      links.set(order.id, { invoice, via: "notes" });
      continue;
    }
    unlinked.push(order);
  }

  // Dopasowanie ręcznych faktur: jedno zamówienie — jedna faktura, w obie strony.
  const free = invoices.filter((invoice) => !claimed.has(invoice.uuid));
  const candidates = new Map(
    unlinked.map((order) => [order.id, free.filter((invoice) => looksLikeInvoiceFor(order, invoice))])
  );
  const demand = new Map<string, number>();
  for (const list of candidates.values()) {
    for (const invoice of list) demand.set(invoice.uuid, (demand.get(invoice.uuid) ?? 0) + 1);
  }

  const proposed = unlinked
    .map((order) => ({ order, list: candidates.get(order.id) ?? [] }))
    .filter(({ list }) => list.length === 1 && demand.get(list[0].uuid) === 1);

  const taken = proposed.length
    ? await uuidsTakenElsewhere(
        proposed.map(({ list }) => list[0].uuid),
        new Set(orders.map((order) => order.id))
      )
    : new Set<string>();

  for (const { order, list } of proposed) {
    if (!taken.has(list[0].uuid)) links.set(order.id, { invoice: list[0], via: "match" });
  }

  return links;
}

/** Zapisuje poprawione i nowo powiązane numery, żeby reszta panelu pokazywała to samo. */
async function persistLinks(
  orders: AdminOrder[],
  links: Map<string, Link | null>,
  actorEmail: string
): Promise<void> {
  const batch = db.batch();
  const audits: Parameters<typeof recordAudit>[0][] = [];

  for (const order of orders) {
    const link = links.get(order.id);
    if (!link) continue;
    const { invoice, via } = link;
    const ref = db.collection("orders").doc(order.id);

    if (via === "uuid") {
      if (order.invoiceNumber === invoice.number && order.infakt?.number === invoice.number) continue;
      batch.update(ref, { invoiceNumber: invoice.number, "infakt.number": invoice.number });
      audits.push({
        actorEmail,
        action: "Numer faktury uzgodniony z inFaktem",
        orderId: order.id,
        orderNumber: order.orderNumber,
        details: `${order.invoiceNumber ?? "brak"} → ${invoice.number}`,
      });
      continue;
    }

    // Wystawianie może właśnie trwać — tego stanu nie nadpisujemy.
    if (order.infakt?.status === "PENDING") continue;

    batch.update(ref, {
      invoiceNumber: invoice.number,
      "infakt.status": "ISSUED",
      "infakt.uuid": invoice.uuid,
      "infakt.number": invoice.number,
      "infakt.issuedAt": invoice.created_at ?? invoice.invoice_date,
      "infakt.error": null,
      "infakt.linkedBy": via,
    });
    audits.push({
      actorEmail,
      action: "Powiązanie faktury z inFaktu",
      orderId: order.id,
      orderNumber: order.orderNumber,
      details:
        via === "notes"
          ? `Faktura ${invoice.number} (numer zamówienia w uwagach faktury)`
          : `Faktura ${invoice.number} (zgodna kwota, data sprzedaży i nabywca)`,
    });
  }

  if (audits.length === 0) return;
  await batch.commit();
  await Promise.all(audits.map(recordAudit));
}

export async function syncInvoiceNumbers(
  orders: AdminOrder[],
  actorEmail: string
): Promise<InvoiceSyncResult> {
  const fromDatabase: InvoiceSyncResult = {
    orders,
    verified: false,
    missing: orders.filter((order) => !order.invoiceNumber).map((order) => order.orderNumber),
  };

  if (orders.length === 0) return { ...fromDatabase, verified: true };
  if (!process.env.INFAKT_API_KEY) return fromDatabase;

  let links: Map<string, Link | null>;
  try {
    links = await resolveLinks(orders);
  } catch (error) {
    console.error("inFakt: nie udało się uzgodnić numerów faktur w raporcie:", error);
    return fromDatabase;
  }

  try {
    await persistLinks(orders, links, actorEmail);
  } catch (error) {
    // Raport i tak pokaże numery z inFaktu — zapis poprawi się przy następnym otwarciu.
    console.error("inFakt: nie udało się zapisać numerów faktur przy zamówieniach:", error);
  }

  const synced = orders.map((order) => {
    const link = links.get(order.id);
    if (link) return { ...order, invoiceNumber: link.invoice.number };
    // Faktura przypięta do zamówienia zniknęła z inFaktu — stary numer byłby mylący.
    if (link === null) return { ...order, invoiceNumber: null };
    return order;
  });

  return {
    orders: synced,
    verified: true,
    missing: synced.filter((order) => !order.invoiceNumber).map((order) => order.orderNumber),
  };
}
