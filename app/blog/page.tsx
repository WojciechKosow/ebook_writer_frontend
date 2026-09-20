import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
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
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-6 pb-20 pt-20 sm:pt-24">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
              The {BRAND} blog
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Write, plan, and publish with AI
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Practical guides on turning an idea into a finished, published ebook —
              faster than you thought possible.
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col gap-4">
            {BLOG_POSTS.map((post, i) => (
              <Reveal key={post.slug} delay={i * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-hairline bg-surface p-6 transition-colors hover:border-hairline-2 hover:bg-surface-2"
                >
                  <div className="flex items-center gap-2 text-xs text-faint">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-muted">
                    {post.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-accent-ink">
                    Read more{" "}
                    <span className="transition-transform group-hover:translate-x-0.5 inline-block">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
