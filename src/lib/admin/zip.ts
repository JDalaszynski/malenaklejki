/**
 * Minimalny zapis archiwum ZIP — bez kompresji (metoda „store”).
 *
 * Pliki produkcyjne to PNG, które są już skompresowane, więc deflate zyskałby
 * promil kosztem CPU funkcji, a nowa zależność (jszip, archiver) dołożyłaby
 * kilkaset kilobajtów do paczki tylko po to, żeby ułożyć nagłówki. Format jest
 * prosty: lokalny nagłówek + dane dla każdego pliku, potem katalog centralny.
 *
 * Bez ZIP64 — limit to 4 GB na plik i 65 535 plików, a tu są dziesiątki
 * megabajtów i kilka plików.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipEntry = { name: string; data: Uint8Array };

/** Czas w formacie MS-DOS, którego wymaga ZIP (rozdzielczość 2 s, od roku 1980). */
function dosDateTime(date: Date): { time: number; day: number } {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

/** Flaga 11: nazwy plików w UTF-8 — bez niej polskie znaki rozjeżdżają się w archiwizatorach. */
const FLAG_UTF8 = 0x0800;

/** Składa całe archiwum jako listę kawałków, od lokalnych nagłówków po koniec katalogu. */
export function buildZip(entries: ZipEntry[], modified = new Date()): Uint8Array[] {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(modified);
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // wersja potrzebna do rozpakowania
    local.setUint16(6, FLAG_UTF8, true);
    local.setUint16(8, 0, true); // metoda: store
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true);
    local.setUint32(22, size, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);

    const header = new Uint8Array(local.buffer);
    chunks.push(header, name, entry.data);

    const record = new DataView(new ArrayBuffer(46));
    record.setUint32(0, 0x02014b50, true);
    record.setUint16(4, 20, true); // wersja, w której powstało
    record.setUint16(6, 20, true);
    record.setUint16(8, FLAG_UTF8, true);
    record.setUint16(10, 0, true);
    record.setUint16(12, time, true);
    record.setUint16(14, day, true);
    record.setUint32(16, crc, true);
    record.setUint32(20, size, true);
    record.setUint32(24, size, true);
    record.setUint16(28, name.length, true);
    record.setUint32(42, offset, true);
    central.push(new Uint8Array(record.buffer), name);

    offset += header.length + name.length + size;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return [...chunks, ...central, new Uint8Array(end.buffer)];
}

/**
 * Strumień z gotowych kawałków, cięty na porcje po 256 KB.
 *
 * Odpowiedź musi być strumieniem, nie jednym buforem: funkcje Vercela mają
 * limit 4,5 MB na ciało odpowiedzi, który nie dotyczy odpowiedzi
 * strumieniowanych, a arkusze do druku ważą po kilka megabajtów.
 */
export function streamOf(chunks: Uint8Array[], slice = 256 * 1024): ReadableStream<Uint8Array> {
  const queue: Uint8Array[] = [];
  for (const chunk of chunks) {
    for (let start = 0; start < chunk.length; start += slice) {
      queue.push(chunk.subarray(start, Math.min(start + slice, chunk.length)));
    }
  }

  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < queue.length) controller.enqueue(queue[index++]);
      else controller.close();
    },
  });
}
