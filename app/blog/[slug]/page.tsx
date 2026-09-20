import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Prose } from "@/components/prose";
import { ButtonLink } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import { BLOG_SLUGS, getPost, formatPostDate } from "@/lib/blog";

// Prerender every known post; unknown slugs 404 instead of rendering on demand.
export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} · ${BRAND}`,
      description: post.description,
      url,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await marked.parse(post.body);
  const canonical = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: canonical,
        url: canonical,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-2xl px-6 pb-20 pt-16 sm:pt-20">
          <nav aria-label="Breadcrumb" className="text-sm text-faint">
            <Link href="/blog" className="transition-colors hover:text-foreground">
              ← Blog
            </Link>
          </nav>

          <header className="mt-6">
            <div className="flex items-center gap-2 text-xs text-faint">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">{post.description}</p>
          </header>

          <hr className="my-8 border-hairline" />

          <Prose html={html} />

          {/* Closing CTA */}
          <div className="mt-14 rounded-2xl border border-hairline bg-surface-2 p-8 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-foreground">
              Turn your idea into a finished ebook
            </p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              {BRAND} plans, writes, and typesets your book — cover to cover. Start
              free, no card required.
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/register" className="px-5 py-3">
                Start writing free
              </ButtonLink>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
