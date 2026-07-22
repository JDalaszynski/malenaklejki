"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export function LatestBlogPosts({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      // Get the first article element directly to avoid picking up any style tags
      const articles = scrollRef.current.querySelectorAll("article");
      if (articles.length > 0) {
        const firstItem = articles[0] as HTMLElement;
        const scrollAmount = firstItem.offsetWidth + 24; // 24px is gap-6
        
        scrollRef.current.scrollBy({ 
          left: direction === "left" ? -scrollAmount : scrollAmount, 
          behavior: "smooth" 
        });
      }
    }
  };



  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>
      
      <div className="text-center mb-12 sm:mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-heading"
        >
          Odkryj Nasz <span className="text-primary relative inline-block">
            Blog
            <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary/20 rounded-full"></span>
          </span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-muted-foreground text-sm sm:text-base font-semibold max-w-2xl mx-auto"
        >
          Zacznij od naszych najważniejszych przewodników po naklejkach — od przygotowania pliku, przez druk, po pomysły na wykorzystanie. Sprawdzone porady w jednym miejscu.
        </motion.p>
      </div>

      <div className="relative group/slider mt-8 sm:mt-12 w-full">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-30 w-12 h-12 bg-white dark:bg-[#002c2e] border border-border/50 text-primary rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hidden md:flex"
          aria-label="Poprzednie"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-30 w-12 h-12 bg-white dark:bg-[#002c2e] border border-border/50 text-primary rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hidden md:flex"
          aria-label="Następne"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Container */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
        <div 
          ref={scrollRef}
          className="grid grid-flow-col gap-6 overflow-x-auto snap-x snap-mandatory pb-12 pt-4 hide-scrollbar w-full auto-cols-[100%] sm:auto-cols-[calc((100%-1.5rem)/2)] lg:auto-cols-[calc((100%-3rem)/3)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {posts.map((post, index) => (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={post.slug}
              className="group relative flex flex-col bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2 snap-start h-full"
            >
              {/* Visual Header / Image */}
              {post.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
                  
                  <Image 
                    src={post.image} 
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Pillar Badge */}
                  {post.pillar && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black tracking-wider uppercase rounded-xl shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        Przewodnik
                      </span>
                    </div>
                  )}

                  {/* Tags Overlay */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag: string) => (
                        <span 
                          key={tag} 
                          className="px-3 py-1.5 bg-white/95 dark:bg-[#002c2e]/95 text-foreground text-[10px] font-black tracking-wider uppercase rounded-xl shadow-md border border-border/10 backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/80">
                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {post.date}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {post.readingTime}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-muted-foreground text-sm font-medium line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-primary group-hover:text-primary/80 transition-colors uppercase tracking-widest cursor-pointer">
                    Czytaj dalej
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-10 text-center"
      >
        <Link 
          href="/blog"
          className="inline-flex items-center justify-center px-8 py-3.5 border border-primary text-[15px] font-black rounded-xl text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md uppercase tracking-wider group"
        >
          Przejdź do Bloga
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}
