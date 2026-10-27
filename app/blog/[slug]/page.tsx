import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { MarketingShell } from "@/components/marketing-shell";
import { Prose } from "@/components/prose";
import { BRAND } from "@/lib/brand";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";
import { BLOG_SLUGS, getPost, formatPostDate, postModified } from "@/lib/blog";

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
      modifiedTime: postModified(post),
      images: [SHARE_IMAGE],
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
        dateModified: postModified(post),
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
    <MarketingShell ambient="none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-12 sm:px-6 md:pt-16">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href="/blog" className="text-ip-muted transition-colors hover:text-ip-ink">
            ← All guides
          </Link>
        </nav>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ip-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.updated && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 className="ip-display mb-0 mt-4 text-[clamp(38px,5.4vw,56px)] leading-[1.05]">{post.title}</h1>
          <p className="mb-0 mt-5 text-lg leading-relaxed text-ip-ink-2">{post.description}</p>
        </header>

        <div className="my-10 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-ip-line" />
          <span className="text-ip-brass-l">✦</span>
          <span className="h-px flex-1 bg-ip-line" />
        </div>

        <Prose html={html} />

        {/* Closing CTA */}
        <div className="mt-16 rounded-[28px] bg-ip-ink p-8 text-center text-ip-bg sm:p-12">
          <p className="ip-display m-0 text-[clamp(28px,4vw,40px)]">
            Turn what you know into a <em className="text-ip-brass-l">finished ebook</em>
          </p>
          <p className="mx-auto mb-0 mt-3 max-w-md opacity-80">
            {BRAND} maps your notes into a chapter blueprint, then writes, edits, and
            typesets the book. Planning is free.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/register" className="ip-cta rounded-[14px] bg-ip-bg px-6 py-4 font-semibold text-ip-ink">
              Plan your book free
            </Link>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
