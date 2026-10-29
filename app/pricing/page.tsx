import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { CreditNotes, CreditPacks, PricingPlans, ReferenceNote } from "@/components/landing/pricing";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";
import { CREDIT_COSTS, PACKS, PRO, REFERENCE_PAGES, formatCredits, formatPrice, perCredit } from "@/lib/pricing";

const PATH = "/pricing";
const TITLE = "Pricing";
const DESCRIPTION =
  `${BRAND} pricing: plan your book free on Basic, or choose Pro at ${PRO.priceLabel}/month with ` +
  `${formatCredits(PRO.credits)} credits every billing period and your own storefront. One-time credit packs ` +
  `from ${formatPrice(PACKS[0].priceCents)}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} · ${BRAND}`,
    description: DESCRIPTION,
    url: PATH,
    type: "website",
  },
};

const packRates = PACKS.map((p) => perCredit(p.priceCents, p.credits));
const lowestPackRate = packRates.reduce((a, b) => (a < b ? a : b));
const highestPackRate = packRates.reduce((a, b) => (a > b ? a : b));

const COMPARE: { feature: string; basic: string; pro: string }[] = [
  { feature: "Price", basic: "Free", pro: `${PRO.priceLabel} / ${PRO.period}` },
  { feature: "Credits included", basic: "None", pro: `${formatCredits(PRO.credits)} every billing period` },
  { feature: "Price per credit", basic: `${lowestPackRate}–${highestPackRate}, via packs`, pro: `${perCredit(PRO.priceCents, PRO.credits)} included` },
  { feature: "Credit packs", basic: "Available", pro: "Available" },
  { feature: "Brief, sources and blueprint", basic: "Included", pro: "Included" },
  { feature: "Chapter writing and editorial pass", basic: "With pack credits", pro: "Included" },
  { feature: "AI images and covers", basic: "With pack credits", pro: "Included" },
  { feature: "Editor and typeset PDF export", basic: "Included", pro: "Included" },
  { feature: "Storefront on Scrivetta Marketplace", basic: "Not included", pro: "Included" },
  { feature: "Scrivetta commission on your sales", basic: "—", pro: "0%" },
];

const USAGE: { title: string; desc: string; cost: string }[] = [
  { title: "Brief, sources and blueprint", desc: "Setting up your book, analysing your material and planning the chapters.", cost: "Free" },
  { title: "Length and cost estimate", desc: "Scrivetta's estimate for each depth, before you start.", cost: "Free" },
  { title: "Writing the book", desc: "Drafting, editing and checking every chapter. Most credits go here.", cost: `≈ ${CREDIT_COSTS.perPage} per finished page` },
  { title: "AI illustrations", desc: "Images Scrivetta adds where they help the reader.", cost: `${CREDIT_COSTS.perImage} per image` },
  { title: "AI cover", desc: "Generated with your book, or regenerated on request.", cost: `${CREDIT_COSTS.perCover} per cover` },
  { title: "Editing and PDF export", desc: "Your changes in the editor and every new PDF.", cost: "Free" },
];

const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: "What is a credit?",
    a: "Credits are how Scrivetta measures AI work. Writing chapters, generating images and covers use credits, and heavier work uses more. A credit is not a page: a finished page of text currently uses about " +
      `${CREDIT_COSTS.perPage} credits, an AI image ${CREDIT_COSTS.perImage} and a cover ${CREDIT_COSTS.perCover}.`,
  },
  {
    q: `How much can I write with ${formatCredits(PRO.credits)} credits?`,
    a: `In our reference workload, ${formatCredits(PRO.credits)} credits covered a text-led book of roughly ${REFERENCE_PAGES} pages with a few illustrations and a cover. Treat that as a ballpark, not a promise: images, long source material and regenerated covers all change the total. The app shows an estimate before every book starts.`,
  },
  {
    q: "Do unused credits roll over?",
    a: "Monthly Pro credits are replaced at the start of each billing period — unused ones don't carry over — and end when Pro ends. Credits from packs never expire. When you have both, your monthly credits are used first.",
  },
  {
    q: "Can I buy credits without Pro?",
    a: "Yes. Packs are one-time purchases and work on Basic too, with the full writing workflow. Pro adds a lower price per credit and your own storefront.",
  },
  {
    q: "What happens if a generation fails?",
    a: "Credits are reserved when a book starts and settled when it's finished: you pay for the pages and images actually produced, and the rest comes back. If a step fails, its credits are returned automatically. If a book needs more credits than you have, Scrivetta pauses and asks before continuing, and keeps everything finished so far.",
  },
  {
    q: "Do you take a cut of my sales?",
    a: "No. Payments go straight to your own Stripe account and Scrivetta takes no commission. Stripe's standard payment processing fees still apply.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, from your account. Pro stays active until the end of the period you've paid for. After that your storefront stops taking new orders, unused monthly credits end, and your books and pack credits stay yours.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: TITLE, item: `${SITE_URL}${PATH}` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: PRICING_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const h2 = "ip-display m-0 text-[clamp(32px,4.2vw,52px)]";

export default function PricingPage() {
  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mx-auto w-full max-w-[900px] px-4 pb-12 pt-16 text-center sm:px-6 md:pt-24">
        <div className="ip-in">
          <span className="ip-eyebrow">Pricing</span>
          <h1 className="ip-display mx-auto mb-0 mt-5 max-w-[820px] text-[clamp(44px,6.4vw,84px)] leading-none tracking-[-0.025em]">
            Simple plans. <em className="text-ip-brass">Honest</em> credits.
          </h1>
          <p className="mx-auto mb-0 mt-6 max-w-xl text-lg leading-relaxed text-ip-ink-2">
            Start your book for free. When you&apos;re ready for the AI to write, choose Pro or top up with a credit
            pack. You see every estimate before a credit is spent.
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 sm:px-6">
        <PricingPlans />
        <CreditPacks />
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 pt-24 sm:px-6">
        <div className="ip-rv mb-8">
          <h2 className={h2}>Compare plans</h2>
          <p className="mb-0 mt-3 text-ip-ink-2">Everything that changes between Basic and Pro, in one place.</p>
        </div>
        <div className="ip-rv overflow-x-auto rounded-3xl border border-ip-hair bg-ip-surface">
          <table className="w-full border-collapse text-left text-[13px] sm:text-[15px]">
            <thead>
              <tr className="border-b border-ip-hair">
                <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">Feature</th>
                <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">Basic</th>
                <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 font-semibold text-ip-brass">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.feature} className="border-b border-ip-hair last:border-b-0">
                  <th scope="row" className="px-3 py-3 sm:px-6 sm:py-4 font-normal text-ip-ink-2">{row.feature}</th>
                  <td className={`px-3 py-3 sm:px-6 sm:py-4 ${row.basic === "Not included" || row.basic === "None" ? "text-ip-muted" : ""}`}>
                    {row.basic}
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 pt-24 sm:px-6">
        <div className="ip-rv mb-8 flex max-w-[720px] flex-col gap-4">
          <h2 className={h2}>
            Where your credits <em className="text-ip-brass">go</em>
          </h2>
          <p className="m-0 text-ip-ink-2">
            Credits measure AI work, not pages. Heavier steps use more, planning uses none, and the app shows an
            estimate before each book starts.
          </p>
          <ReferenceNote />
        </div>
        <div className="ip-rv rounded-3xl border border-ip-hair bg-ip-surface">
          {USAGE.map((u) => (
            <div key={u.title} className="flex flex-col gap-1 border-b border-ip-hair px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="m-0 font-semibold">{u.title}</p>
                <p className="m-0 mt-1 text-sm text-ip-ink-2">{u.desc}</p>
              </div>
              <span className={`shrink-0 text-[15px] ${u.cost === "Free" ? "text-ip-good" : "font-medium text-ip-brass"}`}>
                {u.cost}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-14">
          <CreditNotes />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[860px] px-4 pb-10 pt-24 sm:px-6">
        <h2 className={`${h2} ip-rv mb-8 text-center`}>
          Questions, <em className="text-ip-brass">answered</em>
        </h2>
        <div className="border-t border-ip-line">
          {PRICING_FAQ.map((item) => (
            <details key={item.q} className="ip-faq ip-rv border-b border-ip-line">
              <summary className="flex items-center justify-between gap-4 py-[22px] font-display text-[clamp(19px,2.4vw,22px)]">
                {item.q}
                <span className="ip-plus shrink-0 text-[26px] font-light leading-none text-ip-brass" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mb-[22px] mt-0 text-ip-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-4 py-24 text-center sm:px-6">
        <div className="ip-rv flex flex-col items-center gap-6">
          <h2 className="ip-display m-0 text-[clamp(40px,5.4vw,72px)] leading-none tracking-[-0.025em]">
            Start with a blueprint. <em className="text-ip-brass">Write</em> when you&apos;re ready.
          </h2>
          <p className="m-0 max-w-[520px] text-lg text-ip-ink-2">
            Create a free account in a minute. No card needed until you choose Pro or a credit pack.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/billing" className="ip-cta rounded-[14px] bg-ip-ink px-3 py-3 sm:px-6 sm:py-4 font-semibold text-ip-bg">
              Start with Pro
            </Link>
            <Link href="/register" className="ip-cta rounded-[14px] border border-ip-line bg-ip-surface px-[22px] py-4 font-medium">
              Create free account
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
