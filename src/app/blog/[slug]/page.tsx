import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

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
    },
  };
}

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

      <main className="flex-1 pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Powrót do bloga
          </Link>
        </div>

        {/* Article Wrapper */}
        <article className="!mt-4 bg-white dark:bg-[#003a3b] rounded-3xl border border-border/40 p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
          {/* Header */}
          <div className="space-y-4 border-b border-border/40 pb-6">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary/20 text-[10px] font-black tracking-wide uppercase rounded-lg border border-primary/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground font-heading">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-muted-foreground/80 pt-2">
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

          {/* Content (Styled via arbitrary Tailwind selectors matching markdown output) */}
          <div 
            className="text-foreground/90 font-medium leading-relaxed max-w-none space-y-6 
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
              [&_table]:w-full [&_table]:my-8 [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:border [&_table]:border-border/60 [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:shadow-sm [&_table]:bg-white [&_table]:dark:bg-[#003a3b]/40
              [&_th]:bg-[#edf6f2] [&_th]:dark:bg-[#002c2e] [&_th]:text-foreground [&_th]:font-black [&_th]:p-3 [&_th]:sm:p-4 [&_th]:text-left [&_th]:border-b [&_th]:border-border/60
              [&_td]:p-3 [&_td]:sm:p-4 [&_td]:border-b [&_td]:border-border/60 [&_td]:text-foreground/80 [&_td]:dark:text-[#a0d4c8] [&_td]:font-semibold
              [&_tr:nth-child(even)]:bg-[#edf6f2]/20 [&_tr:nth-child(even)]:dark:bg-[#002c2e]/10
              [&_tr:last-child_td]:border-b-0"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related Posts Widget */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6">
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
    </div>
  );
}
