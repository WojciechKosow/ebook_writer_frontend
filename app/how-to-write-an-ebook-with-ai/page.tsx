import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
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
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[900px] px-4 pb-10 pt-16 text-center sm:px-6 md:pt-24">
        <div className="ip-in">
          <span className="ip-eyebrow">Guide · 6 steps</span>
          <h1 className="ip-display mx-auto mb-0 mt-5 max-w-[760px] text-[clamp(44px,6.4vw,84px)] leading-none tracking-[-0.025em]">
            How to write an ebook <em className="text-ip-brass">with AI</em>
          </h1>
          <p className="mx-auto mb-0 mt-6 max-w-xl text-lg leading-relaxed text-ip-ink-2">
            You don&apos;t need to be a writer to publish a real book — you need to know your
            subject. Here are the six steps, and how an{" "}
            <Link href="/ai-ebook-generator" className="font-medium text-ip-ink underline decoration-ip-brass-l underline-offset-4">
              AI ebook generator
            </Link>{" "}
            handles the hardest ones for you.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-[860px] px-4 py-12 sm:px-6">
        <ol className="m-0 flex list-none flex-col border-t border-ip-line p-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ip-rv grid grid-cols-[56px_minmax(0,1fr)] gap-4 border-b border-ip-line py-8 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-6">
              <span className="font-display text-[40px] font-light italic leading-none text-ip-brass tabular-nums sm:text-[56px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="m-0 font-display text-[26px] font-normal leading-tight text-ip-ink">{s.title}</h2>
                <p className="mb-0 mt-2.5 text-[16px] leading-7 text-ip-ink-2">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why AI */}
      <section className="mx-auto w-full max-w-[860px] px-4 py-12 sm:px-6">
        <div className="ip-rv rounded-[28px] border border-ip-hair bg-ip-surface p-7 sm:p-10">
          <span className="ip-eyebrow">Why write with AI?</span>
          <p className="mb-0 mt-4 font-display text-[clamp(20px,2.4vw,24px)] leading-[1.55] text-ip-ink">
            The blank page is where most books die. AI removes it: you always have a draft to
            react to, so momentum never stalls. The catch is that AI writing from a one-line
            prompt sounds generic and can get facts wrong. Feed it your own knowledge and it
            writes your book instead of an average one. You stay the author — making the calls
            on structure, voice, and truth — while the tool handles outlining, drafting, and
            typesetting.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-16 text-center sm:px-6">
        <div className="ip-rv flex flex-col items-center gap-6">
          <h2 className="ip-display m-0 text-[clamp(40px,5.6vw,72px)] leading-none">
            Write your ebook with <em className="text-ip-brass">{BRAND}</em>
          </h2>
          <p className="m-0 max-w-md text-lg text-ip-ink-2">
            Planning is free — add your notes, review the blueprint, and see the estimated
            length before you spend a credit.
          </p>
          <Link href="/register" className="ip-cta rounded-2xl bg-ip-ink px-7 py-[18px] font-semibold text-ip-bg">
            Plan your book free
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
