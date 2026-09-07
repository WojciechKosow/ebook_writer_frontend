import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Tells crawlers to index the public marketing surface and stay out of the
// authenticated app + auth flows (thin, gated, or per-user pages).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/ebooks",
        "/billing",
        "/login",
        "/register",
        "/verify",
        "/check-email",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
