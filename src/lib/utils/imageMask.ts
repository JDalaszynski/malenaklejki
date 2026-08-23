/**
 * Wspólna klasyfikacja tła dla grafik naklejek.
 *
 * Zarówno obrys linii cięcia (`getContourPoints`), jak i wybijanie białego tła do
 * przezroczystości (`getTransparentImageUrl`) muszą widzieć DOKŁADNIE ten sam
 * kształt — inaczej linia cięcia biegłaby gdzie indziej niż faktyczna krawędź
 * grafiki. Dlatego klasyfikacja żyje tutaj, w jednym miejscu, a oba moduły ją
 * importują.
 */

/** Poniżej tej alfy piksel jest przezroczysty, czyli na pewno tłem. */
export const BG_ALPHA_MAX = 25;
/** Każdy kanał powyżej tej wartości = piksel „prawie biały", czyli kandydat na tło. */
export const BG_WHITE_MIN = 240;

/**
 * Zwraca maskę pierwszego planu (1 = grafika, 0 = tło) dla surowych pikseli RGBA.
 *
 * Piksel jest tłem, gdy jest przezroczysty ALBO jest prawie biały i łączy się z
 * krawędzią obrazu. Zalanie od krawędzi jest kluczowe: białe wnętrze kształtu
 * (oczy postaci, środek litery „O", biały napis na kolorowym tle) zostaje
 * grafiką, bo nie ma połączenia z zewnętrzem.
 */
export function computeForegroundMask(
  data: Uint8ClampedArray,
  w: number,
  h: number
): Uint8Array {
  const pixelCount = w * h;

  // 0 = tło pewne (przezroczyste), 1 = grafika pewna, 2 = tło potencjalne (prawie białe)
  const cls = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const a = data[idx + 3];
    if (a < BG_ALPHA_MAX) {
      cls[i] = 0;
    } else if (
      data[idx] > BG_WHITE_MIN &&
      data[idx + 1] > BG_WHITE_MIN &&
      data[idx + 2] > BG_WHITE_MIN
    ) {
      cls[i] = 2;
    } else {
      cls[i] = 1;
    }
  }

  // Zalanie od krawędzi obrazu zamienia połączone tło potencjalne (2) w pewne (0).
  // Poza obrazem wszystko jest przezroczyste, więc start z ramki jest równoważny
  // startowi spoza obrazu.
  const fillStack = new Int32Array(pixelCount);
  const fillSeen = new Uint8Array(pixelCount);
  let fsp = 0;
  const pushBg = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    if (fillSeen[i] || cls[i] === 1) return;
    fillSeen[i] = 1;
    cls[i] = 0;
    fillStack[fsp++] = i;
  };
  for (let x = 0; x < w; x++) {
    pushBg(x, 0);
    pushBg(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushBg(0, y);
    pushBg(w - 1, y);
  }
  while (fsp > 0) {
    const i = fillStack[--fsp];
    const x = i % w;
    const y = (i / w) | 0;
    pushBg(x + 1, y);
    pushBg(x - 1, y);
    pushBg(x, y + 1);
    pushBg(x, y - 1);
  }

  // Pozostałe 2 (odizolowane białe obszary wewnątrz grafiki) to pierwszy plan.
  const fg = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) fg[i] = cls[i] === 0 ? 0 : 1;
  return fg;
}
