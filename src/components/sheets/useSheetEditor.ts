"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fillSheetWith,
  findInvalidStickerIds,
  fitReplacedImage,
  fitStickerChange,
  fitStickerWidth,
  maxPlacementWidthCm,
  nudgeSticker,
  positionForNewSticker,
} from "@/lib/creator/sheetOps";
import { DEFAULT_STICKER_WIDTH_CM, type CutLineType } from "@/lib/sheets/types";
import { clampToUsableArea, getOuterMargins } from "@/lib/utils/collision";
import { getContourPoints } from "@/lib/utils/contour";
import { getUUID } from "@/lib/uuid";
import type { PlacedSticker } from "@/types/creator";

/**
 * Stan i operacje edytora gotowego arkusza.
 *
 * Każda operacja idzie tą samą drogą co w kreatorze na stronie głównej
 * (`HomePageClient`) — reguły dopasowania siedzą we wspólnym
 * `src/lib/creator/sheetOps.ts`, a przeciąganie, przyciąganie i zmianę
 * rozmiaru myszką robi ten sam `NewA4Visualizer`. Dzięki temu arkusz
 * ułożony w panelu podlega dokładnie tym samym ograniczeniom, co arkusz
 * klienta.
 */

export type NewStickerInput = {
  imageUrl: string;
  /** Proporcje, jeśli już je znamy (naklejka z bazy) — inaczej mierzymy grafikę. */
  aspectRatio?: number;
  widthCm?: number;
  cutLineType?: CutLineType;
  libraryId?: string;
};

const FALLBACK_POLYGON = [
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
];

function usesContour(type: CutLineType): type is "contour" | "contour_inside" {
  return type === "contour" || type === "contour_inside";
}

function contourKind(type: CutLineType): "contour" | "contour_inside" {
  return type === "contour_inside" ? "contour_inside" : "contour";
}

function measureAspect(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.width / img.height);
    img.onerror = reject;
    img.src = url;
  });
}

async function computeContour(
  imageUrl: string,
  type: CutLineType,
  widthCm: number,
  heightCm: number
): Promise<{ x: number; y: number }[][]> {
  try {
    const polys = await getContourPoints(imageUrl, contourKind(type), widthCm * 10, heightCm * 10);
    return polys && polys.length > 0 ? polys : FALLBACK_POLYGON;
  } catch (err) {
    console.error("Failed to compute contour for sticker:", err);
    return FALLBACK_POLYGON;
  }
}

export function useSheetEditor(initialStickers: PlacedSticker[]) {
  const [stickers, setStickers] = useState<PlacedSticker[]>(initialStickers);
  // Bieżący arkusz dla kodu asynchronicznego — grafiki dokładamy po wgraniu.
  const stickersRef = useRef(stickers);
  useEffect(() => {
    stickersRef.current = stickers;
  }, [stickers]);

  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  /** Naklejki wskazane przez nieudaną publikację (np. bez linii cięcia). */
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);

  // Czerwone podświetlenie znika razem z komunikatem — jak w kreatorze.
  const setError = useCallback((message: string | null) => {
    setErrorState(message);
    if (!message) setFlaggedIds([]);
  }, []);
  const [isCalculatingContour, setIsCalculatingContour] = useState<CutLineType | null>(null);
  const [isFillingSheet, setIsFillingSheet] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId) ?? null;

  /* -------------------------------------------------------------- */
  /* Obrysy liczone w tle                                            */
  /* -------------------------------------------------------------- */

  const contourJobs = useRef(new Set<string>());
  const [pendingContours, setPendingContours] = useState(0);

  /**
   * Naklejka bez wielokątów obrysu (świeżo dodana albo po podmianie grafiki)
   * dostaje je tutaj. Wynik wpisujemy tylko do tej jednej naklejki —
   * w międzyczasie można ją było przesunąć albo usunąć.
   */
  useEffect(() => {
    const missing = stickers.filter((st) => !st.contourPolygons && !contourJobs.current.has(st.id));
    if (missing.length === 0) return;

    for (const st of missing) {
      contourJobs.current.add(st.id);
      setPendingContours((count) => count + 1);

      computeContour(st.imageUrl, st.cutLineType, st.widthCm, st.heightCm).then((polys) => {
        contourJobs.current.delete(st.id);
        setPendingContours((count) => count - 1);
        setStickers((current) =>
          current.map((s) => {
            // Po podmianie grafiki albo zmianie rozmiaru ten wynik jest już
            // nieaktualny — naklejka wróci do kolejki przy następnym przebiegu.
            if (
              s.id !== st.id ||
              s.contourPolygons ||
              s.imageUrl !== st.imageUrl ||
              s.widthCm !== st.widthCm
            ) {
              return s;
            }
            const clamped = clampToUsableArea(
              s.x,
              s.y,
              getOuterMargins(s, { contourPolygons: polys })
            );
            return { ...s, contourPolygons: polys, x: clamped.x, y: clamped.y };
          })
        );
      });
    }
  }, [stickers]);

  /** Naklejki, które wychodzą za margines albo nachodzą na inne — na żywo. */
  const invalidIds = useMemo(() => findInvalidStickerIds(stickers), [stickers]);
  const highlightedIds = useMemo(
    () => [...new Set([...invalidIds, ...flaggedIds])],
    [invalidIds, flaggedIds]
  );

  /**
   * Arkusz z kompletem obrysów — przed zapisem. Kolizje i plik dla plotera
   * liczą się z wielokątów, więc nie zapisujemy naklejki, której obrys
   * jeszcze się liczy.
   */
  const withContours = useCallback(async (): Promise<PlacedSticker[]> => {
    const current = stickersRef.current;
    const missing = current.filter((st) => !st.contourPolygons);
    if (missing.length === 0) return current;

    const computed = new Map(
      await Promise.all(
        missing.map(
          async (st) =>
            [st.id, await computeContour(st.imageUrl, st.cutLineType, st.widthCm, st.heightCm)] as const
        )
      )
    );

    const next = stickersRef.current.map((s) =>
      !s.contourPolygons && computed.has(s.id) ? { ...s, contourPolygons: computed.get(s.id) } : s
    );
    stickersRef.current = next;
    setStickers(next);
    return next;
  }, []);

  /* -------------------------------------------------------------- */
  /* Dodawanie                                                       */
  /* -------------------------------------------------------------- */

  /** Kładzie naklejki na arkuszu — w pierwszym wolnym miejscu, jak kreator. */
  const addStickers = useCallback(async (items: NewStickerInput[]): Promise<PlacedSticker[]> => {
    if (items.length === 0) return [];
    setIsPlacing(true);
    setError(null);

    try {
      const next = [...stickersRef.current];
      const added: PlacedSticker[] = [];
      let overflow = 0;

      for (const item of items) {
        let aspect = item.aspectRatio;
        if (!aspect) {
          try {
            aspect = await measureAspect(item.imageUrl);
          } catch {
            setError("Nie udało się pobrać wymiarów obrazu.");
            continue;
          }
        }

        const cutLineType = item.cutLineType ?? "none";
        // Zapisany rozmiar nie może przerosnąć arkusza (np. duża strona PDF).
        const widthCm = Math.min(
          item.widthCm ?? DEFAULT_STICKER_WIDTH_CM,
          maxPlacementWidthCm(aspect, cutLineType)
        );
        const heightCm = widthCm / aspect;
        // Obrys liczymy przed szukaniem miejsca — z nim naklejka siada ciaśniej.
        const contourPolygons = usesContour(cutLineType)
          ? await computeContour(item.imageUrl, cutLineType, widthCm, heightCm)
          : undefined;

        const pos = positionForNewSticker(widthCm, heightCm, next, cutLineType, contourPolygons);
        if (!pos.fits) overflow++;

        const sticker: PlacedSticker = {
          id: getUUID(),
          imageUrl: item.imageUrl,
          x: pos.x,
          y: pos.y,
          widthCm,
          heightCm,
          aspectRatio: aspect,
          cutLineType,
          ...(contourPolygons ? { contourPolygons } : {}),
          ...(item.libraryId ? { libraryId: item.libraryId } : {}),
        };
        next.push(sticker);
        added.push(sticker);
      }

      stickersRef.current = next;
      setStickers(next);
      if (added.length > 0) setSelectedStickerId(added[added.length - 1].id);
      if (overflow > 0) {
        setError(
          overflow === 1
            ? "Na arkuszu brakuje miejsca — naklejka leży na innej, przesuń ją albo zmniejsz."
            : `Na arkuszu brakuje miejsca dla ${overflow} naklejek — leżą na innych, rozłóż je ręcznie.`
        );
      }
      return added;
    } finally {
      setIsPlacing(false);
    }
  }, [setError]);

  /* -------------------------------------------------------------- */
  /* Wybrana naklejka                                                */
  /* -------------------------------------------------------------- */

  const updateSticker = useCallback((id: string, patch: Partial<PlacedSticker>) => {
    setStickers((current) => current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const changeWidth = useCallback(
    (displayedWidthCm: number) => {
      const sticker = stickersRef.current.find((s) => s.id === selectedStickerId);
      if (!sticker) return;

      const fit = fitStickerWidth(sticker, displayedWidthCm);
      if (!fit) {
        setError("Brak miejsca na powiększenie w tym ułożeniu!");
        return;
      }
      updateSticker(sticker.id, fit);

      if (usesContour(sticker.cutLineType)) {
        computeContour(sticker.imageUrl, sticker.cutLineType, fit.widthCm, fit.heightCm).then(
          (polys) => updateSticker(sticker.id, { contourPolygons: polys })
        );
      }
    },
    [selectedStickerId, updateSticker, setError]
  );

  const changeRotation = useCallback(
    (degrees: number) => {
      const sticker = stickersRef.current.find((s) => s.id === selectedStickerId);
      if (!sticker) return;

      const pos = fitStickerChange(sticker, { rotation: degrees });
      if (!pos) {
        setError("Brak miejsca na obrócenie naklejki (kontur wychodzi poza arkusz).");
        return;
      }
      updateSticker(sticker.id, { rotation: degrees, ...pos });
    },
    [selectedStickerId, updateSticker, setError]
  );

  const changeCutLine = useCallback(
    async (type: CutLineType) => {
      const sticker = stickersRef.current.find((s) => s.id === selectedStickerId);
      if (!sticker) return;

      setIsCalculatingContour(type);
      try {
        const contourPolygons = usesContour(type)
          ? await computeContour(sticker.imageUrl, type, sticker.widthCm, sticker.heightCm)
          : sticker.contourPolygons;

        // Stan mógł się zmienić, zanim policzył się obrys.
        const latest = stickersRef.current.find((s) => s.id === sticker.id);
        if (!latest) return;

        const pos = fitStickerChange(latest, { cutLineType: type, contourPolygons });
        if (!pos) {
          setError("Brak miejsca na zmianę linii cięcia (kontur wychodzi poza arkusz)!");
          return;
        }
        updateSticker(latest.id, { cutLineType: type, contourPolygons, ...pos });
      } finally {
        setIsCalculatingContour(null);
      }
    },
    [selectedStickerId, updateSticker, setError]
  );

  const duplicateSelected = useCallback(() => {
    const current = stickersRef.current;
    const sticker = current.find((s) => s.id === selectedStickerId);
    if (!sticker) return;
    setError(null);

    const pos = positionForNewSticker(
      sticker.widthCm,
      sticker.heightCm,
      current,
      sticker.cutLineType,
      sticker.contourPolygons
    );
    // Z pełnego arkusza kreator kładzie kopię 1 cm obok oryginału.
    const target = pos.fits ? pos : { x: sticker.x + 10, y: sticker.y + 10 };
    const clamped = clampToUsableArea(target.x, target.y, getOuterMargins(sticker));
    const copy: PlacedSticker = { ...sticker, id: getUUID(), x: clamped.x, y: clamped.y };

    setStickers([...current, copy]);
    setSelectedStickerId(copy.id);
  }, [selectedStickerId, setError]);

  const fillWith = useCallback(
    (target?: PlacedSticker) => {
      const sticker = target ?? stickersRef.current.find((s) => s.id === selectedStickerId);
      if (!sticker) return;

      setIsFillingSheet(true);
      // Oddech na narysowanie wskaźnika — pętla potrafi chwilę pomielić.
      setTimeout(() => {
        const current = stickersRef.current;
        const next = fillSheetWith(sticker, current, getUUID);
        if (next.length > current.length) {
          setStickers(next);
        } else {
          setError("Brak miejsca na arkuszu na więcej naklejek.");
        }
        setIsFillingSheet(false);
      }, 100);
    },
    [selectedStickerId, setError]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedStickerId) return;
    setStickers((current) => current.filter((s) => s.id !== selectedStickerId));
    setSelectedStickerId(null);
    setError(null);
  }, [selectedStickerId, setError]);

  const nudgeSelected = useCallback(
    (dxMm: number, dyMm: number) => {
      const sticker = stickersRef.current.find((s) => s.id === selectedStickerId);
      if (!sticker) return;
      updateSticker(sticker.id, nudgeSticker(sticker, dxMm, dyMm));
    },
    [selectedStickerId, updateSticker]
  );

  /**
   * Nowa grafika po kadrowaniu albo usunięciu tła. Rozmiar i pozycja jak
   * w kreatorze, obrys liczy się od nowa.
   */
  const replaceImage = useCallback(
    async (stickerId: string, imageUrl: string, libraryId?: string) => {
      let aspect: number;
      try {
        aspect = await measureAspect(imageUrl);
      } catch {
        setError("Nie udało się zweryfikować wymiarów wykadrowanego obrazu.");
        return;
      }

      const current = stickersRef.current;
      const sticker = current.find((s) => s.id === stickerId);
      if (!sticker) return;

      const fit = fitReplacedImage(
        sticker,
        aspect,
        current.filter((s) => s.id !== stickerId)
      );
      // Nowa grafika to nowa pozycja w bazie — `libraryId` dopisujemy, gdy powstanie.
      setStickers((list) =>
        list.map((s) =>
          s.id === stickerId
            ? { ...s, ...fit, imageUrl, aspectRatio: aspect, contourPolygons: undefined, libraryId }
            : s
        )
      );
    },
    [setError]
  );

  const clearSheet = useCallback(() => {
    setStickers([]);
    setSelectedStickerId(null);
    setError(null);
  }, [setError]);

  /** Wskazanie naklejek, które blokują publikację. */
  const flagStickers = useCallback((ids: string[]) => setFlaggedIds(ids), []);

  return {
    stickers,
    setStickers,
    selectedSticker,
    selectedStickerId,
    setSelectedStickerId,
    error,
    setError,
    highlightedIds,
    isCalculatingContour,
    isFillingSheet,
    isPlacing,
    pendingContours,
    addStickers,
    updateSticker,
    changeWidth,
    changeRotation,
    changeCutLine,
    duplicateSelected,
    fillWith,
    deleteSelected,
    nudgeSelected,
    replaceImage,
    clearSheet,
    flagStickers,
    withContours,
  };
}

export type SheetEditorState = ReturnType<typeof useSheetEditor>;
