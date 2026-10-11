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
      `${BRAND} is an AI ebook generator that turns what you already know into ` +
      `a finished ebook. You share your notes, documents, or project; it maps ` +
      `your knowledge into a chapter blueprint, asks about the gaps, writes ` +
      `and edits every chapter, and exports a typeset PDF — cover to cover.`,
  },
  {
    q: "How does the AI ebook writer work?",
    a:
      "Describe the book and who it's for, then upload your materials — ZIP, PDF, " +
      "DOCX, TXT, Markdown, or pasted notes. Scrivetta organises what you know, " +
      "proposes a chapter blueprint, and asks a few questions where your material " +
      "has gaps. You edit and approve the blueprint, choose a depth, and Scrivetta " +
      "writes the book chapter by chapter, edits it against the whole manuscript, " +
      "and typesets it as a PDF.",
  },
  {
    q: "Can I write a book without uploading anything?",
    a:
      "Yes — that's the quick path. Skip the materials and Scrivetta drafts the " +
      "book from your brief alone. It's a fast way to get a first draft you then " +
      "rework in the editor. Because that draft leans on the AI's general " +
      "knowledge rather than yours, read it, check the facts, and add your own " +
      "experience before you publish it.",
  },
  {
    q: "Will the AI make things up?",
    a:
      "Scrivetta is built not to. Chapters are written from your material and " +
      "your answers first. Where something is missing, it asks you during the " +
      "blueprint step; anything you don't provide is covered only in general " +
      "terms, never with invented facts, numbers, or citations.",
  },
  {
    q: "How long will my book be?",
    a:
      "You choose a depth — Quick, Standard, or Comprehensive — and Scrivetta " +
      "estimates the length from your material before you start. You agree to " +
      "that estimate; if the book turns out to need noticeably more, generation " +
      "pauses and asks whether to continue, keep it shorter, or cancel.",
  },
  {
    q: "Can I write fiction with it?",
    a:
      "Yes. Novels and stories work through the quick path today: describe the " +
      "premise, characters, and tone, and refine the draft in the editor. A " +
      "dedicated fiction builder — characters, world, mood, and plot threads " +
      "planned before writing — is on the way.",
  },
  {
    q: "Can I edit the book after it's generated?",
    a:
      "Yes. Every book opens in a full editor where you can rewrite text, add, " +
      "remove, or reorder chapters, place and resize images, and change the " +
      "cover. The PDF updates with every change.",
  },
  {
    q: "What format do I get, and can I publish it?",
    a:
      "A typeset 6×9 inch PDF with embedded fonts, a table of contents, and a " +
      "cover — ready to read, share, or self-publish. The manuscript is yours to " +
      "keep, publish, and sell. Review it before publishing, as you would any draft.",
  },
  {
    q: "How much does it cost?",
    a:
      `Planning is free: creating an account, adding materials, building your ` +
      `blueprint, and getting a length estimate cost nothing. Writing the book ` +
      `uses credits — 1 credit is 1 finished page, and you're only charged for ` +
      `the pages actually produced. Subscribe for ${SUBSCRIPTION.priceLabel}/` +
      `${SUBSCRIPTION.period} for ${SUBSCRIPTION.credits} credits a month, or ` +
      `buy one-time credit packs. Credits never expire.`,
  },
  {
    q: "Do I need any writing or design experience?",
    a:
      "No. If you know your subject, Scrivetta handles the structure, the " +
      "writing, and the typesetting — you stay in control and can edit " +
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
