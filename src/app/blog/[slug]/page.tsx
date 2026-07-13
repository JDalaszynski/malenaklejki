import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { StickyCTAButton } from "@/components/blog/StickyCTAButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artykuł nie znaleziony - MałeNaklejki",
    };
  }

  return {
    title: `${post.title} - Blog MałeNaklejki`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://www.malenaklejki.pl/blog/${post.slug}`,
      publishedTime: post.date,
      images: post.image ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

const StickerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m23.967 10.417a12.04 12.04 0 1 0 -13.55 13.55 3.812 3.812 0 0 0 .489.032 3.993 3.993 0 0 0 2.805-1.184l9.1-9.1a3.962 3.962 0 0 0 1.156-3.298zm-21.9.474a10.034 10.034 0 0 1 19.8-.884 12.006 12.006 0 0 0 -11.86 11.852 9.988 9.988 0 0 1 -7.944-10.968zm10.233 10.509a2.121 2.121 0 0 1 -.278.225 10 10 0 0 1 9.606-9.607 2.043 2.043 0 0 1 -.224.279z" />
  </svg>
);

const contentClassName = `text-foreground/90 font-medium leading-relaxed max-w-none space-y-6 
  [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-black [&_h2]:text-foreground [&_h2]:font-heading [&_h2]:pt-6 [&_h2]:pb-2
  [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-foreground [&_h3]:font-heading [&_h3]:pt-4 [&_h3]:pb-1
  [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed [&_p]:mb-4
  [&_a]:text-primary [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80 [&_a]:transition-colors
  [&_strong]:font-black [&_strong]:text-foreground
  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-6
  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-6
  [&_li]:text-sm [&_li]:sm:text-base
  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
  [&_hr]:border-t [&_hr]:border-border/60 [&_hr]:my-8
  [&_img]:rounded-2xl [&_img]:shadow-sm [&_img]:border [&_img]:border-border/40 [&_img]:mx-auto [&_img]:my-8 [&_img]:block [&_img]:w-full [&_img]:md:max-w-2xl
  [&_table]:block md:[&_table]:table [&_table]:overflow-x-auto [&_table]:w-full [&_table]:my-8 [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:border [&_table]:border-border/60 [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:shadow-sm [&_table]:bg-white [&_table]:dark:bg-[#003a3b]/40
  [&_th]:bg-[#edf6f2] [&_th]:dark:bg-[#002c2e] [&_th]:text-foreground [&_th]:font-black [&_th]:p-3 [&_th]:sm:p-4 [&_th]:text-left [&_th]:border-b [&_th]:border-border/60
  [&_td]:p-3 [&_td]:sm:p-4 [&_td]:border-b [&_td]:border-border/60 [&_td]:text-foreground/80 [&_td]:dark:text-[#a0d4c8] [&_td]:font-semibold
  [&_tr:nth-child(even)]:bg-[#edf6f2]/20 [&_tr:nth-child(even)]:dark:bg-[#002c2e]/10
  [&_tr:last-child_td]:border-b-0`;

const ArticleBannerAndCTA = ({ id }: { id?: string }) => (
  <div id={id} className="flex flex-col items-center gap-6 my-8 w-full">
    {/* Pulsing Banner Link */}
    <Link 
      href="/" 
      className="group relative block w-full max-w-md md:max-w-none overflow-hidden rounded-2xl border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 subtle-pulse"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/images/MałeNaklejki-Post-Instagram.jpg" 
        alt="Zaprojektuj i zamów naklejki online" 
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
      />
      {/* Subtle Overlay on Hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>

    {/* Fancy CTA Button */}
    <Link
      href="/"
      className="group relative flex items-center justify-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 w-full max-w-[280px] sm:max-w-xs md:max-w-md bg-[#02af7a] hover:bg-[#029668] text-white text-sm md:text-lg font-black tracking-wide uppercase rounded-2xl shadow-[0_4px_14px_0_rgba(2,175,122,0.4)] hover:shadow-[0_6px_20px_0_rgba(2,175,122,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Gloss sweep shine effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          mixBlendMode: "overlay",
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "glossSweep 2s infinite linear",
        }}
      />
      
      <StickerIcon className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
      <span className="relative z-10">Zamów Zestaw Naklejek</span>
    </Link>
  </div>
);

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = p.tags ? p.tags.filter((t) => post.tags?.includes(t)).length : 0;
      return { post: p, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3)
    .map((item) => item.post);

  // Split post.content around the first <h2> tag
  const h2Regex = /<h2[^>]*>/;
  const match = post.content.match(h2Regex);
  
  let beforeContent = post.content;
  let afterContent = "";
  
  if (match && match.index !== undefined) {
    beforeContent = post.content.substring(0, match.index);
    afterContent = post.content.substring(match.index);
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#edf6f2] dark:bg-[#002c2e] transition-colors duration-300">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          image: post.image ? [post.image] : [],
          datePublished: post.date,
          author: [{
            "@type": "Organization",
            name: "MałeNaklejki",
            url: "https://www.malenaklejki.pl"
          }]
        }}
      />
      <Header />

      <main className="flex-1 pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm font-bold text-muted-foreground/80 mb-3">
          <ol className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">
                Kreator Zestawu Naklejek
              </Link>
            </li>
            <li className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-muted-foreground/50">/</span>
              <Link href="/blog" className="hover:text-primary transition-colors">
                Blog
              </Link>
            </li>
            <li className="flex items-center gap-1.5 sm:gap-2" aria-current="page">
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-extrabold line-clamp-1 max-w-[150px] sm:max-w-xs md:max-w-md">
                {post.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Article Wrapper */}
        <article className="bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-3 border-b border-border/40 pb-4">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 text-[9px] font-black tracking-wider uppercase rounded-md border border-primary/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
              {post.title}
            </h1>
          </div>

          {/* Featured Image and Meta wrapper */}
          <div className="space-y-3">
            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-muted-foreground/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {post.date}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {post.readingTime}
                </span>
              )}
            </div>

            {/* Featured Image if present */}
            {post.image && (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/40 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Content (Split into before first H2, Banner & CTA, and after first H2) */}
          <div className={contentClassName} dangerouslySetInnerHTML={{ __html: beforeContent }} />

          {/* First Banner & CTA */}
          <ArticleBannerAndCTA id="first-article-banner" />

          {afterContent && (
            <>
              <div className={contentClassName} dangerouslySetInnerHTML={{ __html: afterContent }} />
              {/* Second Banner & CTA at the end of the post */}
              <ArticleBannerAndCTA />
            </>
          )}
        </article>

        {/* Related Posts Widget */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6 mt-12">
            <h3 className="text-2xl font-black text-foreground font-heading">
              Powiązane artykuły
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group flex flex-col bg-white dark:bg-[#003a3b] rounded-2xl border border-border/40 overflow-hidden p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rp.date}
                      </div>
                      <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {rp.title}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-xs font-semibold line-clamp-2 pt-2 leading-relaxed">
                      {rp.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <StickyCTAButton />
    </div>
  );
}
