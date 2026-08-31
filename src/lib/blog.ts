import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  /** Data ostatniej istotnej aktualizacji treści (frontmatter `updated`). Zasila `dateModified` w schema — sygnał świeżości dla Google/LLM. Bez wartości = artykuł niezmieniany od publikacji. */
  updated?: string;
  description: string;
  content: string; // Markdown or HTML string
  image?: string;
  imageAlt?: string;
  tags?: string[];
  readingTime?: string;
  faq?: FAQItem[];
  /** Rola wpisu w architekturze klastrów (frontmatter `role`). Decyduje o typie schematu: "pillar" → Article, "supporting" → BlogPosting. Domyślnie "supporting". */
  role: "pillar" | "supporting";
  /** Przypięcie na stronie głównej (frontmatter `pillar`) — wybór redakcyjny, NIE typ schematu (od tego jest `role`). */
  pillar?: boolean;
  /** Kolejność wyświetlania filarów (rosnąco). Bez wartości = po dacie. */
  pillarOrder?: number;
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

/**
 * Nagłówki H2, po których rozpoznajemy sekcję FAQ.
 *
 * Parser historycznie wymagał w nagłówku dosłownego ciągu "FAQ" - sekcja
 * nazwana samym "najczęściej zadawane pytania" powodowała **ciche zniknięcie
 * schematu `FAQPage`**: strona renderowała się normalnie, więc braku rich
 * resulta nie było widać bez zaglądania w JSON-LD. Stąd tolerancja na polskie
 * warianty nazewnictwa. Konwencja redakcyjna nadal zaleca skrót "(FAQ)"
 * w nagłówku - patrz `blog-agent/rules.md` §6b.
 */
const FAQ_HEADING_REGEX =
  /^##[^\n]*(?:FAQ|(?:naj(?:częściej|częstsze)|często)\s+(?:zadawane\s+)?pytania|pytania\s+i\s+odpowiedzi)[^\n]*$/im;

/** Pary pytanie (H3) + odpowiedź, aż do kolejnego H3, kolejnego H2 lub końca sekcji. */
const FAQ_QA_REGEX = /###\s+(.+?)\s*\n+([\s\S]+?)(?=(?:\n###\s+)|\n##\s+|$)/g;

/**
 * Wyciąga pary pytanie/odpowiedź z sekcji FAQ artykułu na potrzeby schematu
 * `FAQPage`. Jedno źródło prawdy dla `getBlogPosts` i `getBlogPostBySlug` -
 * wcześniej ta logika była zduplikowana w obu funkcjach.
 */
function parseFaq(content: string): FAQItem[] {
  const heading = FAQ_HEADING_REGEX.exec(content);
  if (!heading) return [];

  // Sekcja FAQ kończy się na kolejnym H2 (zwykle sekcji z CTA), żeby nagłówki
  // H3 spoza FAQ nie trafiły do schematu jako rzekome pytania.
  const afterHeading = content.slice(heading.index + heading[0].length);
  const nextH2 = afterHeading.search(/\n##\s/);
  const faqText = nextH2 === -1 ? afterHeading : afterHeading.slice(0, nextH2);

  const faq: FAQItem[] = [];
  const qaRegex = new RegExp(FAQ_QA_REGEX.source, FAQ_QA_REGEX.flags);
  let qaMatch: RegExpExecArray | null;
  while ((qaMatch = qaRegex.exec(faqText)) !== null) {
    const answer = qaMatch[2]
      .trim()
      // Uproszczone czyszczenie markdownu pod JSON-LD.
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/>\s?/g, "");
    faq.push({ question: qaMatch[1].trim(), answer });
  }
  return faq;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Ensure directory exists
    await fs.mkdir(postsDirectory, { recursive: true });
    const filenames = await fs.readdir(postsDirectory);
    
    const posts = await Promise.all(
      filenames
        .filter((filename) => filename.endsWith(".md"))
        .map(async (filename) => {
          const slug = filename.replace(/\.md$/, "");
          const filePath = path.join(postsDirectory, filename);
          const fileContents = await fs.readFile(filePath, "utf8");
          const { data, content } = matter(fileContents);

          // Calculate reading time
          const wordCount = content.trim().split(/\s+/).length;
          const readingTime = Math.ceil(wordCount / 200) + " min";

            const faq = parseFaq(content);

            return {
              slug,
              title: data.title || "Bez tytułu",
              date: data.date || new Date().toISOString().split("T")[0],
              updated: data.updated || undefined,
              description: data.description || "",
              content: content, // For list, raw content is fine
              image: data.image || undefined,
              imageAlt: data.imageAlt || undefined,
              tags: data.tags || [],
              readingTime,
              faq: faq.length > 0 ? faq : undefined,
              role: data.role === "pillar" ? ("pillar" as const) : ("supporting" as const),
              pillar: data.pillar === true,
              pillarOrder: typeof data.pillarOrder === "number" ? data.pillarOrder : undefined,
            };
        })
    );

    // Sort posts by date descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error reading blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(fileContents);
    
    // Parse markdown to HTML using marked
    const htmlContent = await marked(content, { async: true });
    
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200) + " min";

    const faq = parseFaq(content);

    return {
      slug,
      title: data.title || "Bez tytułu",
      date: data.date || new Date().toISOString().split("T")[0],
      updated: data.updated || undefined,
      description: data.description || "",
      content: htmlContent,
      image: data.image || undefined,
      imageAlt: data.imageAlt || undefined,
      tags: data.tags || [],
      readingTime,
      faq: faq.length > 0 ? faq : undefined,
      role: data.role === "pillar" ? ("pillar" as const) : ("supporting" as const),
      pillar: data.pillar === true,
      pillarOrder: typeof data.pillarOrder === "number" ? data.pillarOrder : undefined,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Wpisy na stronę główną: najpierw przypięte artykuły filarowe (wg pillarOrder,
 * potem daty), a gdy jest ich mniej niż `limit` — dobiera najnowszymi wpisami.
 * Dzięki temu sekcja jest zawsze pełna, a filary pozostają na stałe wyróżnione.
 */
export async function getFeaturedPosts(limit = 6): Promise<BlogPost[]> {
  const posts = await getBlogPosts();

  const pillars = posts
    .filter((post) => post.pillar)
    .sort((a, b) => {
      const ao = a.pillarOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.pillarOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (pillars.length >= limit) return pillars.slice(0, limit);

  // Dobierz najnowszymi wpisami spoza filarów (posts jest już posortowane malejąco po dacie).
  const pillarSlugs = new Set(pillars.map((post) => post.slug));
  const backfill = posts.filter((post) => !pillarSlugs.has(post.slug));

  return [...pillars, ...backfill].slice(0, limit);
}
