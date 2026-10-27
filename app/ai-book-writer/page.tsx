import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { BRAND } from "@/lib/brand";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

const PATH = "/ai-book-writer";
const TITLE = "AI Book Writer: Turn Your Knowledge Into a Book";
const DESCRIPTION =
  `Write a book with AI from your own notes, documents and project files. ` +
  `${BRAND} plans the chapters, writes them from your material and exports a PDF.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI book writer",
    "AI book generator",
    "write a book with AI",
    "AI book writing tool",
    "write a book using AI",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} · ${BRAND}`,
    description: DESCRIPTION,
    url: PATH,
    type: "website",
    images: [SHARE_IMAGE],
  },
};

// Breadcrumbs only. The FAQ below is not marked up as FAQPage: the landing page
// already carries the site's FAQPage, and Google no longer shows FAQ rich
// results for commercial sites, so a second copy would add nothing.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "AI Book Writer", item: `${SITE_URL}${PATH}` },
  ],
};

const PROBLEMS = [
  {
    title: "Your material is scattered",
    body: "Notes in one app, slides in another, a folder of documents, a project nobody has written up. The knowledge exists, just not in one place.",
  },
  {
    title: "Structure takes longer than expected",
    body: "Deciding what goes in which chapter, in what order, and what is still missing is often harder than the writing itself.",
  },
  {
    title: "Every chapter starts from a blank page",
    body: "Ten or fifteen chapters written from scratch is weeks of evenings, and momentum is easy to lose halfway.",
  },
  {
    title: "Coherence needs a second pass",
    body: "Terms drift, examples repeat, chapter three contradicts chapter seven. Keeping a whole manuscript consistent takes careful review.",
  },
];

const STEPS = [
  {
    title: "Start with your idea",
    body: "Describe the book: its topic, what the reader should be able to do afterwards, who it is for, the writing style, the language and how deep it should go — Quick, Standard or Comprehensive. Add any instructions you want it to follow.",
  },
  {
    title: "Add your knowledge and materials",
    body: "Upload files or paste rough notes. If you have nothing to upload yet, you can also draft from the brief alone and add your own experience in the editor.",
  },
  {
    title: "Build the book structure",
    body: `${BRAND} reads your material and proposes a blueprint: the chapters, what each one is for, and which sources it draws on. Where something is missing, it asks you. Rename, reorder, add or remove chapters, then approve.`,
  },
  {
    title: "Generate the chapters",
    body: "Each chapter is written from the approved blueprint and the material linked to it, then edited against the whole manuscript. You agree to a length estimate first; if the book needs noticeably more, it pauses and asks.",
  },
  {
    title: "Review and edit",
    body: "The book opens in a full editor. Rewrite any passage, reorder chapters, add images and adjust the cover. A quality check points out repetition, broken lists and text that doesn't fit the page.",
  },
  {
    title: "Export the PDF",
    body: "Download a typeset 6×9″ PDF with a cover, a table of contents and page numbers. Edit again later and the PDF is rebuilt.",
  },
];

const MATERIALS = [
  ["ZIP", "A whole folder or software project"],
  ["PDF", "Reports, slides exported to PDF, papers"],
  ["DOCX", "Word documents and drafts"],
  ["TXT · MD", "Plain text and Markdown notes"],
  ["Notes", "Anything you type or paste, in any order"],
];

const EXAMPLES = [
  {
    who: "A developer",
    title: "A programming book from a real project",
    body: "Upload the repository as a ZIP. Code examples are based on your actual files, and if the book is in another language, code, identifiers and commands stay untouched.",
  },
  {
    who: "A consultant",
    title: "A guide built from years of client work",
    body: "Workshop decks, frameworks and the answers you keep giving clients become chapters that teach your method in your terms.",
  },
  {
    who: "A business owner",
    title: "A handbook of how the company works",
    body: "Process documents, checklists and onboarding notes turn into a handbook new hires can read from start to finish.",
  },
  {
    who: "A creator or educator",
    title: "An educational book from research and notes",
    body: "Course notes, transcripts and reading notes become a structured book that follows the order you teach in.",
  },
];

const USE_CASES = [
  { title: "Practical how-to books", body: "Step-by-step books that teach one skill or process well." },
  { title: "Technical and programming guides", body: "Tutorials and walkthroughs grounded in your own code, configuration and documentation." },
  { title: "Educational books", body: "Course companions, study guides and workbooks organised around a curriculum." },
  { title: "Professional handbooks", body: "Internal playbooks, methodologies and reference material for a team or a profession." },
  { title: "Business and industry guides", body: "Books that explain a market, a role or a way of working, drawn from your experience." },
  { title: "Knowledge-based nonfiction", body: "Any nonfiction where you know the subject and have notes, documents or research to work from." },
];

const DIFFERENCES = [
  { title: "A defined brief", body: "Topic, goal, audience, style, language and depth are set once and apply to every chapter." },
  { title: "A planned structure", body: "You see and approve the chapter plan before anything is written." },
  { title: "Your material, organised", body: "Sources are analysed once and linked to the chapters they belong to, instead of being pasted into each prompt." },
  { title: "Chapter by chapter", body: "Each chapter is written with the book's plan in view, so it knows where it sits and what the other chapters cover." },
  { title: "An editing pass and an editor", body: "Chapters are edited against the whole manuscript, and you can change anything afterwards." },
  { title: "A finished PDF", body: "The result is a typeset book with a cover and contents, not text to copy into a document." },
];

const REVIEW = [
  ["Facts, figures and names", "AI can misread a source or overgeneralise. Check anything a reader will rely on."],
  ["Technical examples", "Run the code, try the commands and confirm the versions match what you use."],
  ["Transitions and order", "Read the book straight through and make sure each chapter leads into the next."],
  ["Consistency", "Terms, examples and the voice should stay the same from the first chapter to the last."],
  ["Your goal", "Ask whether the book does what you set out to do for the reader, and cut what doesn't."],
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is an AI book writer?",
    a: (
      <>
        An AI book writer is a tool that helps you plan and draft a complete book rather than single
        passages of text. {BRAND} works from what you already know: you describe the book, add your
        notes and documents, approve a chapter plan, and it writes the manuscript chapter by chapter
        for you to edit and export as a PDF.
      </>
    ),
  },
  {
    q: "Can I write a whole book with AI?",
    a: (
      <>
        Yes, you can get a complete first manuscript, from the first chapter to the last. How good it
        is depends on what you give it: a clear brief and relevant material produce a far more useful
        book than a one-line idea. Expect to spend time reviewing and editing it before it is
        finished.
      </>
    ),
  },
  {
    q: "Can I use my own documents and research?",
    a: (
      <>
        Yes. You can upload ZIP archives (for example a whole project folder), PDF, Word (DOCX), TXT and
        Markdown files, and paste notes. {BRAND} reads them, links them to the chapters they support
        and asks you about anything the book needs that your material doesn&apos;t cover.
      </>
    ),
  },
  {
    q: "Is an AI-generated book ready to publish immediately?",
    a: (
      <>
        No — treat it as a strong draft. Read it in full, check facts, examples and references, and
        make sure it sounds like you. You remain responsible for what the book says. If you publish
        on Amazon KDP, read{" "}
        <Link href="/blog/can-you-publish-a-book-written-by-ai" className="text-ip-ink underline decoration-ip-brass-l underline-offset-4">
          what KDP requires you to disclose about AI content
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I create technical books and programming guides?",
    a: (
      <>
        Yes. Upload your project as a ZIP and {BRAND} reads the source code, documentation and
        configuration, while skipping dependency folders, build output, binaries and files that look
        like secrets. Code examples are based on your files and set in a monospaced layout in the PDF.
        Test every example before you publish.
      </>
    ),
  },
  {
    q: "Can I export my book as a PDF?",
    a: (
      <>
        Yes. Every book is exported as a typeset 6×9 inch PDF with a cover, a table of contents and
        page numbers. PDF is currently the only export format.
      </>
    ),
  },
  {
    q: "How is an AI book writer different from a general AI chatbot?",
    a: (
      <>
        A chatbot is flexible and good at individual passages, and you can write a book with one — but
        you manage the plan, the sources, the consistency between chapters and the layout yourself.{" "}
        {BRAND} keeps those in one project: a brief, an approved blueprint, your organised material,
        chapter-by-chapter writing, an editor and a PDF.
      </>
    ),
  },
];

const READING = [
  ["/how-to-write-an-ebook-with-ai", "The six steps of writing an ebook with AI"],
  ["/blog/plan-an-ebook-outline-with-ai", "How to plan a book outline, with free templates"],
  ["/blog/self-publish-ai-written-ebook", "How to self-publish an AI-written ebook"],
];

const h2 = "ip-display m-0 text-[clamp(32px,4.2vw,52px)]";
const card = "ip-card ip-rv min-w-0 rounded-3xl border border-ip-hair bg-ip-surface p-6 sm:p-7";
const inlineLink = "font-medium text-ip-ink underline decoration-ip-brass-l underline-offset-4";

export default function AiBookWriterPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-14 px-4 pb-14 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="ip-in flex min-w-0 flex-col gap-6">
          <span className="ip-eyebrow">AI book writer</span>
          <h1 className="ip-display m-0 text-[clamp(42px,5.6vw,76px)] leading-[1.02] tracking-[-0.025em]">
            Write a book with AI — built around <em className="text-ip-brass">your knowledge</em>
          </h1>
          <p className="m-0 max-w-[540px] text-lg leading-relaxed text-ip-ink-2">
            Turn your ideas, notes, documents and project materials into a structured book. {BRAND}{" "}
            helps you organise what you know, develop each chapter, refine the manuscript and
            prepare it for PDF export.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/register" className="ip-cta rounded-[14px] bg-ip-ink px-6 py-4 font-semibold text-ip-bg">
              Start writing your book
            </Link>
            <Link href="/ai-ebook-generator" className="ip-cta rounded-[14px] border border-ip-line bg-ip-surface px-[22px] py-4 font-medium">
              See the AI ebook generator
            </Link>
          </div>
          <p className="m-0 text-sm text-ip-muted">
            Planning is free. You approve the chapter plan and the estimated length before any credits
            are used.
          </p>
        </div>

        <HeroArt />
      </section>

      {/* The problem */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="ip-rv mb-10 max-w-[720px]">
          <span className="ip-eyebrow">The hard part</span>
          <h2 className={`${h2} mt-3`}>
            Why a book is hard to write, <em className="text-ip-brass">even when you know the subject</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 border-t border-ip-line sm:grid-cols-2">
          {PROBLEMS.map((p, i) => (
            <div
              key={p.title}
              className={`ip-rv flex flex-col gap-2 border-b border-ip-line py-7 sm:px-6 ${i % 2 ? "sm:border-l" : "sm:pl-0"}`}
            >
              <h3 className="m-0 font-display text-2xl font-normal">{p.title}</h3>
              <p className="m-0 text-[15px] leading-7 text-ip-ink-2">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="ip-rv mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${h2} max-w-[620px]`}>
            How the AI book writer <em className="text-ip-brass">works</em>
          </h2>
          <p className="m-0 max-w-[420px] text-ip-ink-2">
            Six steps from an idea to a PDF. You make the decisions at each one; {BRAND} does the
            organising, drafting and typesetting.
          </p>
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`${card} flex flex-col gap-3`}>
              <span className="font-display text-[44px] font-light italic leading-none text-ip-brass tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="m-0 font-display text-[24px] font-normal leading-tight">{s.title}</h3>
              <p className="m-0 text-[15px] leading-7 text-ip-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="ip-rv mx-auto mb-0 mt-8 max-w-[640px] text-center text-[15px] text-ip-muted">
          Want the method behind the steps? Read{" "}
          <Link href="/how-to-write-an-ebook-with-ai" className={inlineLink}>
            our guide to writing an ebook with AI
          </Link>
          .
        </p>
      </section>

      {/* Write from your own materials */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="ip-rv flex min-w-0 flex-col gap-5">
            <span className="ip-eyebrow">The difference</span>
            <h2 className={h2}>
              Write from <em className="text-ip-brass">your own materials</em>
            </h2>
            <p className="m-0 text-[17px] leading-8 text-ip-ink-2">
              The most useful books come from someone who knows the subject. {BRAND} is designed to
              work from that knowledge: it reads what you upload, works out what each chapter should
              draw on, and asks you about gaps instead of quietly filling them with general
              statements.
            </p>
            <div className="rounded-3xl border border-ip-hair bg-ip-surface p-6">
              <h3 className="m-0 text-[15px] font-semibold text-ip-ink">What you can add</h3>
              <dl className="m-0 mt-4 flex flex-col gap-3 text-[15px]">
                {MATERIALS.map(([kind, detail]) => (
                  <div key={kind} className="flex items-baseline gap-3">
                    <dt className="w-[74px] shrink-0 font-mono text-[12px] text-ip-brass">{kind}</dt>
                    <dd className="m-0 text-ip-ink-2">{detail}</dd>
                  </div>
                ))}
              </dl>
              <p className="mb-0 mt-4 border-t border-ip-hair pt-4 text-sm leading-6 text-ip-muted">
                In a ZIP, {BRAND} reads source code, documentation and configuration, and skips
                dependency folders, build output, binaries and likely secrets such as{" "}
                <code className="font-mono text-[13px]">.env</code> files and keys.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {EXAMPLES.map((e) => (
              <article key={e.title} className={`${card} flex flex-col gap-2.5`}>
                <span className="ip-eyebrow">{e.who}</span>
                <h3 className="m-0 font-display text-[23px] font-normal leading-tight">{e.title}</h3>
                <p className="m-0 text-[15px] leading-7 text-ip-ink-2">{e.body}</p>
              </article>
            ))}
            <p className="ip-rv m-0 text-sm leading-6 text-ip-muted sm:col-span-2">
              Give it the material that matters for this book rather than everything you have, and
              review the manuscript before you share it: the AI can still misread a source or state
              something more broadly than your material supports.
            </p>
          </div>
        </div>
      </section>

      {/* What you can create */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <h2 className={`${h2} ip-rv mb-10`}>What can you create?</h2>
        <div className="grid grid-cols-1 border-t border-ip-line sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u, i) => (
            <div
              key={u.title}
              className={`ip-rv flex flex-col gap-2 border-b border-ip-line py-7 sm:px-6 ${
                i % 2 ? "sm:border-l" : "sm:pl-0"
              } ${i % 3 ? "lg:border-l lg:!pl-6" : "lg:border-l-0 lg:!pl-0"}`}
            >
              <span className="ip-eyebrow">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="m-0 font-display text-2xl font-normal">{u.title}</h3>
              <p className="m-0 text-[15px] text-ip-ink-2">{u.body}</p>
            </div>
          ))}
        </div>
        <p className="ip-rv mb-0 mt-8 max-w-[760px] text-[15px] leading-7 text-ip-ink-2">
          {BRAND} works best for nonfiction where you have knowledge to draw on. Fiction and
          children&apos;s stories can be drafted from a brief, but they gain less from uploaded
          material and need more of your own rewriting; a dedicated fiction builder is on the way.
        </p>
      </section>

      {/* More than a text generator */}
      <section className="mx-auto w-full max-w-[1000px] px-4 py-14 sm:px-6">
        <div className="ip-rv rounded-[28px] border border-ip-hair bg-ip-surface p-7 sm:p-10">
          <h2 className={h2}>
            More than a generic <em className="text-ip-brass">AI text generator</em>
          </h2>
          <p className="mb-0 mt-4 max-w-[680px] text-[17px] leading-8 text-ip-ink-2">
            A general AI chatbot is great for a paragraph, an idea or a quick rewrite, and you can
            write a book with one. You just carry the plan, the sources and the consistency between
            chapters yourself. A book creation workflow keeps all of that in one project.
          </p>
          <dl className="m-0 mt-8 grid grid-cols-1 gap-x-10 border-t border-ip-hair sm:grid-cols-2">
            {DIFFERENCES.map((d) => (
              <div key={d.title} className="border-b border-ip-hair py-5">
                <dt className="font-display text-[21px] text-ip-ink">{d.title}</dt>
                <dd className="m-0 mt-1.5 text-[15px] leading-7 text-ip-ink-2">{d.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Editing and final review */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="ip-rv flex min-w-0 flex-col gap-5">
            <span className="ip-eyebrow">Before you publish</span>
            <h2 className={h2}>
              Editing and <em className="text-ip-brass">final review</em>
            </h2>
            <p className="m-0 text-[17px] leading-8 text-ip-ink-2">
              The generated manuscript is a draft, and you are its author. Every book opens in an
              editor where you can rewrite text, reorder chapters, add images and change the cover.
              Before you publish, read it through with these in mind:
            </p>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {REVIEW.map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0 text-ip-brass">
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                  <span className="text-ip-ink-2">
                    <b className="font-semibold text-ip-ink">{title}.</b> {body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <ReviewArt />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-[860px] px-4 py-14 sm:px-6">
        <h2 className={`${h2} ip-rv mb-8 text-center`}>
          AI book writer <em className="text-ip-brass">questions</em>
        </h2>
        <div className="border-t border-ip-line">
          {FAQ.map((item) => (
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

      {/* Further reading */}
      <section className="mx-auto w-full max-w-[760px] px-4 pb-6 pt-14 sm:px-6">
        <div className="ip-rv">
          <span className="ip-eyebrow">Keep reading</span>
          <ul className="m-0 mt-4 flex list-none flex-col border-t border-ip-line p-0">
            {READING.map(([href, label]) => (
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
            Your knowledge can <em className="text-ip-brass">become a book</em>
          </h2>
          <p className="m-0 max-w-md text-lg text-ip-ink-2">
            Start with what you know. Organise your materials, build the book&apos;s structure and
            develop the manuscript with {BRAND}.
          </p>
          <Link href="/register" className="ip-cta rounded-2xl bg-ip-ink px-7 py-[18px] font-semibold text-ip-bg">
            Start writing your book
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}

/**
 * Materials in, blueprint out — a simplified rendering of the real knowledge and
 * blueprint steps (file rows with what was read, chapters tagged with the sources
 * they draw on, an open question where the material has a gap).
 */
function HeroArt() {
  const files: [string, string, string][] = [
    ["ZIP", "billing-service.zip", "186 files read · 41 skipped"],
    ["DOCX", "architecture-notes.docx", "18,420 characters"],
    ["NOTES", "“JWT confused me at first — explain why we use it.”", ""],
  ];
  const chapters: [string, string, string[], boolean][] = [
    ["01", "Setting up the project", ["pom.xml", "README.md"], false],
    ["02", "Modelling invoices", ["Invoice.java", "schema.sql"], false],
    ["03", "Securing the API with JWT", ["SecurityConfig.java"], true],
    ["04", "Testing the payment flow", ["InvoiceServiceTest.java"], false],
  ];
  return (
    <div className="ip-in relative mx-auto flex w-full max-w-[540px] min-w-0 flex-col gap-3" style={{ animationDelay: ".3s" }} aria-hidden="true">
      <div className="rounded-3xl border border-ip-hair bg-ip-surface p-4 ip-shadow-sm sm:p-5">
        <div className="mb-3 text-xs font-medium text-ip-muted">Your materials</div>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {files.map(([kind, name, detail]) => (
            <li key={kind} className="flex items-center gap-3 rounded-lg border border-ip-hair bg-ip-bg px-3 py-2 text-xs">
              <span className="shrink-0 rounded-md bg-ip-surface px-1.5 py-0.5 font-mono text-[10px] text-ip-muted">{kind}</span>
              <span className={`min-w-0 flex-1 truncate ${detail ? "text-ip-ink" : "italic text-ip-ink-2"}`}>{name}</span>
              {detail && <span className="hidden shrink-0 text-ip-muted sm:inline">{detail}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center text-ip-brass">
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v22M4 18l6 6 6-6" />
        </svg>
      </div>

      <div className="rounded-3xl border border-ip-hair bg-ip-surface p-4 ip-shadow sm:p-5">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-ip-muted">Blueprint</span>
          <span className="rounded-full bg-ip-brass-soft px-2.5 py-0.5 text-[11px] font-semibold text-ip-brass">1 question</span>
        </div>
        <div className="mb-3 font-display text-[22px] leading-tight">Building a Billing API</div>
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
          {chapters.map(([num, title, sources, q]) => (
            <li key={num} className={`rounded-[10px] border bg-ip-bg px-3 py-2.5 text-sm ${q ? "border-ip-accent" : "border-ip-hair"}`}>
              <div className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-[11px] text-ip-muted">{num}</span>
                <span className="min-w-0 flex-1">{title}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5 pl-[30px]">
                {sources.map((s) => (
                  <span key={s} className="rounded-md bg-ip-surface px-1.5 py-0.5 font-mono text-[10px] text-ip-muted">{s}</span>
                ))}
              </div>
              {q && (
                <div className="mt-2 pl-[30px] text-xs font-medium text-ip-accent">
                  Where does the API get its signing key in production?
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** A simplified rendering of the quality check that runs on every finished book. */
function ReviewArt() {
  const findings: [string, string, string][] = [
    ["Repetition", "Chapter 3 · p. 14", "“in other words” appears 4 times in this chapter."],
    ["Long line", "Chapter 5 · p. 31", "A line of code runs past the page margin."],
    ["Broken list", "Chapter 7 · p. 46", "A list item has a marker but no text."],
  ];
  return (
    <div className="ip-card ip-rv min-w-0 rounded-3xl border border-ip-hair bg-ip-surface p-5 ip-shadow sm:p-7" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-display text-[22px]">Quality check</span>
        <span className="text-xs text-ip-muted">3 findings to review</span>
      </div>
      <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
        {findings.map(([label, where, text]) => (
          <li key={label} className="rounded-2xl border border-ip-hair bg-ip-bg px-4 py-3.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ip-warn-soft px-[9px] py-0.5 text-xs font-semibold text-ip-warn">{label}</span>
              <span className="text-xs text-ip-muted">{where}</span>
            </div>
            <div className="mt-2 text-ip-ink-2">{text}</div>
          </li>
        ))}
      </ul>
      <p className="mb-0 mt-4 text-xs leading-5 text-ip-muted">
        The check catches layout and repetition problems. Whether the content is right is still your
        call.
      </p>
    </div>
  );
}
