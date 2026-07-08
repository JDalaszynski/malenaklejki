import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog - MałeNaklejki",
  description: "Baza wiedzy o projektowaniu naklejek, marketingu i brandingu. Porady techniczne, inspiracje i przewodniki krok po kroku.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-heading">
            Baza Wiedzy i Inspiracji
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
            Dowiedz się, jak najlepiej projektować naklejki, przygotować pliki do druku oraz wykorzystać materiały reklamowe w promocji swojej marki.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 shadow-sm max-w-xl mx-auto p-8">
            <h3 className="text-lg font-bold mb-2">Brak artykułów</h3>
            <p className="text-muted-foreground text-sm font-medium">
              Nasz agent AI pracuje obecnie nad pierwszymi treściami. Zajrzyj tu wkrótce!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article 
                key={post.slug}
                className="group flex flex-col bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Visual Header / Image Placeholder with gradient if no image */}
                {post.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Tags Overlay */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2.5 py-1 bg-white/95 dark:bg-[#002c2e]/95 text-foreground text-[10px] font-black tracking-wide uppercase rounded-lg shadow-sm border border-border/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {post.date}
                      </span>
                      {post.readingTime && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {post.readingTime}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-200 leading-snug line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-muted-foreground text-xs sm:text-sm font-medium line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Czytaj dalej
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
