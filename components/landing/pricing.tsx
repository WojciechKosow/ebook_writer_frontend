"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BASIC,
  CREDIT_COSTS,
  PACKS,
  PRO,
  REFERENCE_PAGES,
  formatCredits,
  formatPrice,
  perCredit,
} from "@/lib/pricing";

// The pricing blocks shared by the landing section and the /pricing page:
// the two plans, the one-time credit packs and the short "how credits work".

function Tick({ muted = false }: { muted?: boolean }) {
  return muted ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="mt-0.5 shrink-0">
      <path d="M6 12h12" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-ip-brass">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

const BASIC_FEATURES: { text: string; included: boolean }[] = [
  { text: "Write your brief and add your sources", included: true },
  { text: "Plan your blueprint and see the length estimate", included: true },
  { text: "Full writing workflow, paid with credit packs", included: true },
  { text: "Editor and typeset PDF export", included: true },
  { text: "No monthly credits", included: false },
  { text: "No seller storefront", included: false },
];

const PRO_FEATURES = [
  "Blueprint, chapters and an editorial pass",
  "AI images and covers for your books",
  "Editor and typeset PDF export",
  "Your own storefront on Scrivetta Marketplace",
  "Keep 100% of your sales — no Scrivetta commission",
  "Lowest price per credit",
  "Top up anytime with credit packs",
  "Monthly credits are used before pack credits",
];

export function PricingPlans() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.4fr]">
      <article className="ip-card ip-rv flex min-w-0 flex-col gap-7 rounded-[28px] border border-ip-hair bg-ip-surface p-7 sm:p-10">
        <div className="flex flex-col gap-4">
          <h3 className="m-0 text-[15px] font-semibold text-ip-ink">{BASIC.name}</h3>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[clamp(52px,7vw,72px)] font-light leading-none tracking-[-0.03em]">
              {BASIC.priceLabel}
            </span>
            <span className="text-ip-muted">free</span>
          </div>
          <p className="m-0 text-[15px] text-ip-ink-2">
            Set up your book and explore Scrivetta. Buy credits only when you want the AI to write.
          </p>
        </div>
        <Link
          href="/register"
          className="ip-cta flex min-h-[52px] items-center justify-center rounded-[14px] border border-ip-line text-[15px] font-semibold"
        >
          Create free account
        </Link>
        <div className="h-px bg-ip-hair" />
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0 text-[15px]">
          {BASIC_FEATURES.map((f) => (
            <li key={f.text} className={`flex gap-3 ${f.included ? "" : "text-ip-muted"}`}>
              <Tick muted={!f.included} />
              {f.text}
            </li>
          ))}
        </ul>
      </article>

      <article className="ip-card ip-rv relative flex min-w-0 flex-col gap-7 rounded-[28px] border border-ip-brass-l bg-ip-surface p-7 ip-shadow sm:p-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-[15px] font-semibold text-ip-ink">{PRO.name}</h3>
            <span className="rounded-full border border-ip-brass-l bg-ip-brass-soft px-3 py-[5px] text-xs font-semibold text-ip-brass">
              Best for regular authors
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="font-display text-[clamp(52px,7vw,72px)] font-light leading-none tracking-[-0.03em]">
              {PRO.priceLabel}
            </span>
            <span className="text-ip-muted">/ {PRO.period}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="font-display text-[26px] text-ip-brass">{formatCredits(PRO.credits)} credits</span>
            <span className="text-[15px] text-ip-muted">every billing period</span>
          </div>
          <p className="m-0 max-w-[460px] text-[15px] text-ip-ink-2">
            For authors who publish regularly and want to sell what they write, straight from Scrivetta.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/billing"
            className="ip-cta flex min-h-[52px] items-center justify-center rounded-[14px] bg-ip-ink text-[15px] font-semibold text-ip-bg"
          >
            Start with Pro
          </Link>
          <span className="text-center text-[13px] text-ip-muted">
            Billed monthly. Cancel anytime. Unused monthly credits don&apos;t roll over.
          </span>
        </div>
        <div className="h-px bg-ip-hair" />
        <ul className="m-0 grid list-none grid-cols-1 gap-x-7 gap-y-3.5 p-0 text-[15px] sm:grid-cols-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex gap-3">
              <Tick />
              {f}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export function CreditPacks() {
  const [picked, setPicked] = useState<string>("CREATOR");
  const current = PACKS.find((p) => p.id === picked) ?? PACKS[1];
  return (
    <section className="ip-card ip-rv flex min-w-0 flex-col gap-7 rounded-[28px] border border-ip-hair bg-ip-surface p-7 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[520px] flex-col gap-2">
          <h3 className="ip-display m-0 text-[36px] leading-[1.1]">Credit packs</h3>
          <p className="m-0 text-[15px] text-ip-ink-2">
            A one-time purchase, not a subscription. Packs work on any plan and their credits never expire.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["One-time payment", "Never expire", "Basic or Pro"].map((chip) => (
            <span key={chip} className="rounded-full border border-ip-line px-3 py-[7px] text-[13px] text-ip-muted">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3" role="radiogroup" aria-label="Credit pack">
        {PACKS.map((p) => {
          const on = p.id === picked;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked(p.id)}
              className={`flex min-w-0 flex-col gap-[18px] rounded-[18px] border p-6 text-left transition-colors ${
                on ? "border-ip-brass-l bg-ip-brass-soft" : "border-ip-hair bg-ip-paper hover:border-ip-line"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-semibold">{p.name}</span>
                  {p.tag && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ip-brass">{p.tag}</span>
                  )}
                </span>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ip-line" aria-hidden="true">
                  {on && <span className="h-2.5 w-2.5 rounded-full bg-ip-brass" />}
                </span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-display text-[44px] leading-none">{formatCredits(p.credits)}</span>
                <span className="text-sm text-ip-muted">credits</span>
              </span>
              <span className="flex w-full items-baseline justify-between gap-3">
                <span className="text-xl font-semibold">{formatPrice(p.priceCents)}</span>
                <span className="text-[13px] text-ip-muted">{perCredit(p.priceCents, p.credits)} per credit</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 max-w-[520px] text-sm text-ip-ink-2">
          On Pro, included credits work out to{" "}
          <strong className="font-semibold text-ip-ink">{perCredit(PRO.priceCents, PRO.credits)} each</strong>, the best
          rate on Scrivetta.
        </p>
        <Link
          href="/billing"
          className="ip-cta inline-flex min-h-[52px] items-center justify-center rounded-[14px] bg-ip-ink px-7 text-[15px] font-semibold text-ip-bg"
        >
          Buy {formatCredits(current.credits)} credits · {formatPrice(current.priceCents)}
        </Link>
      </div>
    </section>
  );
}

export function CreditNotes() {
  const notes = [
    {
      title: "Credits measure AI work, not pages",
      text:
        `Writing uses most of them, about ${CREDIT_COSTS.perPage} credits per finished page; each AI image ` +
        `uses ${CREDIT_COSTS.perImage} and a cover ${CREDIT_COSTS.perCover}. Your total depends on length, images and sources.`,
    },
    {
      title: "See the cost before it runs",
      text: "Paid steps show their credit estimate first. Nothing is spent until you confirm.",
    },
    {
      title: "Failed steps cost nothing",
      text: "If a step fails, its credits go straight back to your balance. Finished work is always kept.",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
      {notes.map((n, i) => (
        <div key={n.title} className="ip-rv flex min-w-0 flex-col gap-2.5">
          <span className="font-display text-[22px] text-ip-brass">{String(i + 1).padStart(2, "0")}</span>
          <h4 className="m-0 text-[17px] font-semibold">{n.title}</h4>
          <p className="m-0 text-[15px] text-ip-ink-2">{n.text}</p>
        </div>
      ))}
    </div>
  );
}

/** The reference-workload ballpark, phrased as an estimate (never a promise). */
export function ReferenceNote() {
  return (
    <p className="ip-rv m-0 text-[15px] text-ip-ink-2">
      For reference: in our typical text-led workload, {formatCredits(PRO.credits)} credits covered a book of about{" "}
      {REFERENCE_PAGES} pages. Images, long sources and regenerated covers change that, so treat it as a ballpark,
      not a promise.
    </p>
  );
}
