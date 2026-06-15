import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://malenaklejki.pl";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/koszyk", "/checkout", "/zamowienie-sukces", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
