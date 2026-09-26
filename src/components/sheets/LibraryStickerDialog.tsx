"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";

import { deleteLibrarySticker, updateLibrarySticker } from "@/app/actions/sheets";
import { formatDateTime } from "@/lib/orders/status";
import { maxPlacementWidthCm } from "@/lib/creator/sheetOps";
import {
  LOW_DPI,
  MAX_STICKER_NAME,
  printDpi,
  type CutLineType,
  type LibrarySticker,
} from "@/lib/sheets/types";
import { CutLineOptions } from "./CutLineOptions";
import { CutLinePreview } from "./CutLinePreview";
import {
  Modal,
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./Modal";

export type SheetRef = { id: string; name: string };

function parseCm(value: string): number | null {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

/** Edycja pozycji bazy: nazwa, linia cięcia i rozmiar, z jakim naklejka trafia na arkusz. */
export function LibraryStickerDialog({
  sticker,
  usedIn,
  onClose,
  onSaved,
  onDeleted,
}: {
  sticker: LibrarySticker;
  usedIn: SheetRef[];
  onClose: () => void;
  onSaved: (sticker: LibrarySticker) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(sticker.name);
  const [cutLineType, setCutLineType] = useState<CutLineType>(sticker.cutLineType);
  const [widthInput, setWidthInput] = useState(String(sticker.widthCm).replace(".", ","));
  const [pending, setPending] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const widthCm = parseCm(widthInput);
  // Największa grafika, która z tą linią cięcia zmieści się na arkuszu bez obrotu.
  const maxWidth = maxPlacementWidthCm(sticker.aspectRatio, cutLineType);
  const validWidth = widthCm !== null && widthCm >= 1 && widthCm <= maxWidth;
  const previewWidth = validWidth ? widthCm : Math.min(sticker.widthCm, maxWidth);
  const dpi = printDpi(sticker.pixelWidth, previewWidth);

  const save = async () => {
    if (!name.trim()) {
      setError("Podaj nazwę naklejki.");
      return;
    }
    if (!validWidth) {
      setError(
        `Szerokość musi mieścić się między 1 a ${String(maxWidth).replace(".", ",")} cm.`
      );
      return;
    }
    setError(null);
    setPending("save");
    const result = await updateLibrarySticker({
      id: sticker.id,
      name: name.trim(),
      cutLineType,
      widthCm: widthCm!,
    });
    setPending(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onSaved({ ...sticker, name: name.trim(), cutLineType, widthCm: Math.round(widthCm! * 100) / 100 });
  };

  const remove = async () => {
    const warning =
      usedIn.length > 0
        ? `„${sticker.name}” leży na ${usedIn.length} ${
            usedIn.length === 1 ? "arkuszu" : "arkuszach"
          }. Arkusze zachowają swoją kopię, ale naklejki nie będzie już w bazie. Usunąć?`
        : `Usunąć „${sticker.name}” z bazy naklejek?`;
    if (!window.confirm(warning)) return;

    setError(null);
    setPending("delete");
    const result = await deleteLibrarySticker(sticker.id);
    setPending(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onDeleted(sticker.id);
  };

  return (
    <Modal
      title="Naklejka w bazie"
      description="Te ustawienia dostaje naklejka, gdy wstawiasz ją z bazy na arkusz."
      onClose={onClose}
      size="lg"
      busy={pending !== null}
      footer={
        <>
          <button
            type="button"
            onClick={remove}
            disabled={pending !== null}
            className={`${dangerButtonClass} mr-auto`}
          >
            {pending === "delete" ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="w-4 h-4" aria-hidden />
            )}
            Usuń z bazy
          </button>
          <button type="button" onClick={onClose} disabled={pending !== null} className={secondaryButtonClass}>
            Anuluj
          </button>
          <button type="button" onClick={save} disabled={pending !== null} className={primaryButtonClass}>
            {pending === "save" ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Save className="w-4 h-4" aria-hidden />
            )}
            Zapisz
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <CutLinePreview
          imageUrl={sticker.imageUrl}
          aspectRatio={sticker.aspectRatio}
          widthCm={previewWidth}
          cutLineType={cutLineType}
          className="aspect-square w-full p-2"
        />

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="library-name" className="text-sm font-bold text-foreground">
              Nazwa
            </label>
            <input
              id="library-name"
              value={name}
              maxLength={MAX_STICKER_NAME}
              onChange={(event) => setName(event.target.value)}
              className={`${inputClass} mt-1.5`}
              autoFocus
            />
            <p className="text-[11px] font-medium text-muted-foreground mt-1">
              Po nazwie znajdziesz naklejkę w wyszukiwarce — warto dopisać słowa kluczowe.
            </p>
          </div>

          <div>
            <label htmlFor="library-width" className="text-sm font-bold text-foreground">
              Szerokość grafiki na arkuszu (cm)
            </label>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                id="library-width"
                inputMode="decimal"
                value={widthInput}
                onChange={(event) => setWidthInput(event.target.value)}
                className={`${inputClass} w-28`}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                od 1 do {String(maxWidth).replace(".", ",")} cm
              </span>
            </div>
            {dpi !== null && (
              <p
                className={`text-[11px] font-semibold mt-1 ${
                  dpi < LOW_DPI ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {dpi < LOW_DPI && <AlertTriangle className="inline w-3 h-3 mr-1 -mt-0.5" aria-hidden />}
                Rozdzielczość druku przy tej szerokości: {dpi} dpi
                {dpi < LOW_DPI ? " — naklejka może wyjść rozmazana." : "."}
              </p>
            )}
          </div>

          <div>
            <span className="text-sm font-bold text-foreground block mb-2">Linia cięcia</span>
            <CutLineOptions value={cutLineType} onChange={setCutLineType} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-xs font-semibold text-muted-foreground space-y-1">
        <p>
          Dodana {formatDateTime(sticker.createdAt)} · ostatnio użyta {formatDateTime(sticker.lastUsedAt)}
          {sticker.pixelWidth && sticker.pixelHeight
            ? ` · plik ${sticker.pixelWidth}×${sticker.pixelHeight} px`
            : ""}
        </p>
        {usedIn.length > 0 ? (
          <p>
            Na arkuszach:{" "}
            {usedIn.map((sheet, index) => (
              <span key={sheet.id}>
                {index > 0 && ", "}
                <Link href={`/admin/arkusze/${sheet.id}`} className="font-bold text-primary hover:underline">
                  {sheet.name}
                </Link>
              </span>
            ))}
          </p>
        ) : (
          <p>Nie leży jeszcze na żadnym zapisanym arkuszu.</p>
        )}
        <p>Zmiana ustawień nie przestawia naklejek na istniejących arkuszach.</p>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-destructive">
          {error}
        </p>
      )}
    </Modal>
  );
}
