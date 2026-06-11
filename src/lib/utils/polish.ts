/**
 * Zwraca poprawną odmianę słowa "naklejka" w języku polskim w zależności od liczby.
 */
export function getStickersNoun(count: number): string {
  if (count === 1) return "naklejka";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "naklejki";
  }
  return "naklejek";
}
