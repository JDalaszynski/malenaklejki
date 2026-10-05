/**
 * Podpowiedzi wyszukiwarki Google (PL) dla fraz-zalążków - surowiec do baz słów kluczowych.
 *
 *   node scripts/podpowiedzi-google.mjs "naklejki na znicze" "znicz ze zdjęciem" > wynik.json
 *   node scripts/podpowiedzi-google.mjs --bez-alfabetu "napis na znicz"
 *
 * Dla każdej frazy pyta o samą frazę i (domyślnie) o frazę + każdą literę alfabetu.
 * To SYGNAŁ istnienia popytu i jego kształtu (jakie dopiski ludzie dopisują), a NIE wolumen:
 * podpowiedź nie mówi, ile razy fraza pada w miesiącu. Wolumen potwierdzaj w Search Console.
 *
 * Wynik (JSON na stdout): { data, jezyk, frazy: { "<zalążek>": ["podpowiedź", ...] } }.
 * Skrypt nie ma zależności i nic nie zapisuje - przekieruj wynik do pliku w `landing-agent/dane/`.
 */

const ALFABET = "abcdefghijklmnoprstuwyz".split("");
const PAUZA_MS = 80;

const argumenty = process.argv.slice(2);
const bezAlfabetu = argumenty.includes("--bez-alfabetu");
const zalazki = argumenty.filter((a) => !a.startsWith("--"));

if (zalazki.length === 0) {
  console.error('Podaj co najmniej jedną frazę, np. node scripts/podpowiedzi-google.mjs "naklejki na znicze"');
  process.exit(1);
}

const pauza = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function podpowiedzi(fraza) {
  const adres = `https://suggestqueries.google.com/complete/search?client=firefox&hl=pl&gl=pl&q=${encodeURIComponent(fraza)}`;
  try {
    const odpowiedz = await fetch(adres, { signal: AbortSignal.timeout(10000) });
    if (!odpowiedz.ok) return [];
    const [, lista] = await odpowiedz.json();
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

const frazy = {};
for (const zalazek of zalazki) {
  const wynik = new Set(await podpowiedzi(zalazek));
  if (!bezAlfabetu) {
    for (const litera of ALFABET) {
      for (const podpowiedz of await podpowiedzi(`${zalazek} ${litera}`)) wynik.add(podpowiedz);
      await pauza(PAUZA_MS);
    }
  }
  frazy[zalazek] = [...wynik].sort((a, b) => a.localeCompare(b, "pl"));
}

console.log(
  JSON.stringify({ data: new Date().toISOString().slice(0, 10), jezyk: "pl", frazy }, null, 1)
);
