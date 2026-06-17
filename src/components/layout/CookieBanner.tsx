"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Settings, ShieldCheck, X } from "lucide-react";

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytical: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if the user has already made a choice
    const accepted = localStorage.getItem("cookies-accepted");
    const storedPrefs = localStorage.getItem("cookies-preferences");

    if (!accepted) {
      // Delay showing the banner slightly for better visual feedback
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    } else if (storedPrefs) {
      try {
        setPreferences(JSON.parse(storedPrefs));
      } catch (e) {
        console.error("Failed to parse cookies preferences", e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs = { necessary: true, analytical: true, marketing: true };
    localStorage.setItem("cookies-accepted", "true");
    localStorage.setItem("cookies-preferences", JSON.stringify(allPrefs));
    setPreferences(allPrefs);
    
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }

    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const essentialPrefs = { necessary: true, analytical: false, marketing: false };
    localStorage.setItem("cookies-accepted", "true");
    localStorage.setItem("cookies-preferences", JSON.stringify(essentialPrefs));
    setPreferences(essentialPrefs);

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }

    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookies-accepted", "true");
    localStorage.setItem("cookies-preferences", JSON.stringify(preferences));

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: preferences.analytical ? "granted" : "denied",
        ad_storage: preferences.marketing ? "granted" : "denied",
      });
    }

    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[90] w-[calc(100%-3rem)] sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom duration-500">
      <div className="bg-background/95 backdrop-blur-xl border border-border/80 shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-3xl p-5 md:p-6 flex flex-col gap-5 relative">
        
        {/* Close button */}
        <button
          onClick={handleRejectAll}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-xl transition-all cursor-pointer"
          title="Zamknij i odrzuć opcjonalne pliki cookies"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header and description */}
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-2xl flex-shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 pr-6">
            <h4 className="font-extrabold text-base text-foreground flex items-center gap-2">
              Dbamy o Twoją prywatność
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Używamy plików cookies, aby ułatwić korzystanie z naszego sklepu (m.in. koszyk, sesja) oraz analizować ruch. Szczegóły znajdziesz w{" "}
              <Link
                href="/polityka-prywatnosci"
                className="text-primary hover:underline font-bold"
                onClick={() => setIsOpen(false)}
              >
                Polityce Prywatności
              </Link>{" "}
              oraz{" "}
              <Link
                href="/pliki-cookies"
                className="text-primary hover:underline font-bold"
                onClick={() => setIsOpen(false)}
              >
                Polityce Cookies
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Granular Settings */}
        {showSettings && (
          <div className="border-t border-border/60 pt-4 space-y-3 animate-in fade-in slide-in-from-top duration-300">
            <p className="text-[11px] font-black text-foreground uppercase tracking-wide">Ustawienia plików cookies:</p>
            <div className="flex flex-col gap-2">
              
              {/* Necessary */}
              <label className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/40 select-none opacity-80">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <div>
                  <p className="text-[11px] font-black text-foreground">Niezbędne</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">Wymagane do działania koszyka i płatności Przelewy24.</p>
                </div>
              </label>

              {/* Analytical */}
              <label className="flex items-center gap-3 bg-muted/20 hover:bg-muted/40 p-2.5 rounded-xl border border-border/40 select-none cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={preferences.analytical}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytical: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                />
                <div>
                  <p className="text-[11px] font-black text-foreground">Analityczne</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">Pomagają nam ulepszać działanie i funkcje serwisu.</p>
                </div>
              </label>

              {/* Marketing */}
              <label className="flex items-center gap-3 bg-muted/20 hover:bg-muted/40 p-2.5 rounded-xl border border-border/40 select-none cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                />
                <div>
                  <p className="text-[11px] font-black text-foreground">Marketingowe</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">Umożliwiają dopasowanie treści i ewentualnych reklam.</p>
                </div>
              </label>

            </div>
          </div>
        )}

        {/* Buttons Action bar */}
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground hover:text-foreground hover:bg-muted/60 p-2 px-3 rounded-xl transition-all cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              {showSettings ? "Ukryj ustawienia" : "Dostosuj zgody"}
            </button>
            
            <button
              onClick={handleRejectAll}
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground p-2 px-3"
            >
              Odrzuć opcjonalne
            </button>
          </div>
          
          <div className="w-full">
            {showSettings ? (
              <button
                onClick={handleSavePreferences}
                className="w-full bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99] text-xs font-black p-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Zapisz wybrane
              </button>
            ) : (
              <button
                onClick={handleAcceptAll}
                className="w-full bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99] text-xs font-black p-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Zaakceptuj wszystkie
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
