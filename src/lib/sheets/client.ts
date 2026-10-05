import type { PublicSheetLayout, PublicSheetsResponse } from "./types";

/**
 * Gotowe zestawy od strony przeglądarki: lista do galerii i układy do
 * kreatora. Obie rzeczy pobieramy dopiero wtedy, gdy klient po nie sięgnie —
 * strona główna ładuje się bez nich.
 */

/** Lista żyje krótko, żeby ponowne otwarcie galerii nie pytało serwera za każdym razem. */
const LIST_TTL_MS = 60_000;

let list: { promise: Promise<PublicSheetsResponse>; at: number } | null = null;
const layouts = new Map<string, Promise<PublicSheetLayout>>();

export function loadReadySheets(): Promise<PublicSheetsResponse> {
  if (list && Date.now() - list.at < LIST_TTL_MS) return list.promise;

  const promise = fetch("/api/gotowe-zestawy", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as PublicSheetsResponse;
    if (!Array.isArray(body?.sheets)) throw new Error("Brak listy zestawów");
    return body;
  });

  const entry = { promise, at: Date.now() };
  list = entry;
  // Nieudana próba nie zostaje w pamięci — „Spróbuj ponownie" ma pytać od nowa.
  promise.catch(() => {
    if (list === entry) list = null;
  });
  return promise;
}

/**
 * Układ zestawu. Ze znacznikiem wersji adres jest stały dla danej wersji
 * zestawu, więc odpowiada pamięć przeglądarki albo brzeg sieci; bez niego
 * (wejście z linku) serwer zawsze oddaje stan bieżący.
 */
export function loadReadySheetLayout(id: string, version?: string): Promise<PublicSheetLayout> {
  const key = `${id}@${version ?? ""}`;
  const cached = layouts.get(key);
  if (cached) return cached;

  const url = version
    ? `/api/gotowe-zestawy/${id}?v=${encodeURIComponent(version)}`
    : `/api/gotowe-zestawy/${id}`;

  const promise = fetch(url, version ? undefined : { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const layout = (await response.json()) as PublicSheetLayout;
    if (!Array.isArray(layout?.stickers)) throw new Error("Brak układu");
    return layout;
  });

  layouts.set(key, promise);
  promise.catch(() => layouts.delete(key));
  return promise;
}
