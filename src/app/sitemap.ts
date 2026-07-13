import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.malenaklejki.pl";
  const staticRoutes = ["", "/kontakt", "/regulamin", "/polityka-prywatnosci", "/pliki-cookies", "/blog", "/zamow-projekt"];

  const posts = await getBlogPosts();

  // Use a fixed date for static pages to avoid signaling Google
  // that content changes on every build (spam signal).
  // Update this date manually when you make real content changes.
  const staticLastModified = new Date("2026-07-13");

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: staticLastModified,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
