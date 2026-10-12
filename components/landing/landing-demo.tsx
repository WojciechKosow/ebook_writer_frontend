"use client";

import { useEffect, useState } from "react";

const STEPS = [
  ["i", "Share what you know", "Describe the book, then upload notes, documents or a project. Rough notes are fine."],
  ["ii", "Review your blueprint", "Chapters are proposed, gaps become questions. Edit, answer, approve."],
  ["iii", "Watch it being written", "Each chapter is written from its own sources, then edited against the whole book."],
  ["iv", "Get your book", "Typeset PDF with cover and contents — and a full editor to keep refining."],
] as const;

const STEP_MS = 5500;

/** "How it works": four steps that advance on their own until the visitor picks one. */
export function LandingDemo() {
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, [manual]);

  return (
    <section id="how" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <div className="ip-rv mb-[52px] text-center">
        <span className="ip-eyebrow">How it works</span>
        <h2 className="ip-display mb-0 mt-3 text-[clamp(36px,4.4vw,60px)]">
          Watch a book <em className="text-ip-brass">come together</em>
        </h2>
      </div>

      <div className="ip-rv flex flex-wrap items-stretch gap-6">
        <div role="tablist" aria-label="Steps" className="flex flex-[1_1_320px] flex-col gap-2.5">
          {STEPS.map(([num, title, desc], i) => {
            const active = i === step;
            return (
              <button
                key={num}
                type="button"
                role="tab"
                id={`how-tab-${i}`}
                aria-selected={active}
                aria-controls="how-panel"
                onClick={() => {
                  setStep(i);
                  setManual(true);
                }}
                className={`relative flex w-full items-start gap-4 rounded-2xl border px-5 py-[18px] text-left transition-[background-color,border-color,opacity] ${
                  active ? "border-ip-line bg-ip-surface ip-shadow-sm" : "border-ip-hair opacity-75 hover:border-ip-line hover:opacity-100"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg italic ${
                    active ? "bg-ip-ink text-ip-brass-l" : "border border-ip-line text-ip-brass"
                  }`}
                >
                  {num}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base font-semibold">{title}</span>
                  <span className="text-sm leading-[1.45] text-ip-muted">{desc}</span>
                </span>
                {active && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-2xl bg-ip-hair">
                    <span
                      key={`${step}-${manual}`}
                      className={`block h-full bg-ip-brass-l ${manual ? "" : "ip-fill"}`}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="how-panel"
          aria-labelledby={`how-tab-${step}`}
          className="relative min-h-[460px] min-w-0 flex-[999_1_560px] overflow-hidden rounded-[28px] border border-ip-hair bg-ip-surface p-5 ip-shadow sm:p-8"
        >
          <div key={step}>
            {step === 0 && <ShareStep />}
            {step === 1 && <BlueprintStep />}
            {step === 2 && <WritingStep />}
            {step === 3 && <BookStep />}
          </div>
        </div>
      </div>

      <p className="ip-rv mx-auto mb-0 mt-8 max-w-[760px] rounded-2xl border border-dashed border-ip-line px-[22px] py-[18px] text-center text-[15px] text-ip-ink-2">
        <b className="text-ip-ink">In a hurry? Take the quick path.</b> Skip the materials and
        Scrivetta drafts from your brief alone — a fast first draft to rework in the editor. Check
        the facts and add your experience before you publish.
      </p>
    </section>
  );
}

function FileChip({ ext, name, meta, color, delay }: { ext: string; name: string; meta: string; color: string; delay: string }) {
  return (
    <div className="ip-pop flex min-w-0 items-center gap-3 rounded-[14px] border border-ip-hair bg-ip-bg p-3.5" style={{ animationDelay: delay }}>
      <span className={`grid h-11 w-9 shrink-0 place-items-center rounded font-mono text-[9px] ${color}`}>{ext}</span>
      <span className="min-w-0 text-sm">
        <b className="block truncate">{name}</b>
        <span className="text-xs text-ip-muted">{meta}</span>
      </span>
    </div>
  );
}

function ShareStep() {
  return (
    <div className="flex flex-col gap-4">
      <div className="ip-pop text-[13px] text-ip-muted">
        New ebook · <b className="text-ip-ink">The Quiet Productivity Method</b>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <FileChip ext="MD" name="morning-notes.md" meta="12 KB · parsed" color="bg-ip-accent text-ip-accent-ink" delay=".05s" />
        <FileChip ext="DOCX" name="client-sessions.docx" meta="84 KB · parsed" color="bg-[#2f5d8a] text-white" delay=".2s" />
        <FileChip ext="PDF" name="workshop-slides.pdf" meta="2.1 MB · parsed" color="bg-[#9b3b2e] text-white" delay=".35s" />
      </div>
      <div className="ip-pop rounded-2xl border border-dashed border-ip-line bg-ip-paper px-[22px] py-5 font-display text-lg leading-[1.6] text-ip-ink-2" style={{ animationDelay: ".5s" }}>
        “Most people try to fix their days with more motivation. What actually works is a small,
        boring routine that runs even when you don&apos;t feel like it — the 10-minute reset, the
        two deep-work blocks…”
      </div>
      <div className="ip-pop flex flex-wrap gap-2" style={{ animationDelay: ".65s" }}>
        <span className="rounded-full bg-ip-brass-soft px-3 py-1.5 text-[13px] font-semibold text-ip-brass">Self-help</span>
        <span className="rounded-full border border-ip-hair bg-ip-bg px-3 py-1.5 text-[13px]">For busy professionals</span>
        <span className="rounded-full border border-ip-hair bg-ip-bg px-3 py-1.5 text-[13px]">Warm, practical tone</span>
      </div>
    </div>
  );
}

const BLUEPRINT = [
  ["i", "Why habits beat motivation", "4 sources"],
  ["ii", "The anatomy of a routine", "6 sources"],
  ["iii", "Designing your morning", "1 question"],
  ["iv", "Deep work blocks", "3 sources"],
  ["v", "Managing energy, not time", "5 sources"],
  ["vi", "Recovering from setbacks", "2 sources"],
  ["vii", "Making it stick for good", "3 sources"],
] as const;

function BlueprintStep() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ip-pop mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="font-display text-[26px]">Chapter blueprint</span>
        <span className="text-[13px] text-ip-muted">7 chapters · ~46 pages</span>
      </div>
      {BLUEPRINT.map(([num, title, tag], i) => {
        const q = tag === "1 question";
        return (
          <div
            key={num}
            className={`ip-pop flex items-center gap-3 rounded-xl border bg-ip-bg px-3.5 py-[11px] text-[15px] ${q ? "border-ip-accent" : "border-ip-hair"}`}
            style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
          >
            <span className="w-[26px] shrink-0 font-display italic text-ip-brass">{num}</span>
            <span className="min-w-0 flex-1">{title}</span>
            <span className={`shrink-0 text-xs ${q ? "font-semibold text-ip-accent" : "text-ip-muted"}`}>{tag}</span>
          </div>
        );
      })}
    </div>
  );
}

function WritingStep() {
  const lines: [string, string][] = [
    ["100%", ".3s"],
    ["94%", "1s"],
    ["100%", "1.7s"],
    ["86%", "2.4s"],
    ["98%", "3.1s"],
  ];
  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
      <div className="ip-pop flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-[13px] text-ip-muted">
          <span>Writing chapter 3 of 7</span>
          <span className="font-mono">38%</span>
        </div>
        <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-ip-line">
          <div className="h-full w-[38%] rounded-full bg-ip-ink" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ip-good text-[11px] text-white">✓</span>
          Why habits beat motivation
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ip-good text-[11px] text-white">✓</span>
          The anatomy of a routine
        </div>
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ip-ink font-display text-[11px] italic text-ip-bg">iii</span>
          Designing your morning
        </div>
        <div className="flex items-center gap-2.5 text-ip-muted">
          <span className="h-5 w-5 rounded-full border border-ip-line" />
          Deep work blocks
        </div>
      </div>
      <div className="ip-pop flex aspect-[6/8] flex-col gap-2.5 rounded border border-ip-hair bg-ip-paper px-7 py-[30px] ip-shadow" aria-hidden="true">
        <div className="font-mono text-[9px] tracking-[0.14em] text-ip-brass">CHAPTER THREE</div>
        <div className="font-display text-[22px] leading-[1.1]">Designing your morning</div>
        <div className="mb-2 mt-0.5 h-px w-[30px] bg-ip-brass-l" />
        {lines.map(([w, d], i) => (
          <span key={i} className="ip-line" style={{ "--w": w, animationDelay: d } as React.CSSProperties} />
        ))}
        <span className="flex items-center gap-1">
          <span className="ip-line" style={{ "--w": "52%", animationDelay: "3.8s" } as React.CSSProperties} />
          <span className="ip-caret h-3.5 w-0.5 bg-ip-accent" />
        </span>
      </div>
    </div>
  );
}

function BookStep() {
  return (
    <div className="flex min-h-[396px] flex-wrap items-center justify-center gap-7">
      <div
        className="ip-pop relative flex h-[310px] w-[210px] shrink-0 flex-col rounded-[3px_8px_8px_3px] bg-ip-cover px-[22px] py-[30px]"
        style={{ boxShadow: "0 40px 70px -30px rgba(20,14,40,.6)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-[11px] border border-[rgba(217,174,104,.45)]" />
        <div className="mt-3 text-center font-mono text-[8px] tracking-[0.2em] text-[#d9ae68]">A PRACTICAL GUIDE</div>
        <div className="mt-[18px] text-center font-display text-[28px] font-light leading-[1.02] text-[#f3e7cf]">
          The Quiet
          <br />
          <em>Productivity</em>
          <br />
          Method
        </div>
        <div className="mt-auto text-center font-mono text-[9px] tracking-[0.18em] text-[#d9ae68]">YOUR NAME</div>
      </div>
      <div className="ip-pop flex max-w-[280px] flex-col gap-3" style={{ animationDelay: ".15s" }}>
        <span className="self-start rounded-full bg-ip-good-soft px-3 py-[5px] text-[13px] font-semibold text-ip-good">Ready to publish</span>
        <span className="font-display text-[30px] leading-[1.1]">48 pages, typeset and checked.</span>
        <span className="text-sm text-ip-muted">Cover · table of contents · chapter openers · quality check with 2 notes.</span>
        <span className="mt-1.5 flex flex-wrap gap-2" aria-hidden="true">
          <span className="rounded-xl bg-ip-ink px-4 py-[11px] text-sm font-semibold text-ip-bg">Download PDF</span>
          <span className="rounded-xl border border-ip-line px-4 py-[11px] text-sm font-medium">Open in editor</span>
        </span>
      </div>
    </div>
  );
}
