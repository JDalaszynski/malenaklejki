"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface HeaderProps {
  zen?: boolean;
}

export function Header({ zen = false }: HeaderProps) {
  const { items, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.length;
  const totalPrice = getTotalPrice();

  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-50 pt-4">
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
            className="hidden md:inline-flex px-4 py-2 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-xl border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
          >
            Zamów Naklejki Personalizowane
          </Link>

          {/* Kontakt Button */}
          <Link
            href="/kontakt"
            className="hidden md:inline-flex px-4 py-2 text-[15px] font-extrabold text-foreground hover:text-primary bg-muted/40 hover:bg-muted/85 rounded-xl border border-border/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
          >
            Kontakt
          </Link>
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
                  {mounted && totalItems > 0 && (
                    <span className="ml-3 hidden sm:block font-extrabold text-lg text-primary">
                      {totalPrice.toFixed(2)} zł
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
