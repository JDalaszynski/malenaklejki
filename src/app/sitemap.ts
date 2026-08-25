import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.malenaklejki.pl";
  const posts = await getBlogPosts();

  // Use a fixed date for static pages to avoid signaling Google
  // that content changes on every build (spam signal).
  // Update this date manually when you make real content changes.
  const staticLastModified = new Date("2026-07-13");

  // Landingi powstały później niż `staticLastModified` - każdy ma własną datę
  // publikacji/ostatniej realnej zmiany (źródło: landing-agent/plan.md).
  const staticRoutes: Array<{ path: string; lastModified?: string }> = [
    { path: "" },
    { path: "/kontakt" },
    { path: "/o-nas" },
    { path: "/regulamin" },
    { path: "/polityka-prywatnosci" },
    { path: "/pliki-cookies" },
    { path: "/blog" },
    { path: "/zamow-projekt" },
    { path: "/alternatywa-dla-sticker-mule-i-stickerapp", lastModified: "2026-07-25" },
    { path: "/naklejki-dla-firm", lastModified: "2026-07-24" },
    { path: "/naklejki-foliowe", lastModified: "2026-07-25" },
    { path: "/fotonaklejki", lastModified: "2026-07-27" },
    { path: "/naklejki-die-cut", lastModified: "2026-07-29" },
    { path: "/slownik-naklejek", lastModified: "2026-07-29" },
    { path: "/etykiety-na-sloiki", lastModified: "2026-08-25" },
  ];

  const staticEntries = staticRoutes.map(({ path, lastModified }) => ({
    url: `${baseUrl}${path}`,
    lastModified: lastModified ? new Date(lastModified) : staticLastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    // `updated` = realne odświeżenie treści; bez niego wracamy do daty publikacji.
    lastModified: new Date(post.updated || post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
