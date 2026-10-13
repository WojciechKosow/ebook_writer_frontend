import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { MarketingShell } from "@/components/marketing-shell";
import { Prose } from "@/components/prose";
import { BRAND } from "@/lib/brand";
import { SITE_URL, SHARE_TITLE } from "@/lib/site";
import {
  BLOG_SLUGS,
  DEFAULT_CTA,
  getPost,
  formatPostDate,
  postModified,
  type BlogCta,
  type BlogPost,
} from "@/lib/blog";

// Prerender every known post; unknown slugs 404 instead of rendering on demand.
export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}
export const dynamicParams = false;

// Where a post's body asks for the mid-article call to action.
const CTA_MARKER = /^<!--\s*cta\s*-->$/m;

/**
 * Markdown -> HTML for a post: the body split at the CTA marker, author-note
 * comments dropped, the FAQ appended as its final section, and every image
 * lazy-loaded so screenshots never hold up the first paint.
 */
async function renderPost(post: BlogPost): Promise<string[]> {
  const [before, ...rest] = post.body.split(CTA_MARKER);
  const parts = rest.length ? [before, rest.join("\n")] : [before];
  if (post.faq?.length) {
    parts[parts.length - 1] +=
      "\n\n## Frequently asked questions\n\n" +
      post.faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");
  }
  return Promise.all(
    parts.map(async (md) =>
      (await marked.parse(md.replace(/<!--[\s\S]*?-->/g, ""))).replace(
        /<img(?![^>]*\sloading=)/g,
        '<img loading="lazy" decoding="async"',
      ),
    ),
  );
}

/** The heading with its accent phrase set in italic brass, as on the landing. */
function CtaHeading({ cta, accentClass }: { cta: BlogCta; accentClass: string }) {
  const i = cta.accent ? cta.heading.indexOf(cta.accent) : -1;
  if (i < 0) return <>{cta.heading}</>;
  return (
    <>
      {cta.heading.slice(0, i)}
      <em className={accentClass}>{cta.accent}</em>
      {cta.heading.slice(i + cta.accent!.length)}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    // A page-level openGraph replaces the root one rather than merging with
    // it, so the site name and the generated share image are restated here.
    openGraph: {
      type: "article",
      siteName: BRAND,
      locale: "en_US",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SHARE_TITLE }],
      title: post.metaTitle ?? `${post.title} · ${BRAND}`,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: postModified(post),
    },
    // Without this, X/Slack-style cards fall back to the site-wide share copy.
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle ?? post.title,
      description: post.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const [html, htmlAfterCta] = await renderPost(post);
  const cta = post.cta ?? DEFAULT_CTA;
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
        image: `${SITE_URL}/opengraph-image`,
        inLanguage: "en",
        keywords: post.keywords.join(", "),
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
      ...(post.faq?.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${canonical}#faq`,
              mainEntity: post.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
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

        {htmlAfterCta !== undefined && (
          <>
            <aside
              aria-label="Try it"
              className="my-12 rounded-[22px] border border-ip-line bg-surface-2/60 p-6 sm:p-8"
            >
              <p className="ip-display m-0 text-[clamp(24px,3.4vw,30px)] leading-tight">
                <CtaHeading cta={cta} accentClass="text-ip-brass" />
              </p>
              <p className="mb-0 mt-2 text-[15px] leading-7 text-ip-ink-2">{cta.text}</p>
              <Link
                href={cta.href}
                className="ip-cta mt-5 inline-flex rounded-[12px] bg-ip-ink px-5 py-3 text-[15px] font-semibold text-ip-bg"
              >
                {cta.label}
              </Link>
            </aside>
            <Prose html={htmlAfterCta} />
          </>
        )}

        {/* Closing CTA */}
        <div className="mt-16 rounded-[28px] bg-ip-ink p-8 text-center text-ip-bg sm:p-12">
          <p className="ip-display m-0 text-[clamp(28px,4vw,40px)]">
            <CtaHeading cta={cta} accentClass="text-ip-brass-l" />
          </p>
          <p className="mx-auto mb-0 mt-3 max-w-md opacity-80">{cta.text}</p>
          <div className="mt-7 flex justify-center">
            <Link href={cta.href} className="ip-cta rounded-[14px] bg-ip-bg px-6 py-4 font-semibold text-ip-ink">
              {cta.label}
            </Link>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}
