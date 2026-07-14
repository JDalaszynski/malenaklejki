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
  description: string;
  content: string; // Markdown or HTML string
  image?: string;
  imageAlt?: string;
  tags?: string[];
  readingTime?: string;
  faq?: FAQItem[];
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

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

            // Parse FAQs
            const faq: FAQItem[] = [];
            const faqSectionRegex = /##.*FAQ.*([\s\S]*)/i;
            const faqMatch = content.match(faqSectionRegex);
            if (faqMatch) {
              const faqText = faqMatch[1];
              const qaRegex = /###\s+(.+?)\s*\n+([\s\S]+?)(?=(?:\n###\s+)|\n##\s+|$)/g;
              let qaMatch;
              while ((qaMatch = qaRegex.exec(faqText)) !== null) {
                const question = qaMatch[1].trim();
                let answer = qaMatch[2].trim();
                // Simple markdown cleanup for the JSON-LD
                answer = answer.replace(/\*\*(.*?)\*\*/g, '$1');
                answer = answer.replace(/_(.*?)_/g, '$1');
                answer = answer.replace(/\[(.*?)\]\(.*?\)/g, '$1');
                answer = answer.replace(/>\s?/g, '');
                faq.push({ question, answer });
              }
            }

            return {
              slug,
              title: data.title || "Bez tytułu",
              date: data.date || new Date().toISOString().split("T")[0],
              description: data.description || "",
              content: content, // For list, raw content is fine
              image: data.image || undefined,
              imageAlt: data.imageAlt || undefined,
              tags: data.tags || [],
              readingTime,
              faq: faq.length > 0 ? faq : undefined,
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

    // Parse FAQs
    const faq: FAQItem[] = [];
    const faqSectionRegex = /##.*FAQ.*([\s\S]*)/i;
    const faqMatch = content.match(faqSectionRegex);
    if (faqMatch) {
      const faqText = faqMatch[1];
      const qaRegex = /###\s+(.+?)\s*\n+([\s\S]+?)(?=(?:\n###\s+)|\n##\s+|$)/g;
      let qaMatch;
      while ((qaMatch = qaRegex.exec(faqText)) !== null) {
        const question = qaMatch[1].trim();
        let answer = qaMatch[2].trim();
        // Simple markdown cleanup for the JSON-LD
        answer = answer.replace(/\*\*(.*?)\*\*/g, '$1');
        answer = answer.replace(/_(.*?)_/g, '$1');
        answer = answer.replace(/\[(.*?)\]\(.*?\)/g, '$1');
        answer = answer.replace(/>\s?/g, '');
        faq.push({ question, answer });
      }
    }

    return {
      slug,
      title: data.title || "Bez tytułu",
      date: data.date || new Date().toISOString().split("T")[0],
      description: data.description || "",
      content: htmlContent,
      image: data.image || undefined,
      imageAlt: data.imageAlt || undefined,
      tags: data.tags || [],
      readingTime,
      faq: faq.length > 0 ? faq : undefined,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}
