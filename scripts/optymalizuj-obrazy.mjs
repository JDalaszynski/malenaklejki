/**
 * Odchudza obrazy w `public/` bez zmiany ich nazw i adresów URL.
 *
 * Po co: wszystko z `public/` trafia do KAŻDEGO wdrożenia na Vercelu i liczy się
 * do limitu Deployment Storage (10 GB na planie Hobby). Zdjęcia do wpisów bywają
 * 3-12 MB, a strona artykułu serwuje je jako zwykłe `<img>`, więc ciężkie pliki
 * boli też czytelnik. Adresów nie ruszamy, bo są w sitemapie i w indeksie grafiki Google.
 *
 *  - PNG: ta sama nazwa, paleta 256 kolorów z ditheringiem (zwykle -70/-80%,
 *    na grafikach AI i zdjęciach produktowych różnica jest niewidoczna na oko),
 *  - JPG/JPEG: mozjpeg q85, szerokość maks. 2000 px,
 *  - plik jest podmieniany tylko wtedy, gdy zyskuje co najmniej 15% — dzięki temu
 *    skrypt jest idempotentny: drugie uruchomienie niczego nie zmienia.
 *
 * Pomijamy `logo/` i `payment-icons/` (płaskie grafiki, gdzie paleta mogłaby
 * zepsuć krawędzie) oraz pliki poniżej 150 KB.
 *
 * Użycie:
 *   node scripts/optymalizuj-obrazy.mjs --dry            # tylko raport, bez zapisu
 *   node scripts/optymalizuj-obrazy.mjs                  # blog, landing, images
 *   node scripts/optymalizuj-obrazy.mjs public/blog/{slug}
 *
 * Kolejność w pracy nad wpisem: NAJPIERW generatory social/Pinterest, potem pasek
 * z logo (`add_logo_bar.mjs`), a ten skrypt na samym końcu.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const DEFAULT_DIRS = ["public/blog", "public/landing", "public/images"];
const SKIP_DIRS = new Set(["logo", "payment-icons"]);
const MIN_BYTES = 150 * 1024;
const MIN_SAVING = 0.15;
const MAX_WIDTH = 2000;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const dirs = args.filter((a) => !a.startsWith("--"));
const targets = (dirs.length ? dirs : DEFAULT_DIRS).map((d) => path.resolve(ROOT, d));

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(full);
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      yield full;
    }
  }
}

async function encode(file, isPng) {
  // `.rotate()` stosuje orientację EXIF przed jej usunięciem przy zapisie.
  const image = sharp(file).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  return isPng
    ? image.png({ palette: true, colours: 256, quality: 100, effort: 10, dither: 1.0 }).toBuffer()
    : image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

let before = 0;
let after = 0;
let changed = 0;
let seen = 0;

for (const target of targets) {
  for await (const file of walk(target)) {
    const { size } = await fs.stat(file);
    if (size < MIN_BYTES) continue;
    seen += 1;

    const isPng = /\.png$/i.test(file);
    const output = await encode(file, isPng);
    const saving = 1 - output.length / size;
    const rel = path.relative(ROOT, file);

    if (saving < MIN_SAVING) {
      before += size;
      after += size;
      continue;
    }

    before += size;
    after += output.length;
    changed += 1;
    console.log(
      `${dry ? "[dry] " : ""}${rel}: ${(size / 1024).toFixed(0)} KB -> ${(output.length / 1024).toFixed(0)} KB (-${(saving * 100).toFixed(0)}%)`,
    );
    if (!dry) {
      const tmp = `${file}.tmp`;
      await fs.writeFile(tmp, output);
      await fs.rename(tmp, file);
    }
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `\n${dry ? "[dry] " : ""}Sprawdzono ${seen} plików, ${dry ? "do zmiany" : "zmieniono"} ${changed}. ` +
    `${mb(before)} MB -> ${mb(after)} MB (oszczędność ${mb(before - after)} MB).`,
);
