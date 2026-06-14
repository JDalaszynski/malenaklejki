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
      <div className="flex justify-between items-center h-16 sm:h-20 px-6 sm:px-8 bg-background/90 backdrop-blur-md rounded-2xl shadow-[0_8px_20px_-6px_oklch(0.86_0.08_170_/_0.25)] border border-[oklch(0.86_0.08_170_/_0.3)]">
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

        {/* Right: Cart */}
        <div className="flex justify-end items-center">
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
