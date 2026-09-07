import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The public URLs we want indexed. Add marketing/content pages here as they
// ship (e.g. /about, /blog posts) so search engines discover them promptly.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
