"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const StickerIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m23.967 10.417a12.04 12.04 0 1 0 -13.55 13.55 3.812 3.812 0 0 0 .489.032 3.993 3.993 0 0 0 2.805-1.184l9.1-9.1a3.962 3.962 0 0 0 1.156-3.298zm-21.9.474a10.034 10.034 0 0 1 19.8-.884 12.006 12.006 0 0 0 -11.86 11.852 9.988 9.988 0 0 1 -7.944-10.968zm10.233 10.509a2.121 2.121 0 0 1 -.278.225 10 10 0 0 1 9.606-9.607 2.043 2.043 0 0 1 -.224.279z"/>
  </svg>
);

interface HeaderProps {
  zen?: boolean;
  sticky?: boolean;
}

export function Header({ zen = false, sticky = true }: HeaderProps) {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.length;

  return (
    <header className={`${sticky ? "sticky top-0" : ""} w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-50 pt-4 pb-2`}>
      <div className="flex justify-between items-center h-16 sm:h-20 px-6 sm:px-8 liquid-glass rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border/70">
        {/* Left: Logo */}
        <div className="flex justify-start items-center">
          <Link href="/" className="flex items-center">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="relative h-10 sm:h-11 md:h-12 flex items-center"
            >
              <Image
                src="/images/logo/malenaklejki-logo-light.png?v=3"
                alt="małe Naklejki Logo"
                width={280}
                height={70}
                className="h-full w-auto object-contain dark:hidden"
                priority
                unoptimized
              />
              <Image
                src="/images/logo/malenaklejki-logo-dark.png?v=3"
                alt="małe Naklejki Logo"
                width={280}
                height={70}
                className="h-full w-auto object-contain hidden dark:block"
                priority
                unoptimized
              />
            </motion.div>
          </Link>
        </div>

        {/* Right: Navigation & Cart */}
        <div className="flex justify-end items-center gap-3 sm:gap-4 md:gap-5">
          {!zen && (
            <>
              {/* Zamów Naklejki Personalizowane Button */}
              <Link
                href="/#sheet"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    window.location.hash = "#sheet";
                    // Trigger scroll and highlight custom event
                    const event = new CustomEvent("scroll-to-sheet");
                    window.dispatchEvent(event);
                  }
                }}
                className="hidden md:inline-flex items-center justify-center px-5 py-2 border border-primary text-[15px] font-extrabold rounded-xl text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
              >
                <StickerIcon className="w-4 h-4 mr-2" />
                Zamów Zestaw Naklejek
              </Link>

              {/* Zamów Projekt Button */}
              <Link
                href="/zamow-projekt"
                className="hidden md:inline-flex px-4 py-2 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-xl border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
              >
                Zamów Projekt
              </Link>

              {/* Blog Button */}
              <Link
                href="/blog"
                className="hidden md:inline-flex px-4 py-2 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-xl border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
              >
                Blog
              </Link>

              {/* Kontakt Button */}
              <Link
                href="/kontakt"
                className="hidden md:inline-flex px-4 py-2 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-xl border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
              >
                Kontakt
              </Link>
            </>
          )}
          {!zen && (
            <div className="relative">
              <Link href="/koszyk">
                <div className="relative flex items-center p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer group">
                  <motion.div whileHover={{ scale: 1.05, rotate: 1 }} whileTap={{ scale: 0.95 }}>
                    <ShoppingCart className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                  {mounted && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={totalItems}
                      className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary border border-background text-[10px] font-bold text-primary-foreground"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </div>
              </Link>
            </div>
          )}
          {!zen && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer text-foreground hover:text-primary focus:outline-none relative w-10 h-10"
              aria-label="Toggle menu"
            >
              <Menu className={`absolute w-6 h-6 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`absolute w-6 h-6 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && !zen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden mt-2 overflow-hidden liquid-glass rounded-2xl border border-border/70 shadow-lg"
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Zamów Naklejki Personalizowane Button */}
              <Link
                href="/#sheet"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    window.location.hash = "#sheet";
                    // Trigger scroll and highlight custom event
                    const event = new CustomEvent("scroll-to-sheet");
                    window.dispatchEvent(event);
                  }
                }}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/30 transition-all cursor-pointer text-center active:scale-[0.99]"
              >
                <StickerIcon className="w-5 h-5 mr-2" />
                Zamów Zestaw Naklejek
              </Link>

              {/* Zamów Projekt Button */}
              <Link
                href="/zamow-projekt"
                onClick={() => setIsMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/30 transition-all cursor-pointer text-center active:scale-[0.99]"
              >
                Zamów Projekt
              </Link>

              {/* Blog Button */}
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/30 transition-all cursor-pointer text-center active:scale-[0.99]"
              >
                Blog
              </Link>

              {/* Kontakt Button */}
              <Link
                href="/kontakt"
                onClick={() => setIsMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/30 transition-all cursor-pointer text-center active:scale-[0.99]"
              >
                Kontakt
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
