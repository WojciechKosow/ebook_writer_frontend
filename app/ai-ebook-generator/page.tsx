import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Plans } from "@/components/landing/plans";
import { Reveal } from "@/components/landing/reveal";
import { ButtonLink } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";

const PATH = "/ai-ebook-generator";
const TITLE = "AI Ebook Generator";
const DESCRIPTION =
  `${BRAND} is an AI ebook generator that turns one idea into a complete, ` +
  `typeset ebook — outline, every chapter, an editorial pass, and a ` +
  `print-ready PDF. Start free.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI ebook generator",
    "AI book generator",
    "generate a book with AI",
    "ebook creator",
    "create an ebook",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} · ${BRAND}`,
    description: DESCRIPTION,
    url: PATH,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: TITLE, item: `${SITE_URL}${PATH}` },
  ],
};

const USE_CASES = [
  { title: "Non-fiction & how-to", body: "Guides, playbooks, and manuals that teach one thing well." },
  { title: "Fiction", body: "Novels and novellas with a consistent voice, chapter to chapter." },
  { title: "Lead magnets", body: "Branded ebooks that grow your list and establish authority." },
  { title: "Courses & workbooks", body: "Structured, chaptered material ready to hand to students." },
];

export default function AiEbookGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-10 pt-20 text-center sm:pt-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-2 bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              AI ebook generator
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              An AI ebook generator that finishes the book
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
              Describe your idea and {BRAND} plans the outline, writes every chapter,
              edits for consistency, and hands you a typeset, print-ready PDF — cover
              to cover.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <ButtonLink href="/register" className="px-5 py-3 text-[15px]">
                Start writing free
              </ButtonLink>
              <ButtonLink href="#pricing" variant="secondary" className="px-5 py-3 text-[15px]">
                See pricing →
              </ButtonLink>
            </div>
          </Reveal>
        </section>

        {/* What it is */}
        <section className="mx-auto w-full max-w-2xl px-6 py-12">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What is an AI ebook generator?
            </h2>
            <p className="mt-4 text-[17px] leading-8 text-foreground-2">
              An AI ebook generator turns a short description of your idea into a
              complete manuscript. Instead of facing a blank page, you start from a
              full draft — a structured outline, written chapters, and a consistency
              pass — then edit it into exactly the book you want. {BRAND} handles the
              heavy lifting so you can focus on voice, accuracy, and publishing.
            </p>
          </Reveal>
        </section>

        {/* Use cases */}
        <section className="mx-auto w-full max-w-4xl px-6 py-12">
          <Reveal className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              What you can create
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((u, i) => (
              <Reveal key={u.title} delay={i * 70}>
                <div className="h-full rounded-2xl border border-hairline bg-surface p-6">
                  <h3 className="text-[17px] font-semibold text-foreground">{u.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{u.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <HowItWorks />
        <Plans />

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-2xl px-6 pb-24 pt-4 text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Generate your first ebook today
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Start free — no card required. Your first chapter is one prompt away.
            </p>
            <div className="mt-7 flex justify-center">
              <ButtonLink href="/register" className="px-5 py-3">
                Start writing free
              </ButtonLink>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
