import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { BLOG_POSTS } from "@/lib/blog";

// The public URLs we want indexed. Marketing/content pages are listed here so
// search engines discover them promptly; blog posts are derived from the
// content layer, so a new post appears in the sitemap automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/ai-ebook-generator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/how-to-write-an-ebook-with-ai`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: BLOG_POSTS[0] ? new Date(`${BLOG_POSTS[0].date}T00:00:00Z`) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...posts];
}
