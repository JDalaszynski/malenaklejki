"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  motion,
} from "framer-motion";
import { PlacedSticker } from "@/types/creator";
import { getCutLineOffsetMm } from "@/lib/utils/collision";

interface A4Visualizer3DProps {
  stickers: PlacedSticker[];
  deliveryForm?: "sheet" | "individual";
}

// Wymiary arkusza (te same co w edytorze 2D, żeby pozycje naklejek się zgadzały)
const SHEET_WIDTH_MM = 210;
const SHEET_HEIGHT_MM = 297;

// Spoczynkowe przechylenie - arkusz nigdy nie leży idealnie na wprost
const REST_ROT_X = 8;
const REST_ROT_Y = -13;

// Linia krawędzi naklejki. Na arkuszu to znacznik cięcia, przy pojedynczych
// sztukach - obrys gotowej, wyciętej naklejki, który odcina biały margines
// winylu od jasnego tła. W obu trybach ma być ledwo widoczną kreską, więc
// zamiast krycia bierzemy półprzezroczystość - linia sama dopasowuje się do
// tego, na czym leży.
const EDGE_LINE = "rgba(100,116,139,0.22)";

// Ziarno papieru (feTurbulence wypalony w data URI - przeglądarka rasteryzuje raz)
const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")";

export function A4Visualizer3D({ stickers, deliveryForm = "sheet" }: A4Visualizer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isSheet = deliveryForm !== "individual";

  // Wskaźnik i stan interakcji trzymamy w refach - animacja idzie przez motion
  // values, więc ruch myszą nie wywołuje ani jednego re-renderu Reacta.
  const pointer = useRef({ nx: 0, ny: 0 });
  const hoverTarget = useRef(0);
  const hoverEased = useRef(0);
  const isVisible = useRef(true);

  // Wartości docelowe - sprężyny poniżej dodają im masy i bezwładności,
  // dzięki czemu arkusz "dochodzi" do pozycji zamiast do niej przeskakiwać.
  const targetRotX = useMotionValue(REST_ROT_X);
  const targetRotY = useMotionValue(REST_ROT_Y);
  const targetRotZ = useMotionValue(0);
  const targetLift = useMotionValue(0);
  const targetDepth = useMotionValue(0);
  const sheenPhase = useMotionValue(0);

  const tilt = { stiffness: 110, damping: 15, mass: 1.15 };
  const rotX = useSpring(targetRotX, tilt);
  const rotY = useSpring(targetRotY, tilt);
  const rotZ = useSpring(targetRotZ, { stiffness: 70, damping: 18, mass: 1 });
  const lift = useSpring(targetLift, { stiffness: 60, damping: 16, mass: 1 });
  const depth = useSpring(targetDepth, { stiffness: 95, damping: 18, mass: 1 });

  // Światło stoi w miejscu, więc refleks przesuwa się po arkuszu szybciej niż
  // sam arkusz się obraca - to ten detal czyta się jako "błyszcząca folia".
  const glareX = useTransform(rotY, (v) => 50 + v * 2.4);
  const glareY = useTransform(rotX, (v) => 50 + v * 2.2);
  const glare = useMotionTemplate`radial-gradient(62% 48% at ${glareX}% ${glareY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.22) 42%, rgba(255,255,255,0) 74%)`;

  const sheenX = useTransform([sheenPhase, rotY], ([p, ry]: number[]) => `${-45 + p * 190 + ry * 0.8}%`);

  // Cienie naklejek przesuwają się razem ze światłem (CSS vars czytane niżej
  // przez każdą naklejkę - jeden zapis stylu na klatkę zamiast N).
  const stickerShadowX = useTransform(rotY, (v) => `${(0.6 - v * 0.05).toFixed(2)}px`);
  const stickerShadowY = useTransform(rotX, (v) => `${(1 + v * 0.05).toFixed(2)}px`);

  // Cień rzucany na podłoże - własna warstwa w tej samej perspektywie, żeby
  // rzutował sylwetkę arkusza zamiast obracać się razem z nim jak box-shadow.
  const groundRotX = useTransform(rotX, (v) => v * 0.5);
  const groundRotY = useTransform(rotY, (v) => v * 0.5);
  const groundX = useTransform(rotY, (v) => -v * 1.2);
  const groundY = useTransform(rotX, (v) => 18 + v * 1.2);
  // Uniesiony arkusz rzuca cień słabszy i bardziej rozmyty
  const groundOpacity = useTransform(depth, [0, 24], [0.55, 0.38]);

  // Falowanie cieniowania - papier "oddycha" światłem, nawet gdy leży nieruchomo
  const undulationX = useTransform(rotY, (v) => `${v * 0.35}%`);

  // Rozmieszczenie naklejek. Na arkuszu - dokładnie tam, gdzie ułożył je
  // klient. Przy pojedynczych sztukach arkusz nie istnieje, więc pokazujemy
  // po prostu wycięte naklejki poukładane jedna obok drugiej w równych
  // rzędach: bez pozycji z arkusza i bez obrotu, bo kąt ułożenia na arkuszu
  // nic nie znaczy dla osobno wyciętego przedmiotu.
  const layout = useMemo(() => {
    const cutMm = (st: PlacedSticker) =>
      st.cutLineType === "none" ? 0 : getCutLineOffsetMm(st.cutLineType, st.widthCm);

    if (isSheet) {
      return stickers.map((st) => ({
        st,
        left: (st.x / SHEET_WIDTH_MM) * 100,
        top: (st.y / SHEET_HEIGHT_MM) * 100,
        width: ((st.widthCm * 10) / SHEET_WIDTH_MM) * 100,
        height: ((st.heightCm * 10) / SHEET_HEIGHT_MM) * 100,
        rotation: st.rotation || 0,
      }));
    }

    const PAD_MM = 8;
    const GAP_MM = 5;
    const AVAIL_W = SHEET_WIDTH_MM - 2 * PAD_MM;
    const AVAIL_H = SHEET_HEIGHT_MM - 2 * PAD_MM;
    // Przy kilku naklejkach wolno je powiększyć, żeby nie tonęły w pustym
    // kadrze - nie ma tu arkusza, do którego można by porównać rozmiar,
    // a proporcje między naklejkami i tak zostają zachowane.
    const MAX_SCALE = 1.8;

    // Rozmiar gotowej, wyciętej naklejki = grafika + margines linii cięcia
    const items = stickers.map((st) => {
      const c = cutMm(st);
      const bodyW = st.widthCm * 10;
      const bodyH = st.heightCm * 10;
      return { st, bodyW, bodyH, w: bodyW + 2 * c, h: bodyH + 2 * c };
    });
    type Item = (typeof items)[number];

    // Łamanie na rzędy - jak tekst: dokładamy do rzędu, dopóki się mieści
    const pack = (maxRowMm: number) => {
      const rows: Item[][] = [];
      let row: Item[] = [];
      let rowW = 0;
      for (const it of items) {
        const withIt = row.length === 0 ? it.w : rowW + GAP_MM + it.w;
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
        w: r.reduce((sum, it, i) => sum + it.w + (i > 0 ? GAP_MM : 0), 0),
        h: Math.max(...r.map((it) => it.h)),
      }));
      const totalW = Math.max(1, ...rowSizes.map((r) => r.w));
      const totalH = Math.max(
        1,
        rowSizes.reduce((sum, r, i) => sum + r.h + (i > 0 ? GAP_MM : 0), 0)
      );
      const fit = Math.min(MAX_SCALE, AVAIL_W / totalW, AVAIL_H / totalH);
      return { rows, rowSizes, totalW, totalH, fit };
    };

    // Kadr jest pionowy, więc najszerszy możliwy rząd rzadko jest najlepszy.
    // Przymierzamy kilka szerokości łamania i bierzemy tę, przy której
    // naklejki wychodzą największe. Idziemy od najszerszych rzędów do
    // najwęższych i każde kolejne zwężenie musi dać co najmniej 8% zysku na
    // rozmiarze - "jedna obok drugiej" czyta się lepiej niż kolumna, więc
    // zwężamy rząd tylko wtedy, gdy naprawdę się to opłaca.
    const WRAP_BIAS = 1.08;
    const widest = items.length > 0 ? Math.max(...items.map((it) => it.w)) : AVAIL_W;
    const narrowest = Math.min(AVAIL_W, widest);
    const STEPS = 20;
    let best = pack(AVAIL_W);
    for (let step = 1; step <= STEPS; step++) {
      const candidate = pack(AVAIL_W - ((AVAIL_W - narrowest) * step) / STEPS);
      if (candidate.fit > best.fit * WRAP_BIAS) best = candidate;
    }
    const { rows, rowSizes, totalH, fit } = best;

    const placed: {
      st: PlacedSticker;
      left: number;
      top: number;
      width: number;
      height: number;
      rotation: number;
    }[] = [];

    let y = -totalH / 2;
    rows.forEach((r, ri) => {
      const size = rowSizes[ri];
      let x = -size.w / 2;
      for (const it of r) {
        // Środek gotowej naklejki, mierzony od środka całego układu
        const cx = (x + it.w / 2) * fit;
        const cy = (y + size.h / 2) * fit;
        placed.push({
          st: it.st,
          left: 50 + (((cx - (it.bodyW * fit) / 2) / SHEET_WIDTH_MM) * 100),
          top: 50 + (((cy - (it.bodyH * fit) / 2) / SHEET_HEIGHT_MM) * 100),
          width: ((it.bodyW * fit) / SHEET_WIDTH_MM) * 100,
          height: ((it.bodyH * fit) / SHEET_HEIGHT_MM) * 100,
          rotation: 0,
        });
        x += it.w + GAP_MM;
      }
      y += size.h + GAP_MM;
    });

    return placed;
  }, [stickers, isSheet]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((t) => {
    // Pojedyncze sztuki leżą płasko - nie ma tu arkusza, który mógłby się
    // unosić, więc nie ruszamy niczego i nie palimy klatek.
    if (!isSheet || !isVisible.current) return;
    const s = t / 1000;

    // Płynne wejście/wyjście z trybu śledzenia kursora (bez skoku 0 -> 1)
    hoverEased.current += (hoverTarget.current - hoverEased.current) * 0.09;
    const h = hoverEased.current;

    if (!reduceMotion) sheenPhase.set((s % 9) / 9);

    // Kilka niewspółmiernych sinusów - ruch nigdy się nie zapętla wizualnie,
    // więc oko nie łapie powtórzenia i arkusz wygląda na po prostu zawieszony.
    const amp = reduceMotion ? 0 : 1 - h * 0.55;
    const driftX = Math.sin(s * 0.42) * 2.4 + Math.sin(s * 0.19 + 1.3) * 1.2;
    const driftY = Math.cos(s * 0.33) * 3 + Math.sin(s * 0.17 + 0.7) * 1.5;
    const driftZ = Math.sin(s * 0.26 + 2.2) * 0.85;
    const driftLift = Math.sin(s * 0.47 + 0.4) * 5;

    const reach = reduceMotion ? 0.3 : 1;
    const { nx, ny } = pointer.current;

    targetRotX.set(REST_ROT_X * (1 - h * 0.7) - ny * h * 24 * reach + driftX * amp);
    targetRotY.set(REST_ROT_Y * (1 - h * 0.7) + nx * h * 28 * reach + driftY * amp);
    // Skręcenie po przekątnej - kartka lekko się skręca, nie tylko przechyla
    targetRotZ.set(-nx * ny * h * 7 * reach + driftZ * amp);
    targetLift.set(-h * 6 * reach + driftLift * amp);
    targetDepth.set(h * 24 * reach);
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    pointer.current = {
      nx: (e.clientX - rect.left) / rect.width - 0.5,
      ny: (e.clientY - rect.top) / rect.height - 0.5,
    };
    hoverTarget.current = 1;
  };

  const handlePointerLeave = () => {
    hoverTarget.current = 0;
    pointer.current = { nx: 0, ny: 0 };
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={isSheet ? handlePointerMove : undefined}
      onPointerEnter={isSheet ? () => (hoverTarget.current = 1) : undefined}
      onPointerLeave={isSheet ? handlePointerLeave : undefined}
      className={`relative w-full max-w-[480px] aspect-[210/297] flex items-center justify-center cursor-default select-none overflow-visible ${
        // touch-none tylko na arkuszu - tam przeciąganie palcem obraca kartkę.
        // Nad płaskim układem pojedynczych sztuk ma działać zwykłe przewijanie.
        isSheet ? "touch-none" : ""
      }`}
      style={{
        perspective: isSheet ? "1300px" : undefined,
        containerType: "inline-size",
      }}
    >
      {/* Definicje SVG (obrysy naklejek + falowanie papieru) - trzymane w
          nieprzetransformowanym kontenerze dla bezpieczeństwa renderowania */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <filter id="a4-paper-warp" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.0055 0.011" numOctaves="2" seed="7" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {stickers.map((st) => {
            if (
              (st.cutLineType === "contour" || st.cutLineType === "contour_inside") &&
              st.contourPolygons &&
              st.contourPolygons.length > 0
            ) {
              const wMm = st.widthCm * 10;
              const hMm = st.heightCm * 10;
              const isInside = st.cutLineType === "contour_inside";
              const offsetMm = isInside ? -0.5 : getCutLineOffsetMm(st.cutLineType, st.widthCm);
              // The clip path is expressed in objectBoundingBox units relative to the
              // enlarged sticker body box (which is scaled up/down by this same ratio),
              // so contour points (normalized to the raw image box) must be converted
              // into that box's coordinate space.
              const scaleX = (wMm + 2 * offsetMm) / wMm;
              const scaleY = (hMm + 2 * offsetMm) / hMm;

              return (
                <clipPath id={`clip-${st.id}`} clipPathUnits="objectBoundingBox" key={st.id}>
                  {st.contourPolygons.map((poly, idx) => {
                    const pointsStr = poly
                      .map((p) => {
                        const px = 0.5 + (p.x - 0.5) / scaleX;
                        const py = 0.5 + (p.y - 0.5) / scaleY;
                        return `${px},${py}`;
                      })
                      .join(" ");
                    return <polygon key={idx} points={pointsStr} />;
                  })}
                </clipPath>
              );
            }
            return null;
          })}
        </defs>
      </svg>

      {/* Cień rzucany na podłoże (nie obraca się razem z arkuszem) */}
      {isSheet && (
        <motion.div
          aria-hidden
          className="absolute inset-[2%] pointer-events-none"
          style={{
            rotateX: groundRotX,
            rotateY: groundRotY,
            x: groundX,
            y: groundY,
            z: -70,
            opacity: groundOpacity,
            background: "rgba(15,23,42,0.55)",
            borderRadius: "6px",
            filter: "blur(22px)",
          }}
        />
      )}

      {/* Arkusz unosi się w przestrzeni, pojedyncze sztuki leżą płasko na
          blacie - żadnego przechyłu, dryfu ani reakcji na kursor. */}
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: isSheet ? 0.94 : 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          isSheet
            ? { type: "spring", stiffness: 120, damping: 18 }
            : { duration: 0.35, ease: "easeOut" }
        }
        style={
          isSheet
            ? {
                transformStyle: "preserve-3d",
                rotateX: rotX,
                rotateY: rotY,
                rotateZ: rotZ,
                y: lift,
                z: depth,
                ["--sticker-shadow-x" as string]: stickerShadowX,
                ["--sticker-shadow-y" as string]: stickerShadowY,
              }
            : undefined
        }
      >
        {/* Warstwa papieru: sylwetka, ziarno i cieniowanie wygięcia.
            Filtr falowania (klasa paper-warp) dokłada nierówną krawędź -
            prawdziwa kartka nigdy nie ma idealnie prostego boku. */}
        {isSheet && (
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden paper-warp"
            style={{
              background:
                "radial-gradient(125% 95% at 28% 12%, #ffffff 0%, #fefefe 48%, #f8f8f7 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(15,23,42,0.07), 1px 1.5px 0 rgba(148,146,140,0.16), 0 4px 10px -3px rgba(15,23,42,0.16)",
            }}
          >
            {/* Ziarno papieru */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: PAPER_GRAIN,
                backgroundSize: "200px 200px",
                mixBlendMode: "multiply",
                opacity: 0.038,
              }}
            />
            {/* Cieniowanie wygięcia - szerokie, miękkie pasma jasno/ciemno,
                które oko odczytuje jako delikatnie pofalowaną powierzchnię */}
            <motion.div
              className="absolute -inset-x-[10%] inset-y-0"
              style={{
                x: undulationX,
                mixBlendMode: "soft-light",
                background:
                  "linear-gradient(97deg, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.85) 16%, rgba(0,0,0,0.35) 38%, rgba(255,255,255,0.7) 58%, rgba(0,0,0,0.4) 78%, rgba(255,255,255,0.6) 100%)",
                opacity: 0.12,
              }}
            />
            {/* Przyciemnienie przy krawędziach (ambient occlusion) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 45%, rgba(15,23,42,0) 62%, rgba(15,23,42,0.055) 100%)",
              }}
            />
          </div>
        )}

        {/* Zadruk: naklejki na arkuszu, symulacja kolorów CMYK */}
        <div className="absolute inset-0 overflow-hidden cmyk-preview">
          {layout.map(({ st, left, top, width, height, rotation }) => {
          const wMm = st.widthCm * 10;
          const hMm = st.heightCm * 10;
          const isInside =
            st.cutLineType === "rounded_inside" ||
            st.cutLineType === "circle_inside" ||
            st.cutLineType === "contour_inside";
          const offsetMm = isInside ? -0.5 : getCutLineOffsetMm(st.cutLineType, st.widthCm);
          const offsetPercentX = (offsetMm / wMm) * 100;
          const offsetPercentY = (offsetMm / hMm) * 100;

          // Determine scale factors sx and sy (the sticker body/shadow box is enlarged
          // or shrunk by an exact 2mm ratio to fit the cut line, the same way for every
          // cut line type since contour polygons now already bake in a scaled margin)
          let sx = 1;
          let sy = 1;

          if (st.cutLineType !== "none") {
            sx = (wMm + 2 * offsetMm) / wMm;
            sy = (hMm + 2 * offsetMm) / hMm;
          }

          const getClipPathStyle = () => {
            if (st.cutLineType === "circle" || st.cutLineType === "circle_inside") {
              return "ellipse(50% 50% at 50% 50%)";
            }
            if (st.cutLineType === "rounded" || st.cutLineType === "rounded_inside" || st.cutLineType === "none") {
              return "inset(0% round 1.008cqw)";
            }
            if (
              (st.cutLineType === "contour" || st.cutLineType === "contour_inside") &&
              st.contourPolygons &&
              st.contourPolygons.length > 0
            ) {
              return `url(#clip-${st.id})`;
            }
            return undefined;
          };

          return (
            <div
              key={st.id}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Cień pod naklejką. Na arkuszu jest wąski i przesuwa się razem
                  ze światłem; przy pojedynczych sztukach nic się nie rusza, więc
                  zostaje miękki, lekko przesunięty w dół cień na blacie. */}
              <div
                className={isSheet ? "absolute bg-black/9" : "absolute bg-black/20"}
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${sx * 100}%`,
                  height: `${sy * 100}%`,
                  transform: isSheet
                    ? "translate(calc(-50% + var(--sticker-shadow-x, 0.6px)), calc(-50% + var(--sticker-shadow-y, 1px)))"
                    : "translate(-50%, calc(-50% + 3px))",
                  clipPath: getClipPathStyle(),
                  filter: isSheet ? "blur(1.2px)" : "blur(4px)",
                }}
              />

              {/* Contour White Backing (Vinyl Base) - rendered as SVG polygon to ensure solid white background in all browsers */}
              {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && st.contourPolygons && st.contourPolygons.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                >
                  {st.contourPolygons.map((poly, idx) => {
                    const pointsStr = poly
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ");
                    return (
                      <polygon
                        key={idx}
                        points={pointsStr}
                        fill="#ffffff"
                        stroke="none"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Sticker Body (Vinyl base + Image) clipped to cut line */}
              <div
                className="absolute bg-white overflow-hidden"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${sx * 100}%`,
                  height: `${sy * 100}%`,
                  transform: "translate(-50%, -50%)",
                  clipPath: getClipPathStyle(),
                }}
              >
                {/* Sticker Image */}
                <img
                  src={st.imageUrl}
                  alt="Naklejka"
                  className="absolute select-none object-contain"
                  draggable={false}
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `${(1 / sx) * 100}%`,
                    height: `${(1 / sy) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Połysk winylu - naklejka odbija światło mocniej niż papier */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(150deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 26%, rgba(255,255,255,0) 48%, rgba(15,23,42,0.05) 100%)",
                    mixBlendMode: "soft-light",
                  }}
                />
              </div>

              {/* Krawędź naklejki */}
              {(st.cutLineType === "contour" || st.cutLineType === "contour_inside") && (
                st.contourPolygons && st.contourPolygons.length > 0 ? (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                  >
                    {st.contourPolygons.map((poly, idx) => {
                      const pointsStr = poly
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ");
                      return (
                        <polygon
                          key={idx}
                          points={pointsStr}
                          fill="none"
                          stroke={EDGE_LINE}
                          strokeWidth="1"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg border border-solid"
                    style={{ borderColor: EDGE_LINE }}
                  />
                )
              )}

              {(st.cutLineType === "rounded" || st.cutLineType === "rounded_inside") && (
                <div
                  className="absolute pointer-events-none border border-solid"
                  style={{
                    left: `${-offsetPercentX}%`,
                    right: `${-offsetPercentX}%`,
                    top: `${-offsetPercentY}%`,
                    bottom: `${-offsetPercentY}%`,
                    borderRadius: "1.008cqw",
                    borderColor: EDGE_LINE,
                  }}
                />
              )}

              {(st.cutLineType === "circle" || st.cutLineType === "circle_inside") && (
                <div
                  className="absolute pointer-events-none rounded-[50%] border border-solid"
                  style={{
                    left: `${-offsetPercentX}%`,
                    right: `${-offsetPercentX}%`,
                    top: `${-offsetPercentY}%`,
                    bottom: `${-offsetPercentY}%`,
                    borderColor: EDGE_LINE,
                  }}
                />
              )}
            </div>
          );
          })}
        </div>

        {/* Oświetlenie arkusza: refleks podążający za przechyłem i wędrujący
            połysk. Jedno i drugie żyje z ruchu, więc przy leżących płasko
            pojedynczych sztukach nie ma czego oświetlać - zostaje im własny,
            statyczny połysk winylu na każdej naklejce. */}
        {isSheet && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0"
              style={{
                background: glare,
                mixBlendMode: "screen",
                opacity: 0.5,
              }}
            />
            <motion.div
              className="absolute -inset-y-[30%] w-[42%] left-0"
              style={{
                x: sheenX,
                rotate: -16,
                mixBlendMode: "overlay",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.6) 52%, rgba(255,255,255,0) 100%)",
                filter: "blur(7px)",
                opacity: 0.75,
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
