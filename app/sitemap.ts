import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { BLOG_POSTS, postModified } from "@/lib/blog";
import { LEGAL_UPDATED } from "@/lib/legal";

// When each static page's content last meaningfully changed. Bump the date when
// you edit a page's copy. Google only trusts <lastmod> while it stays accurate,
// so it must not move on every deploy.
const UPDATED = {
  home: "2026-10-27",
  aiEbookGenerator: "2026-10-11",
  howToWriteAnEbook: "2026-10-11",
  aiBookWriter: "2026-10-27",
};

const day = (date: string) => new Date(`${date}T00:00:00Z`);

// The public URLs we want indexed. Marketing/content pages are listed here so
// search engines discover them promptly; blog posts are derived from the
// content layer, so a new post appears in the sitemap automatically.
export default function sitemap(): MetadataRoute.Sitemap {

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: day(UPDATED.home), changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/ai-ebook-generator`,
      lastModified: day(UPDATED.aiEbookGenerator),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-book-writer`,
      lastModified: day(UPDATED.aiBookWriter),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/how-to-write-an-ebook-with-ai`,
      lastModified: day(UPDATED.howToWriteAnEbook),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: day(
        BLOG_POSTS.map(postModified).sort().at(-1) ?? UPDATED.home,
      ),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const legal: MetadataRoute.Sitemap = ["/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: day(LEGAL_UPDATED),
    changeFrequency: "yearly",
    priority: 0.2,
  }));

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: day(postModified(post)),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...posts, ...legal];
}
