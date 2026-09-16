/**
 * Kopiuje zasoby pdf.js z `node_modules/pdfjs-dist` do `public/pdfjs/<wersja>/`.
 *
 * Kreator zamienia strony PDF na PNG w przeglądarce (`src/lib/utils/pdf.ts`).
 * Do tego pdf.js potrzebuje plików, których bundler nie dołączy sam:
 *  - `pdf.worker.min.mjs` - parser PDF działający w Web Workerze,
 *  - `standard_fonts/` - kroje dla PDF-ów bez osadzonych fontów (np. Helvetica z Worda),
 *  - `cmaps/` - mapy znaków dla fontów CID,
 *  - `wasm/` - dekodery JPEG 2000 i JBIG2 (skany) oraz zarządzanie kolorem,
 *  - `iccs/` - profil do konwersji CMYK -> RGB.
 *
 * Wersja w ścieżce gwarantuje, że przeglądarka nie połączy nowej biblioteki ze starym
 * workerem z cache (pdf.js odrzuca taką parę). Katalog jest w `.gitignore` - skrypt
 * uruchamia się sam przed `npm run dev` i `npm run build`.
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "node_modules/pdfjs-dist");
const TARGET_ROOT = path.join(ROOT, "public/pdfjs");

const { version } = JSON.parse(
  await fs.readFile(path.join(SOURCE, "package.json"), "utf8"),
);
const target = path.join(TARGET_ROOT, version);

await fs.rm(TARGET_ROOT, { recursive: true, force: true });
await fs.mkdir(target, { recursive: true });

await fs.copyFile(
  path.join(SOURCE, "legacy/build/pdf.worker.min.mjs"),
  path.join(target, "pdf.worker.min.mjs"),
);
for (const dir of ["standard_fonts", "cmaps", "wasm", "iccs"]) {
  await fs.cp(path.join(SOURCE, dir), path.join(target, dir), { recursive: true });
}

console.log(`pdf.js ${version}: zasoby skopiowane do public/pdfjs/${version}/`);
