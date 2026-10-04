import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { getCatalogSheets } from "@/lib/sheets/public";
import { THEME_PAGES } from "@/lib/sheets/themes";

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
    { path: "/naklejki-dla-firm", lastModified: "2026-09-24" },
    { path: "/naklejki-foliowe", lastModified: "2026-07-25" },
    { path: "/fotonaklejki", lastModified: "2026-07-27" },
    { path: "/naklejki-die-cut", lastModified: "2026-07-29" },
    { path: "/slownik-naklejek", lastModified: "2026-07-29" },
    { path: "/etykiety-na-sloiki", lastModified: "2026-08-25" },
    { path: "/wlepki-na-zamowienie", lastModified: "2026-08-31" },
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

  // Katalog gotowych arkuszy istnieje tylko przy trybie „Włączony" — poza nim
  // lista jest pusta i żaden z tych adresów nie trafia do mapy.
  const sheets = await getCatalogSheets();
  const latestSheetChange = sheets.reduce((latest, sheet) => (sheet.updatedAt > latest ? sheet.updatedAt : latest), "");
  const catalogEntries: MetadataRoute.Sitemap =
    sheets.length === 0
      ? []
      : [
          {
            url: `${baseUrl}/gotowe-arkusze`,
            lastModified: new Date(latestSheetChange),
            changeFrequency: "weekly",
            priority: 0.8,
          },
          ...THEME_PAGES.map((theme) => ({
            url: `${baseUrl}${theme.path}`,
            lastModified: new Date(theme.lastModified),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          })),
          ...sheets.map((sheet) => ({
            url: `${baseUrl}/gotowe-arkusze/${sheet.slug}`,
            lastModified: new Date(sheet.updatedAt),
            changeFrequency: "monthly" as const,
            priority: 0.7,
            images: [sheet.productImageUrl],
          })),
        ];

  return [...staticEntries, ...catalogEntries, ...blogEntries];
}
