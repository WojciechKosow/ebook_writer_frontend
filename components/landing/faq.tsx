import { BRAND } from "@/lib/brand";
import { SUBSCRIPTION } from "@/lib/pricing";
import { Reveal } from "./reveal";

// Single source of truth for the FAQ. The visible <details> list below and the
// FAQPage JSON-LD (components/landing/structured-data.tsx) are both built from
// this array, so the structured data always matches what's on the page — which
// is what Google's FAQ guidelines require. Answers are plain strings (no JSX)
// so the same text can be embedded verbatim in the JSON-LD.
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: `What is ${BRAND}?`,
    a:
      `${BRAND} is an AI ebook generator and writing studio. From a short ` +
      `description of your idea it plans an outline, writes every chapter, ` +
      `edits the manuscript for consistency, and exports a typeset, ` +
      `print-ready PDF — cover to cover.`,
  },
  {
    q: "How does the AI ebook writer work?",
    a:
      "Describe your topic, genre, audience, and length — a sentence is enough " +
      "to start. Scrivetta drafts an outline, then writes the book chapter by " +
      "chapter while you watch progress fill in. When it's done you can read " +
      "it, keep editing, or export.",
  },
  {
    q: "Can I edit the book after it's generated?",
    a:
      "Yes. Every book opens in a full editor where you can rewrite text, add, " +
      "remove, or reorder chapters, drop in images, and design the cover before " +
      "you export.",
  },
  {
    q: "What format do I get, and can I publish it?",
    a:
      "You get a typeset PDF that's ready to read, share, or self-publish. The " +
      "manuscript is yours to keep, publish, and sell.",
  },
  {
    q: "How much does it cost?",
    a:
      `You can start free. After that, 1 credit writes roughly one page: ` +
      `subscribe for ${SUBSCRIPTION.priceLabel}/${SUBSCRIPTION.period} for ` +
      `${SUBSCRIPTION.credits} credits, or buy one-time credit packs. Credits ` +
      `never expire, and unused subscription credits roll over.`,
  },
  {
    q: "Do I need any writing or design experience?",
    a:
      "No. If you can describe the book you want, Scrivetta handles the blank " +
      "page, the structure, and the typesetting — you stay in control and edit " +
      "anything you like.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-6 py-20">
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
          FAQ
        </p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground">
          Questions, answered
        </h2>
      </Reveal>

      <div className="mt-12 divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={item.q} delay={i * 70}>
            <details className="group px-6 open:bg-surface-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="pb-5 pr-9 text-[15px] leading-7 text-muted">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
