"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { motion } from "framer-motion";

interface FooterProps {
  children?: React.ReactNode;
}

export function Footer({ children }: FooterProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.classList.remove("dark", "mixed");
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      localStorage.theme = "light";
    }
  };

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="py-8 text-center text-sm text-muted-foreground bg-background/90 backdrop-blur-md rounded-t-3xl border-t border-x border-border/10 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col items-center px-4 gap-6">
          {children}
 
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/regulamin" className="hover:underline font-semibold transition-colors">
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" className="hover:underline font-semibold transition-colors">
              Polityka prywatności
            </Link>
            <Link href="/pliki-cookies" className="hover:underline font-semibold transition-colors">
              Pliki cookies
            </Link>
            <Link href="/kontakt" className="hover:underline font-semibold transition-colors">
              Kontakt
            </Link>
          </div>

          {/* Theme Toggler - Premium Pill Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground/80">Motyw strony:</span>
            <div className="relative flex bg-muted/40 p-1 rounded-full border border-border/30">
              {!mounted ? (
                // Skeleton loading state to prevent layout shift
                <div className="flex gap-1">
                  <div className="w-[80px] h-[28px] rounded-full bg-muted/20 animate-pulse" />
                  <div className="w-[80px] h-[28px] rounded-full bg-muted/20 animate-pulse" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`relative px-4 py-1.5 text-xs font-black rounded-full transition-colors duration-200 flex items-center gap-1.5 focus:outline-none z-10 cursor-pointer ${
                      theme === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme === "light" && (
                      <motion.div
                        layoutId="activeThemeBubble"
                        className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Sun className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Jasny</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`relative px-4 py-1.5 text-xs font-black rounded-full transition-colors duration-200 flex items-center gap-1.5 focus:outline-none z-10 cursor-pointer ${
                      theme === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {theme === "dark" && (
                      <motion.div
                        layoutId="activeThemeBubble"
                        className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Moon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">Ciemny</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/80 font-medium">
            &copy; {new Date().getFullYear()} MałeNaklejki. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
