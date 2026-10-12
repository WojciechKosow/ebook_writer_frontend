import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { LandingDemo } from "@/components/landing/landing-demo";
import { LandingPricing } from "@/components/landing/landing-sections";
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

const h2 = "ip-display m-0 text-[clamp(32px,4.2vw,52px)]";
const card = "ip-card ip-rv min-w-0 rounded-3xl border border-ip-hair bg-ip-surface p-6 sm:p-7";

export default function AiEbookGeneratorPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[900px] px-4 pb-12 pt-16 text-center sm:px-6 md:pt-24">
        <div className="ip-in">
          <span className="ip-eyebrow">AI ebook generator</span>
          <h1 className="ip-display mx-auto mb-0 mt-5 max-w-[820px] text-[clamp(44px,6.4vw,84px)] leading-none tracking-[-0.025em]">
            An AI ebook generator that <em className="text-ip-brass">finishes the book</em>
          </h1>
          <p className="mx-auto mb-0 mt-6 max-w-xl text-lg leading-relaxed text-ip-ink-2">
            Share what you know — notes, documents, a project — and {BRAND} maps it into a
            chapter blueprint, asks about the gaps, writes and edits every chapter, and hands
            you a typeset, print-ready PDF.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="ip-cta rounded-[14px] bg-ip-ink px-6 py-4 font-semibold text-ip-bg">
              Plan your book free
            </Link>
            <Link href="#pricing" className="ip-cta rounded-[14px] border border-ip-line bg-ip-surface px-[22px] py-4 font-medium">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6">
        <div className="ip-rv">
          <span className="ip-eyebrow">The short answer</span>
          <h2 className={`${h2} mt-3`}>What is an AI ebook generator?</h2>
          <p className="mb-0 mt-5 text-[17px] leading-8 text-ip-ink-2">
            An AI ebook generator turns your knowledge into a complete manuscript. Most tools
            write from a one-line prompt, so the result is generic. {BRAND} starts from your
            own material instead: it organises what you know, plans the chapters around it,
            and asks you to fill the gaps rather than inventing facts. You get a full draft —
            a blueprint you approved, written chapters, and an editorial pass — to refine into
            exactly the book you want. In a hurry, you can also draft from a brief alone and
            rework it in the editor.
          </p>
        </div>
      </section>

      {/* Prompt vs knowledge */}
      <section className="mx-auto w-full max-w-[1000px] px-4 py-14 sm:px-6">
        <div className="ip-rv mx-auto max-w-[680px] text-center">
          <h2 className={h2}>
            Why most AI-written ebooks <em className="text-ip-brass">feel generic</em>
          </h2>
          <p className="mb-0 mt-4 text-[17px] leading-8 text-ip-ink-2">
            Ebook writing AI is only as good as what you give it. A one-line prompt gets you the
            average of the internet. Your own material gets you your book.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className={card}>
            <h3 className="m-0 font-display text-2xl font-normal">Prompt-only AI writers</h3>
            <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0 text-[15px] text-ip-muted">
              {COMPARISON.prompt.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden="true">—</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${card} !border-ip-brass-l ip-shadow`}>
            <h3 className="m-0 font-display text-2xl font-normal">{BRAND}</h3>
            <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0 text-[15px] text-ip-ink-2">
              {COMPARISON.knowledge.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-ip-brass">✓</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <h2 className={`${h2} ip-rv mb-10`}>
          Who uses AI to write an ebook with <em className="text-ip-brass">{BRAND}</em>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <article key={a.title} className={card}>
              <h3 className="m-0 font-display text-[23px] font-normal">{a.title}</h3>
              <p className="mb-0 mt-2 text-[15px] text-ip-ink-2">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <h2 className={`${h2} ip-rv mb-10`}>What you can create</h2>
        <div className="grid grid-cols-1 border-t border-ip-line sm:grid-cols-2">
          {USE_CASES.map((u, i) => (
            <div
              key={u.title}
              className={`ip-rv flex flex-col gap-2 border-b border-ip-line py-7 sm:px-6 ${i % 2 ? "sm:border-l" : "sm:pl-0"}`}
            >
              <span className="ip-eyebrow">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="m-0 font-display text-2xl font-normal">{u.title}</h3>
              <p className="m-0 text-[15px] text-ip-ink-2">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <LandingDemo />
      <LandingPricing />

      {/* Further reading */}
      <section className="mx-auto w-full max-w-[760px] px-4 pb-6 pt-20 sm:px-6">
        <div className="ip-rv">
          <span className="ip-eyebrow">Before you start</span>
          <ul className="m-0 mt-4 flex list-none flex-col border-t border-ip-line p-0">
            {[
              ["/blog/plan-an-ebook-outline-with-ai", "How to write an ebook outline (with free templates)"],
              ["/blog/can-you-publish-a-book-written-by-ai", "Can you publish a book written by AI? KDP rules and copyright"],
              ["/how-to-write-an-ebook-with-ai", "How to write an ebook with AI, step by step"],
            ].map(([href, label]) => (
              <li key={href} className="border-b border-ip-line">
                <Link href={href} className="group flex items-center justify-between gap-4 py-4 font-display text-xl text-ip-ink hover:text-ip-brass">
                  {label}
                  <span aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto w-full max-w-[900px] px-4 pb-28 pt-20 text-center sm:px-6">
        <div className="ip-rv flex flex-col items-center gap-6">
          <h2 className="ip-display m-0 text-[clamp(40px,5.6vw,72px)] leading-none">
            Generate your <em className="text-ip-brass">first ebook</em> today
          </h2>
          <p className="m-0 max-w-md text-lg text-ip-ink-2">
            Planning is free — add your material, review the blueprint, and see the estimated
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
