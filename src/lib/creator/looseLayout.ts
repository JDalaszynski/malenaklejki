/**
 * Układ pojedynczych sztuk w wizualizacji zestawu.
 *
 * Przy formie „Pojedyncze sztuki" arkusz nie istnieje, więc wizualizacja
 * pokazuje same wycięte naklejki poukładane w rzędach. Ten plik liczy, gdzie
 * która leży i jak bardzo trzeba je przeskalować, żeby razem wypełniły kadr.
 * Czysta geometria w milimetrach — bez Reacta, żeby dało się ją sprawdzić
 * skryptem na dowolnej liczbie naklejek.
 */

export type LooseItem<T> = {
  ref: T;
  /** Rozmiar gotowej, wyciętej naklejki (grafika + margines linii cięcia), mm. */
  w: number;
  h: number;
};

export type LoosePlacement<T> = {
  ref: T;
  /** Środek naklejki mierzony od środka kadru, już po przeskalowaniu, mm. */
  cx: number;
  cy: number;
};

export type LooseLayout<T> = {
  /** Skala wspólna dla wszystkich naklejek — proporcje między nimi zostają. */
  scale: number;
  rows: number;
  placed: LoosePlacement<T>[];
};

export type LooseLayoutOptions = {
  /** Odstęp między naklejkami, mm (przed skalowaniem). */
  gap?: number;
  /**
   * Przy kilku naklejkach wolno je powiększyć, żeby nie tonęły w pustym
   * kadrze — nie ma tu arkusza, do którego można by porównać rozmiar.
   */
  maxScale?: number;
  /**
   * „Jedna obok drugiej" czyta się lepiej niż kolumna, więc dokładamy rząd
   * tylko wtedy, gdy naklejki urosną dzięki temu co najmniej o tyle.
   */
  rowBias?: number;
};

type Packed<T> = {
  rows: LooseItem<T>[][];
  rowSizes: { w: number; h: number }[];
  totalW: number;
  totalH: number;
  fit: number;
};

// Każda próba zwęża najszerszy rząd, więc układów jest skończenie wiele;
// limit chroni tylko przed patologicznym zestawem setek różnych szerokości.
const MAX_ATTEMPTS = 600;

export function layoutLooseStickers<T>(
  items: LooseItem<T>[],
  frameW: number,
  frameH: number,
  { gap = 5, maxScale = 1.8, rowBias = 1.08 }: LooseLayoutOptions = {},
): LooseLayout<T> {
  if (items.length === 0 || !(frameW > 0) || !(frameH > 0)) {
    return { scale: 1, rows: 0, placed: [] };
  }

  // Od najwyższych: rząd jest tak wysoki jak jego najwyższa naklejka, więc
  // naklejki podobnej wysokości obok siebie nie marnują miejsca. Sortowanie
  // jest stabilne — kopie tej samej naklejki zostają przy sobie.
  const sorted = [...items].sort((a, b) => b.h - a.h || b.w - a.w);

  // Łamanie na rzędy — jak tekst: dokładamy do rzędu, dopóki się mieści.
  const pack = (maxRowMm: number): Packed<T> => {
    const rows: LooseItem<T>[][] = [];
    let row: LooseItem<T>[] = [];
    let rowW = 0;
    for (const it of sorted) {
      const withIt = row.length === 0 ? it.w : rowW + gap + it.w;
      if (row.length > 0 && withIt > maxRowMm) {
        rows.push(row);
        row = [it];
        rowW = it.w;
      } else {
        row.push(it);
        rowW = withIt;
      }
    }
    if (row.length > 0) rows.push(row);

    const rowSizes = rows.map((r) => ({
      w: r.reduce((sum, it, i) => sum + it.w + (i > 0 ? gap : 0), 0),
      h: Math.max(...r.map((it) => it.h)),
    }));
    const totalW = Math.max(1, ...rowSizes.map((r) => r.w));
    const totalH = Math.max(
      1,
      rowSizes.reduce((sum, r, i) => sum + r.h + (i > 0 ? gap : 0), 0),
    );
    const fit = Math.min(maxScale, frameW / totalW, frameH / totalH);
    return { rows, rowSizes, totalW, totalH, fit };
  };

  // Przymierzamy wszystkie układy: od jednego długiego rzędu po kolumnę.
  // Szerokość łamania NIE jest ograniczona szerokością kadru — gdy naklejek
  // jest dużo, i tak trzeba je pomniejszyć, a wtedy w rzędzie mieści się ich
  // więcej, niż wynikałoby z rozmiaru 1:1. Łamanie „na szerokość kadru"
  // dawało wysoki, wąski słupek pomniejszonych naklejek z pustymi bokami.
  const candidates: Packed<T>[] = [];
  let wrap = Infinity;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = pack(wrap);
    candidates.push(candidate);
    if (candidate.rows.length >= sorted.length) break;
    // Odrobinę węziej niż najszerszy rząd — to wymusza kolejne złamanie.
    wrap = candidate.totalW - 0.01;
  }

  // Największe naklejki dostajemy tam, gdzie układ ma proporcje kadru, czyli
  // wypełnia go i na szerokość, i na wysokość. Spośród układów niemal równie
  // dobrych wygrywa ten o najmniejszej liczbie rzędów.
  const bestFit = Math.max(...candidates.map((c) => c.fit));
  const acceptable = candidates.filter((c) => c.fit * rowBias >= bestFit);
  const fewestRows = Math.min(...acceptable.map((c) => c.rows.length));
  const best = acceptable
    .filter((c) => c.rows.length === fewestRows)
    .reduce((a, b) => (b.fit > a.fit ? b : a));

  const { rows, rowSizes, totalH, fit } = best;
  const placed: LoosePlacement<T>[] = [];
  let y = -totalH / 2;
  rows.forEach((r, ri) => {
    const size = rowSizes[ri];
    // Każdy rząd wyśrodkowany — niepełny ostatni rząd nie ucieka w bok.
    let x = -size.w / 2;
    for (const it of r) {
      placed.push({
        ref: it.ref,
        cx: (x + it.w / 2) * fit,
        cy: (y + size.h / 2) * fit,
      });
      x += it.w + gap;
    }
    y += size.h + gap;
  });

  return { scale: fit, rows: rows.length, placed };
}
