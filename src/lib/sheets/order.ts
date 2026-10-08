/**
 * Kolejność gotowych zestawów wybrana przez właściciela.
 *
 * Moduł jest czysty (bez Firestore), bo tę samą kolejność stosuje sklep
 * (galeria w kreatorze, katalog, strony zestawów) i lista w panelu — dzięki
 * temu panel pokazuje dokładnie to, co zobaczy klient.
 *
 * Zapisana jest lista identyfikatorów w wybranym porządku. Zestaw spoza listy
 * (świeżo opublikowany, szkic, którego jeszcze nie ustawiono) trafia na
 * początek, najnowszy pierwszy — tak sklep działał, zanim kolejność dało się
 * wybrać, więc nowość zawsze jest widoczna, dopóki właściciel jej nie przesunie.
 */

/** Ile miejsc mieści zapisana kolejność — z zapasem ponad limit listy w panelu. */
export const MAX_ORDERED_SHEETS = 500;

type Orderable = {
  id: string;
  publishedAt?: string | null;
  createdAt?: string | null;
};

/** Najnowsze najpierw: po dacie publikacji, a szkice po dacie utworzenia. */
export function byNewest(a: Orderable, b: Orderable): number {
  return (b.publishedAt || b.createdAt || "").localeCompare(a.publishedAt || a.createdAt || "");
}

/** Zestawy w kolejności właściciela; reszta na początku, od najnowszych. */
export function applySheetOrder<T extends Orderable>(items: T[], order: readonly string[]): T[] {
  const rank = new Map<string, number>();
  order.forEach((id, index) => {
    if (!rank.has(id)) rank.set(id, index);
  });

  const listed = items
    .filter((item) => rank.has(item.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  const unlisted = items.filter((item) => !rank.has(item.id)).sort(byNewest);
  return [...unlisted, ...listed];
}

/** Przesuwa element o jedno miejsce; poza krańcami zwraca tę samą listę. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
