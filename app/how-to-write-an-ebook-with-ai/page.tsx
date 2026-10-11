import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { ButtonLink } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";

const PATH = "/how-to-write-an-ebook-with-ai";
const TITLE = "How to Write an Ebook with AI";
const DESCRIPTION =
  `A six-step guide to writing an ebook with AI from what you already know — ` +
  `from your notes to a typeset, publish-ready PDF. Written by the team behind ${BRAND}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "write an ebook with AI",
    "how to write an ebook with AI",
    "write a book with AI",
    "AI writing studio",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} · ${BRAND}`,
    description: DESCRIPTION,
    url: PATH,
    type: "article",
  },
};

// Single source of truth for the visible steps and the HowTo structured data,
// so the schema always matches what's on the page.
const STEPS: { title: string; body: string }[] = [
  {
    title: "Define the book",
    body: "Write one honest sentence about who the book helps and what it helps them do. Add the audience, the tone, and how deep it should go.",
  },
  {
    title: "Gather what you already know",
    body: `Collect your notes, documents, slides, or project files — rough is fine. This is what makes the book yours: ${BRAND} writes from your material instead of guessing.`,
  },
  {
    title: "Plan the outline and fill the gaps",
    body: "Let the AI turn your material into a chapter-by-chapter outline (a blueprint), then answer its questions about anything your material doesn't cover. Edit the chapters until the structure is right.",
  },
  {
    title: "Write the chapters",
    body: `Choose a depth, check the estimated length, and have ${BRAND} write each chapter from your approved blueprint, then edit it against the whole manuscript so voice and details line up.`,
  },
  {
    title: "Edit for your voice",
    body: "Read it through once. Cut repetition, rewrite anything that doesn't sound like you, and verify every fact, name, and number before it ships.",
  },
  {
    title: "Export and publish",
    body: "Export a typeset, print-ready PDF, then publish on Amazon KDP or another store — or share it directly. The manuscript is yours.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: TITLE,
      description: DESCRIPTION,
      step: STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: TITLE, item: `${SITE_URL}${PATH}` },
      ],
    },
  ],
};

export default function HowToWriteEbookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-8 pt-20 text-center sm:pt-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-2 bg-surface px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              Guide
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              How to write an ebook with AI
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
              You don&apos;t need to be a writer to publish a real book — you need to
              know your subject. Here are the six steps, and how an{" "}
              <Link href="/ai-ebook-generator" className="font-medium text-accent-ink underline underline-offset-2">
                AI ebook generator
              </Link>{" "}
              handles the hardest ones for you.
            </p>
          </Reveal>
        </section>

        {/* Steps */}
        <section className="mx-auto w-full max-w-2xl px-6 py-12">
          <ol className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <li className="flex gap-5 rounded-2xl border border-hairline bg-surface p-6">
                  <span className="font-[family-name:var(--font-display)] text-3xl italic font-medium text-accent tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-[19px] font-semibold text-foreground">{s.title}</h2>
                    <p className="mt-1.5 text-[15px] leading-7 text-muted">{s.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Why AI */}
        <section className="mx-auto w-full max-w-2xl px-6 py-12">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Why write with AI?
            </h2>
            <p className="mt-4 text-[17px] leading-8 text-foreground-2">
              The blank page is where most books die. AI removes it: you always have a
              draft to react to, so momentum never stalls. The catch is that AI
              writing from a one-line prompt sounds generic and can get facts wrong.
              Feed it your own knowledge and it writes your book instead of an average
              one. You stay the author — making the calls on structure, voice, and
              truth — while the tool handles outlining, drafting, and typesetting.
            </p>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-2xl px-6 pb-24 pt-4 text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Write your ebook with {BRAND}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Planning is free — add your notes, review the blueprint, and see the
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
