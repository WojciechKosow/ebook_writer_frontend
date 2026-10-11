import type { Metadata } from "next";
import Link from "next/link";
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
  `${BRAND} is an AI ebook generator that writes from what you know: upload ` +
  `your notes or documents, approve a chapter blueprint, and get a complete, ` +
  `typeset ebook as a print-ready PDF. Plan your book free.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI ebook generator",
    "ebook writing AI",
    "AI to write an ebook",
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

// Prompt-only generators vs writing from the author's own material — the core of
// how Scrivetta is positioned. Rendered as two side-by-side columns.
const COMPARISON = {
  prompt: [
    "Starts from one sentence",
    "Fills every gap with general knowledge",
    "Sounds like every other book on the topic",
    "You find the made-up details while editing",
  ],
  knowledge: [
    "Starts from your notes, documents, or project",
    "Asks you about gaps instead of inventing",
    "Keeps your examples, terms, and opinions",
    "You approve the chapter plan before it writes",
  ],
};

const AUDIENCES = [
  { title: "Experts & consultants", body: "Turn years of notes, workshops, and client questions into a book that shows what you know." },
  { title: "Creators & coaches", body: "Package your newsletter, course, or method into a lead magnet or a paid guide." },
  { title: "Founders & teams", body: "Turn product docs, playbooks, or a codebase into a guide your customers or new hires will actually read." },
  { title: "Writers in a hurry", body: "Use the quick path for a fast first draft from a brief, then make it yours in the editor." },
];

const USE_CASES = [
  { title: "Non-fiction & how-to", body: "Guides, playbooks, and manuals that teach one thing well." },
  { title: "Fiction", body: "Novels and novellas drafted from your premise via the quick path — a dedicated fiction builder for characters and worlds is on the way." },
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
              Share what you know — notes, documents, a project — and {BRAND} maps it
              into a chapter blueprint, asks about the gaps, writes and edits every
              chapter, and hands you a typeset, print-ready PDF.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <ButtonLink href="/register" className="px-5 py-3 text-[15px]">
                Plan your book free
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
              An AI ebook generator turns your knowledge into a complete manuscript.
              Most tools write from a one-line prompt, so the result is generic.{" "}
              {BRAND} starts from your own material instead: it organises what you
              know, plans the chapters around it, and asks you to fill the gaps rather
              than inventing facts. You get a full draft — a blueprint you approved,
              written chapters, and an editorial pass — to refine into exactly the book
              you want. In a hurry, you can also draft from a brief alone and rework it
              in the editor.
            </p>
          </Reveal>
        </section>

        {/* Prompt vs knowledge */}
        <section className="mx-auto w-full max-w-4xl px-6 py-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why most AI-written ebooks feel generic
            </h2>
            <p className="mt-3 text-[17px] leading-8 text-foreground-2">
              Ebook writing AI is only as good as what you give it. A one-line prompt
              gets you the average of the internet. Your own material gets you your
              book.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-hairline bg-surface p-6">
                <h3 className="text-[17px] font-semibold text-foreground">Prompt-only AI writers</h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted">
                  {COMPARISON.prompt.map((line) => (
                    <li key={line}>— {line}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="h-full rounded-2xl border border-[color-mix(in_oklab,var(--accent)_45%,var(--hairline))] bg-surface p-6">
                <h3 className="text-[17px] font-semibold text-foreground">{BRAND}</h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted">
                  {COMPARISON.knowledge.map((line) => (
                    <li key={line}>✓ {line}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mx-auto w-full max-w-4xl px-6 py-12">
          <Reveal className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Who uses AI to write an ebook with {BRAND}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.title} delay={i * 70}>
                <div className="h-full rounded-2xl border border-hairline bg-surface p-6">
                  <h3 className="text-[17px] font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
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

        {/* Further reading */}
        <section className="mx-auto w-full max-w-2xl px-6 pb-8 pt-4">
          <Reveal>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Before you start</h2>
            <ul className="mt-4 flex flex-col gap-2 text-[15px] leading-7">
              <li>
                <Link href="/blog/plan-an-ebook-outline-with-ai" className="font-medium text-accent-ink underline underline-offset-2">
                  How to write an ebook outline (with free templates)
                </Link>
              </li>
              <li>
                <Link href="/blog/can-you-publish-a-book-written-by-ai" className="font-medium text-accent-ink underline underline-offset-2">
                  Can you publish a book written by AI? KDP rules and copyright
                </Link>
              </li>
              <li>
                <Link href="/how-to-write-an-ebook-with-ai" className="font-medium text-accent-ink underline underline-offset-2">
                  How to write an ebook with AI, step by step
                </Link>
              </li>
            </ul>
          </Reveal>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-2xl px-6 pb-24 pt-4 text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Generate your first ebook today
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Planning is free — add your material, review the blueprint, and see the
              estimated length before you spend a credit.
            </p>
            <div className="mt-7 flex justify-center">
              <ButtonLink href="/register" className="px-5 py-3">
                Plan your book free
              </ButtonLink>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
