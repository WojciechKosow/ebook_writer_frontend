import Link from "next/link";
import { CreditNotes, CreditPacks, PricingPlans } from "@/components/landing/pricing";

const card = "ip-card ip-rv min-w-0 rounded-3xl border border-ip-hair bg-ip-surface";
const h2 = "ip-display m-0 text-[clamp(36px,4.4vw,60px)]";

function Check({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 text-ip-brass ${className}`}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

/** In → you decide → out: the whole product in one ruled strip. */
export function LandingPillars() {
  const items = [
    ["In", "ZIP, PDF, DOCX, TXT, Markdown or pasted notes"],
    ["You decide", "Blueprint, depth and length before a credit is spent"],
    ["Out", "A typeset 6×9″ book with cover and contents"],
  ];
  return (
    <section className="ip-rv mx-auto w-full max-w-[1200px] px-4 pb-6 pt-2 sm:px-6">
      <div className="grid grid-cols-1 border-y border-ip-line md:grid-cols-3">
        {items.map(([label, text], i) => (
          <div
            key={label}
            className={`flex flex-col gap-1.5 py-[26px] md:px-6 ${i > 0 ? "border-t border-ip-line md:border-l md:border-t-0" : "md:pl-0"}`}
          >
            <span className="ip-eyebrow">{label}</span>
            <span className="text-[15px] text-ip-ink-2">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const KINDS = ["Coaching frameworks", "Cookbooks", "Course companions", "Memoir", "Technical guides", "Fitness plans", "Lead magnets", "Family recipes"];

export function LandingMarquee() {
  // The list is rendered twice so the -50% scroll loops seamlessly.
  const row = (copy: string) =>
    KINDS.flatMap((k, i) => [
      <span key={`${copy}${k}`}>{i % 2 ? <em>{k}</em> : k}</span>,
      <span key={`${copy}${k}-star`} className="text-ip-brass-l">✦</span>,
    ]);
  return (
    <section
      aria-label="Kinds of books people write"
      className="ip-marquee relative overflow-hidden py-7 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
    >
      <p className="sr-only">{KINDS.join(", ")}</p>
      <div aria-hidden="true" className="ip-track flex w-max gap-12 whitespace-nowrap font-display text-[30px] font-light text-ip-ink-2">
        {row("a")}
        {row("b")}
      </div>
    </section>
  );
}

export function LandingCraft() {
  const blueprint: [string, string, string, boolean][] = [
    ["i", "Why habits beat motivation", "4 sources", false],
    ["ii", "The anatomy of a routine", "6 sources", false],
    ["iii", "Designing your morning", "1 question", true],
    ["iv", "Deep work blocks", "3 sources", false],
  ];
  return (
    <section id="features" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-20 sm:px-6">
      <div className="ip-rv mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className={`${h2} max-w-[640px]`}>
          Not a chat window.
          <br />
          <em className="text-ip-brass">A writing studio.</em>
        </h2>
        <p className="m-0 max-w-[400px] text-ip-ink-2">
          A pipeline that starts from what you know and keeps voice, facts and structure
          consistent across a whole book.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className={`${card} grid grid-cols-1 items-center gap-7 p-6 sm:p-8 md:grid-cols-2 lg:col-span-2`}>
          <div className="flex flex-col gap-3">
            <span className="ip-eyebrow">01 · Blueprint</span>
            <h3 className="m-0 font-display text-[30px] font-normal leading-[1.1]">
              Written from your material, chapter by chapter
            </h3>
            <p className="m-0 text-ip-ink-2">
              Your notes are mapped to a chapter plan, and each chapter is written from the
              knowledge that belongs to it — so the last page still sounds like the first.
            </p>
          </div>
          <ol aria-label="Example blueprint" className="m-0 flex list-none flex-col gap-2 rounded-2xl border border-ip-hair bg-ip-bg p-3 sm:p-[18px]">
            {blueprint.map(([num, title, tag, q]) => (
              <li
                key={num}
                className={`flex items-center gap-3 rounded-[10px] border bg-ip-surface px-3 py-2.5 text-sm ${q ? "border-ip-accent" : "border-ip-hair"}`}
              >
                <span className="w-[18px] shrink-0 font-display italic text-ip-brass">{num}</span>
                <span className="min-w-0 flex-1">{title}</span>
                <span className={`shrink-0 text-xs ${q ? "font-semibold text-ip-accent" : "text-ip-muted"}`}>{tag}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className={`${card} flex flex-col gap-3.5 p-6 sm:p-8`}>
          <span className="ip-eyebrow">02 · Honest</span>
          <h3 className="m-0 font-display text-[28px] font-normal leading-[1.1]">Asks instead of inventing</h3>
          <p className="m-0 text-ip-ink-2">
            Where your material has gaps, Scrivetta asks. Anything you don&apos;t provide stays
            general — never made-up facts.
          </p>
          <div className="mt-auto flex flex-col gap-2.5 rounded-2xl border border-ip-hair bg-ip-bg p-4 text-sm">
            <div className="flex gap-2.5">
              <span className="h-6 w-6 shrink-0 rounded-[7px] bg-ip-ink" aria-hidden="true" />
              <span>
                Your notes mention a “10-minute reset” but don&apos;t describe it. What happens in
                those 10 minutes?
              </span>
            </div>
            <div className="self-end rounded-[12px_12px_4px_12px] bg-ip-accent px-3 py-2 text-ip-accent-ink">
              Walk, water, write tomorrow&apos;s top three.
            </div>
          </div>
        </article>

        <article className={`${card} flex flex-col gap-3.5 p-6 sm:p-8`}>
          <span className="ip-eyebrow">03 · Editorial pass</span>
          <h3 className="m-0 font-display text-[28px] font-normal leading-[1.1]">A second reader on every page</h3>
          <p className="m-0 text-ip-ink-2">
            Each chapter is edited against the whole book, then a quality check flags repeats,
            gaps and layout issues.
          </p>
          <div className="mt-auto rounded-2xl border border-ip-hair bg-ip-bg px-4 py-3.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ip-warn-soft px-[9px] py-0.5 text-xs font-semibold text-ip-warn">Repetition</span>
              <span className="text-xs text-ip-muted">Chapter 3 · p. 14</span>
            </div>
            <div className="mt-2">“at the end of the day” appears 4 times in this chapter.</div>
          </div>
        </article>

        <article className={`${card} flex flex-col gap-3.5 p-6 sm:p-8`}>
          <span className="ip-eyebrow">04 · No surprises</span>
          <h3 className="m-0 font-display text-[28px] font-normal leading-[1.1]">Length agreed up front</h3>
          <p className="m-0 text-ip-ink-2">
            You agree to an estimate before you start. If the book needs more, Scrivetta pauses
            and asks.
          </p>
          <div className="mt-auto rounded-2xl border border-ip-hair bg-ip-bg p-4">
            <div className="flex justify-between text-[13px] text-ip-muted">
              <span>Estimated</span>
              <span className="font-mono">38 – 52 pages</span>
            </div>
            <div className="relative mt-2.5 h-2 rounded-full bg-ip-line" aria-hidden="true">
              <div className="absolute inset-y-0 left-[34%] w-[38%] rounded-full bg-ip-brass-l" />
              <div className="absolute left-[58%] top-[-4px] h-4 w-4 rounded-full border-[3px] border-ip-surface bg-ip-ink" />
            </div>
          </div>
        </article>

      </div>
    </section>
  );
}

export function LandingEditor() {
  const points: [string, string, string][] = [
    ["i", "Rewrite anything", " — by hand, or ask for a tighter version of a paragraph."],
    ["ii", "Add, remove or reorder chapters", " with drag and drop."],
    ["iii", "Place and resize images", ", change the cover text and style."],
  ];
  return (
    <section id="editor" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div className="ip-rv flex min-w-0 flex-col gap-5">
          <span className="ip-eyebrow">The editor</span>
          <h2 className="ip-display m-0 text-[clamp(36px,4.2vw,56px)]">
            The book stays <em className="text-ip-brass">yours</em> — and editable.
          </h2>
          <p className="m-0 max-w-[460px] text-ip-ink-2">
            Every book opens in a full editor. Change a sentence or a whole chapter, and the PDF
            re-typesets itself.
          </p>
          <ul className="m-0 mt-2 flex list-none flex-col gap-3.5 p-0">
            {points.map(([n, b, rest]) => (
              <li key={n} className="flex items-baseline gap-3.5">
                <span className="w-[22px] shrink-0 font-display italic text-ip-brass">{n}</span>
                <span>
                  <b className="font-semibold">{b}</b>
                  {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ip-card ip-rv min-w-0 overflow-hidden rounded-3xl border border-ip-hair bg-ip-surface ip-shadow" aria-hidden="true">
          <div className="flex flex-wrap items-center gap-2 border-b border-ip-hair px-4 py-3 text-[13px] text-ip-muted">
            <span className="rounded-lg bg-ip-bg px-2.5 py-1 font-semibold text-ip-ink">B</span>
            <span className="rounded-lg px-2.5 py-1 italic">I</span>
            <span className="rounded-lg px-2.5 py-1">H2</span>
            <span className="rounded-lg px-2.5 py-1">Image</span>
            <span className="ml-auto inline-flex items-center gap-1.5">
              <span className="h-[7px] w-[7px] rounded-full bg-ip-good" />
              PDF up to date
            </span>
          </div>
          <div className="flex flex-wrap">
            <div className="flex flex-[1_1_170px] flex-col gap-1 border-ip-hair px-3 py-4 text-[13px] sm:border-r">
              <span className="px-2.5 py-2 text-ip-muted">⠿ Why habits beat motivation</span>
              <span className="px-2.5 py-2 text-ip-muted">⠿ The anatomy of a routine</span>
              <span className="rounded-lg bg-ip-bg px-2.5 py-2 font-semibold">⠿ Designing your morning</span>
              <span className="-rotate-[1.5deg] rounded-lg border border-dashed border-ip-accent bg-ip-surface px-2.5 py-2 text-ip-muted ip-shadow-sm">⠿ Deep work blocks</span>
              <span className="px-2.5 py-2 text-ip-muted">⠿ Managing energy, not time</span>
            </div>
            <div className="min-w-0 flex-[999_1_300px] px-6 py-6 font-display text-base leading-[1.7] text-ip-ink-2 sm:px-[30px]">
              <div className="mb-2.5 text-2xl text-ip-ink">Designing your morning</div>
              The first hour sets the tone for everything that follows.{" "}
              <span className="border-b-2 border-ip-accent bg-ip-accent-soft text-ip-ink">
                Not because mornings are magic, but because they are the only part of the day you
                fully own
              </span>{" "}
              — before the inbox, before the calls.
              <div className="mt-3.5 inline-flex flex-wrap gap-1.5 rounded-xl bg-ip-ink p-1.5 font-sans text-xs text-ip-bg">
                <span className="rounded-lg bg-white/15 px-2.5 py-1.5">Tighten</span>
                <span className="px-2.5 py-1.5 opacity-80">Warmer</span>
                <span className="px-2.5 py-1.5 opacity-80">Add example</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingSample() {
  const contents: [string, number][] = [
    ["Meet your starter", 1],
    ["Flour, water, salt", 7],
    ["The first bake", 12],
    ["Shaping and scoring", 19],
    ["Troubleshooting", 25],
    ["Beyond the basic loaf", 30],
  ];
  return (
    <section id="typesetting" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <div className="ip-rv grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[32px] bg-ip-ink p-8 text-ip-bg sm:p-[clamp(32px,5vw,72px)] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <span className="ip-eyebrow !text-ip-brass-l">Typeset like a real book</span>
          <h2 className="ip-display m-0 text-[clamp(34px,4vw,54px)]">
            A book you can <em>hold</em>, not a chat you copy.
          </h2>
          <p className="m-0 max-w-[440px] opacity-80">
            Chapter openers, running heads, drop caps and a real table of contents — exported as
            a 6×9″ PDF that&apos;s ready to read, share or self-publish.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="ip-cta rounded-[14px] bg-ip-bg px-[22px] py-[15px] font-semibold text-ip-ink">
              Plan your book free
            </Link>
            <Link
              href="/how-to-write-an-ebook-with-ai"
              className="px-2 py-[15px] font-medium underline underline-offset-4"
            >
              Read the guide
            </Link>
          </div>
        </div>
        <div className="ip-spread flex justify-center [perspective:1400px]" aria-hidden="true">
          <div
            className="flex h-[330px] w-[230px] shrink-0 flex-col gap-2.5 rounded-l bg-[#f7f2e8] px-[26px] py-[34px] text-[#1b1814]"
            style={{ transform: "rotateY(14deg)", transformOrigin: "right", boxShadow: "inset -20px 0 30px -20px rgba(0,0,0,.25)" }}
          >
            <div className="text-center font-mono text-[8px] tracking-[0.14em] text-[#8a5c1f]">CONTENTS</div>
            <div className="flex flex-col font-display text-[11.5px] leading-[2]">
              {contents.map(([t, p]) => (
                <span key={t} className="flex justify-between gap-2">
                  {t}
                  <span>{p}</span>
                </span>
              ))}
            </div>
          </div>
          <div
            className="flex h-[330px] w-[230px] shrink-0 flex-col gap-2 rounded-r bg-[#fbf7ef] px-[26px] py-[34px] text-[#1b1814]"
            style={{ transform: "rotateY(-14deg)", transformOrigin: "left", boxShadow: "inset 20px 0 30px -20px rgba(0,0,0,.2)" }}
          >
            <div className="font-mono text-[8px] tracking-[0.14em] text-[#8a5c1f]">CHAPTER ONE</div>
            <div className="font-display text-xl leading-[1.1]">Meet your starter</div>
            <div className="mb-1 mt-0.5 h-px w-[26px] bg-[#c9a063]" />
            <div className="font-display text-[10px] leading-[1.65] text-[#4b453c]">
              <span className="float-left pr-[5px] pt-[3px] text-[34px] leading-[.85] text-[#1b1814]">A</span> starter
              is a living thing, and like most living things it rewards attention more than
              precision. Feed it, watch it, learn its rhythm.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const COMPARE: [string, string, string][] = [
  ["Starts from your material", "Only what fits in one prompt", "Reads every file you upload"],
  ["Consistent across 40+ pages", "Drifts, repeats, forgets", "Terms and tone carried chapter to chapter"],
  ["Missing facts", "Fills gaps confidently", "Asks you, or stays general"],
  ["Length", "Whatever comes out", "Estimated and agreed up front"],
  ["Layout", "Copy-paste into Word", "Typeset PDF with cover and contents"],
  ["After the first draft", "Start a new chat", "Full editor, PDF updates live"],
];

export function LandingCompare() {
  return (
    <section id="compare" className="mx-auto w-full max-w-[1000px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <div className="ip-rv mb-10 text-center">
        <h2 className={h2}>
          Why not just <em className="text-ip-brass">ask a chatbot?</em>
        </h2>
        <p className="mx-auto mb-0 mt-3.5 max-w-[520px] text-ip-ink-2">
          A chat window is great for a paragraph. A book is forty pages that have to agree with
          each other.
        </p>
      </div>
      <div className="ip-rv overflow-x-auto rounded-3xl border border-ip-hair bg-ip-surface">
        <table className="w-full min-w-[560px] border-collapse text-[15px]">
          <thead>
            <tr className="text-left">
              <th className="border-b border-ip-hair px-6 py-5"><span className="sr-only">Compared</span></th>
              <th className="border-b border-ip-hair px-6 py-5 text-sm font-semibold text-ip-muted">Chat window</th>
              <th className="border-b border-ip-hair bg-ip-bg px-6 py-5 font-display text-xl font-medium">Scrivetta</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([label, chat, us], i) => (
              <tr key={label}>
                <th scope="row" className={`px-6 py-4 text-left font-medium ${i < COMPARE.length - 1 ? "border-b border-ip-hair" : ""}`}>{label}</th>
                <td className={`px-6 py-4 text-ip-muted ${i < COMPARE.length - 1 ? "border-b border-ip-hair" : ""}`}>{chat}</td>
                <td className={`bg-ip-bg px-6 py-4 ${i < COMPARE.length - 1 ? "border-b border-ip-hair" : ""}`}>
                  <span className="inline-flex items-baseline gap-2">
                    <Check className="translate-y-0.5" />
                    {us}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const AUDIENCE: { title: string; text: string; icon: React.ReactNode }[] = [
  {
    title: "Coaches & consultants",
    text: "Turn the framework you repeat in every session into a book clients can keep.",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5" />
      </>
    ),
  },
  {
    title: "Course creators",
    text: "Upload lesson notes and transcripts; get the companion ebook your students ask for.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="m10 9 4 2-4 2z" />
        <path d="M8 21h8" />
      </>
    ),
  },
  {
    title: "Experts & professionals",
    text: "Years of documents and know-how, finally organised into one authoritative guide.",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
        <path d="M9 7h7M9 11h5" />
      </>
    ),
  },
  {
    title: "Makers & hobbyists",
    text: "Sourdough, woodwork, gardening — the craft you love, written down properly.",
    icon: (
      <>
        <path d="M12 3c3 2.7 4.5 5.6 4.5 8 0 2.5-2 4.5-4.5 4.5S7.5 13.5 7.5 11c0-2.4 1.5-5.3 4.5-8z" />
        <path d="M12 15.5V21M8 21h8" />
      </>
    ),
  },
];

export function LandingAudience() {
  return (
    <section id="who" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <h2 className={`${h2} ip-rv mb-10`}>
        For people who <em className="text-ip-brass">know their subject</em>
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCE.map((a) => (
          <article key={a.title} className="ip-card ip-rv flex flex-col gap-2.5 rounded-[22px] border border-ip-hair bg-ip-surface p-[26px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ip-brass">
              {a.icon}
            </svg>
            <h3 className="m-0 font-display text-[23px] font-normal">{a.title}</h3>
            <p className="m-0 text-[15px] text-ip-ink-2">{a.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LandingPricing() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <div className="ip-rv mb-12 flex flex-col items-center gap-4 text-center">
        <span className="ip-eyebrow">Pricing</span>
        <h2 className={h2}>
          Plan for free. Pay for the <em className="text-ip-brass">writing.</em>
        </h2>
        <p className="m-0 max-w-[600px] text-ip-ink-2">
          Your brief, sources and blueprint cost nothing. Credits cover the AI work — chapters, images and
          covers — and you always see the estimate before anything runs.
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <PricingPlans />
        <CreditPacks />
      </div>
      <div className="mt-16">
        <CreditNotes />
      </div>
      <div className="ip-rv mt-12 flex justify-center">
        <Link href="/pricing" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-medium hover:text-ip-brass">
          Compare plans and read the pricing FAQ
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

export function LandingClosing() {
  return (
    <section className="relative mx-auto w-full max-w-[1200px] overflow-hidden px-4 py-28 text-center sm:px-6 md:py-[140px]">
      <div aria-hidden="true" className="ip-sheet hidden sm:block" style={{ left: "10%", top: "26%", width: 120, animation: "ip-converge1 10s ease-in-out infinite" }} />
      <div aria-hidden="true" className="ip-sheet hidden sm:block" style={{ right: "10%", top: "34%", width: 104, animation: "ip-converge2 12s ease-in-out infinite" }} />
      <div className="ip-rv relative flex flex-col items-center gap-[26px]">
        <h2 className="ip-display m-0 text-[clamp(44px,6vw,84px)] leading-none tracking-[-0.025em]">
          Your book is already
          <br />
          in <em className="text-ip-brass">your notes.</em>
        </h2>
        <p className="m-0 max-w-[520px] text-lg text-ip-ink-2">
          Add your material, review the blueprint and see the estimated length — before you spend
          a credit.
        </p>
        <Link href="/register" className="ip-cta rounded-2xl bg-ip-ink px-7 py-[18px] font-semibold text-ip-bg">
          Plan your book free
        </Link>
      </div>
    </section>
  );
}
