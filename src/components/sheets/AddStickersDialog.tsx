"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { maxPlacementWidthCm } from "@/lib/creator/sheetOps";
import { addBlobToLibrary } from "@/lib/sheets/upload";
import { MAX_STICKER_NAME, type CutLineType, type LibrarySticker } from "@/lib/sheets/types";
import { CutLineOptions } from "./CutLineOptions";
import { Modal, inputClass, primaryButtonClass, secondaryButtonClass } from "./Modal";

export type PendingSticker = {
  key: string;
  blob: Blob;
  /** Adres `blob:` do miniatury w oknie — zwalnia go rodzic. */
  previewUrl: string;
  fileName: string;
  name: string;
  aspectRatio: number;
  /** Strona PDF ma swój fizyczny rozmiar — przenosimy go do bazy. */
  widthCm: number;
};

function formatCm(value: number): string {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

/**
 * Dodawanie grafik do bazy poza edytorem arkusza: nazwy dla każdej z osobna,
 * wspólna linia cięcia i rozmiar dla całej paczki.
 */
export function AddStickersDialog({
  items,
  onChange,
  onClose,
  onAdded,
}: {
  items: PendingSticker[];
  onChange: (items: PendingSticker[]) => void;
  onClose: () => void;
  onAdded: (result: { added: LibrarySticker[]; existing: LibrarySticker[]; errors: string[] }) => void;
}) {
  const [cutLineType, setCutLineType] = useState<CutLineType>("contour");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const busy = progress !== null;

  const submit = async () => {
    const added: LibrarySticker[] = [];
    const existing: LibrarySticker[] = [];
    const errors: string[] = [];

    setProgress({ done: 0, total: items.length });
    for (const [index, item] of items.entries()) {
      const widthCm = Math.min(item.widthCm, maxPlacementWidthCm(item.aspectRatio, cutLineType));
      const result = await addBlobToLibrary({
        blob: item.blob,
        fileName: item.fileName,
        name: item.name.trim() || item.fileName,
        cutLineType,
        widthCm,
      });
      if (!result.ok) errors.push(result.error);
      else if (result.existing) existing.push(result.sticker);
      else added.push(result.sticker);
      setProgress({ done: index + 1, total: items.length });
    }
    setProgress(null);
    onAdded({ added, existing, errors });
  };

  return (
    <Modal
      title={`Nowe naklejki (${items.length})`}
      description="Nadaj nazwy, po których znajdziesz je w wyszukiwarce, i wybierz linię cięcia."
      onClose={onClose}
      size="lg"
      busy={busy}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>
            Anuluj
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || items.length === 0}
            className={primaryButtonClass}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="w-4 h-4" aria-hidden />
            )}
            {busy ? `Wgrywanie ${progress.done}/${progress.total}…` : `Dodaj do bazy (${items.length})`}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-sm font-bold text-foreground block mb-2">Linia cięcia dla wszystkich</span>
          <CutLineOptions value={cutLineType} onChange={setCutLineType} disabled={busy} />
        </div>

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2 pr-3"
            >
              <div className="w-14 h-14 shrink-0 rounded-xl border border-border/50 bg-white flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- lokalny podgląd blob: */}
                <img src={item.previewUrl} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <input
                  value={item.name}
                  maxLength={MAX_STICKER_NAME}
                  disabled={busy}
                  aria-label={`Nazwa naklejki z pliku ${item.fileName}`}
                  onChange={(event) =>
                    onChange(
                      items.map((other) =>
                        other.key === item.key ? { ...other, name: event.target.value } : other
                      )
                    )
                  }
                  className={`${inputClass} h-10`}
                />
                <p className="text-[11px] font-medium text-muted-foreground mt-1 truncate">
                  {item.fileName} · {formatCm(item.widthCm)} cm szerokości
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((other) => other.key !== item.key))}
                disabled={busy}
                className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                aria-label={`Pomiń ${item.fileName}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>

        <p className="text-[11px] font-medium text-muted-foreground">
          Grafiki, które już są w bazie, rozpoznajemy po zawartości pliku i nie dodajemy drugi raz.
          Rozmiar zmienisz później w ustawieniach naklejki albo na arkuszu.
        </p>
      </div>
    </Modal>
  );
}
