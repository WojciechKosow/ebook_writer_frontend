import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { BRAND } from "@/lib/brand";
import { BLOG_POSTS, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: `Guides on writing, planning, and publishing ebooks with AI — from the team behind ${BRAND}, the AI ebook generator and writing studio.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog · ${BRAND}`,
    description: `Guides on writing, planning, and publishing ebooks with AI.`,
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-[860px] px-4 pb-24 pt-16 sm:px-6 md:pt-24">
        <div className="ip-in">
          <span className="ip-eyebrow">The {BRAND} blog</span>
          <h1 className="ip-display mb-0 mt-4 text-[clamp(44px,6vw,72px)] leading-none">
            Write, plan and publish <em className="text-ip-brass">with AI</em>
          </h1>
          <p className="mb-0 mt-5 max-w-xl text-lg leading-relaxed text-ip-ink-2">
            Practical guides on turning an idea into a finished, published ebook —
            faster than you thought possible.
          </p>
        </div>

        <div className="mt-14 border-t border-ip-line">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="ip-rv group grid gap-2 border-b border-ip-line py-8 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ip-muted sm:flex-col sm:gap-1">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                <span>{post.readingMinutes} min read</span>
              </div>
              <div className="min-w-0">
                <h2 className="m-0 font-display text-[28px] font-normal leading-[1.15] text-ip-ink transition-colors group-hover:text-ip-brass">
                  {post.title}
                </h2>
                <p className="mb-0 mt-2.5 text-[15px] leading-7 text-ip-ink-2">{post.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ip-ink">
                  Read the guide
                  <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
