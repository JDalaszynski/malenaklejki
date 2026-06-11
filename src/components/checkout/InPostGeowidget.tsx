"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface InPostGeowidgetProps {
  onPointSelected: (point: { name: string; address: string }) => void;
}

export function InPostGeowidget({ onPointSelected }: InPostGeowidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const initializedRef = useRef(false);
  const onPointSelectedRef = useRef(onPointSelected);

  // Keep callback ref updated so we don't trigger effect on every render
  useEffect(() => {
    onPointSelectedRef.current = onPointSelected;
  }, [onPointSelected]);

  useEffect(() => {
    // Skip if already initialized
    if (initializedRef.current) return;

    const initGeowidget = () => {
      if (initializedRef.current) return;
      try {
        if ((window as any).easyPack) {
          (window as any).easyPack.init({});
          (window as any).easyPack.mapWidget("easypack-map", function (point: any) {
            onPointSelectedRef.current({
              name: point.name,
              address: `${point.address.line1}, ${point.address.line2}`,
            });
          });
          initializedRef.current = true;
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("InPost Geowidget initialization failed:", e);
      }
    };

    (window as any).easyPackAsyncInit = function () {
      initGeowidget();
    };

    // If script is already loaded (from a previous page visit)
    if ((window as any).easyPack) {
      initGeowidget();
    }
  }, []);

  return (
    <div className="w-full relative min-h-[400px] border border-border/80 rounded-2xl overflow-hidden bg-muted/10">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm font-medium">Ładowanie mapy Paczkomatów...</span>
        </div>
      )}
      
      <link rel="stylesheet" href="https://geowidget.easypack24.net/css/easypack.css" />
      <Script
        src="https://geowidget.easypack24.net/js/sdk-for-javascript.js"
        strategy="lazyOnload"
        onLoad={() => {
          if ((window as any).easyPackAsyncInit) {
            (window as any).easyPackAsyncInit();
          }
        }}
      />
      
      <div id="easypack-map" className="w-full h-[400px]"></div>
    </div>
  );
}
