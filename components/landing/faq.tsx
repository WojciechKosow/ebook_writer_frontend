import { BRAND } from "@/lib/brand";
import { CREDIT_COSTS, PACKS, PRO, formatCredits, formatPrice } from "@/lib/pricing";

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
      `uses credits. Pro is ${PRO.priceLabel}/${PRO.period} with ` +
      `${formatCredits(PRO.credits)} credits every billing period, and your own ` +
      `storefront for selling your ebooks is coming in a later version. On any plan you can buy one-time credit ` +
      `packs: ${PACKS.map((p) => `${formatCredits(p.credits)} for ${formatPrice(p.priceCents)}`).join(", ")}. ` +
      `Pack credits never expire; unused monthly credits don't roll over.`,
  },
  {
    q: "What is a credit?",
    a:
      `Credits measure AI work, not pages. Writing uses most of them — about ` +
      `${CREDIT_COSTS.perPage} credits per finished page — and each AI image or ` +
      `cover uses a few more. How many a book needs depends on its length, images ` +
      `and material, so ${BRAND} shows you an estimate before it starts, and you ` +
      `only pay for what is actually produced. If a step fails, its credits come back.`,
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
    <section id="faq" className="mx-auto w-full max-w-[860px] px-4 pb-10 pt-24 sm:px-6 md:pt-[110px]">
      <h2 className="ip-display ip-rv mb-8 mt-0 text-center text-[clamp(36px,4.4vw,56px)]">
        Questions, <em className="text-ip-brass">answered</em>
      </h2>
      <div className="border-t border-ip-line">
        {FAQ_ITEMS.map((item) => (
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
  );
}
