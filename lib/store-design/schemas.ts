import type { Ctx, Field, Item, SectionSchema, StyleId, StyleSchema } from "./core";
import { CODE_SAMPLES, codeSample } from "./code-samples";

/**
 * The styles an author can pick, and every editable piece of each one. Field
 * defaults come from the store itself; sample copy is only used for the
 * showcase sections that have nothing to draw on (an editor window, a page
 * spread), and the author is expected to rewrite or hide those.
 */

const HL = "Wrap words in *asterisks* to highlight them. A new line starts a new line.";

// ---- Shared defaults ---------------------------------------------------------

const headline = (c: Ctx) => c.store.headline || c.store.name;
const intro = (c: Ctx) => firstParagraph(c.store.description);
/**
 * A button that names the featured ebook — or, when its title is too long for
 * a button, says what it does ("Get the book — $19").
 */
const buy = (c: Ctx, verb: "Get" | "Buy" | "Start with", sep = "—", fallback = "See the books") => {
  if (!c.featured) return fallback;
  const short = c.featured.title.length <= 26;
  const what = short ? `${verb} ${c.featured.title}` : verb === "Start with" ? "Start reading" : `${verb} the book`;
  return `${what} ${sep} ${c.price(c.featured)}`;
};

function firstParagraph(s: string | null): string {
  if (!s) return "";
  return s.split(/\n\s*\n/)[0].trim();
}

function firstSentence(s: string | null): string {
  const p = firstParagraph(s);
  return p.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? p;
}

const faqDefaults = (c: Ctx): Item[] => [
  {
    q: "How do I get my ebook?",
    a: "Your files appear on screen right after you pay, and we email you a link too. Download each file up to 5 times within 30 days.",
  },
  { q: "Can I read it on my phone?", a: "Yes. It's a PDF, so it opens on any phone, tablet or computer." },
  { q: "Do I need an account?", a: "No. Pay securely by card through Stripe and the link arrives in your inbox." },
  {
    q: "Something went wrong — who do I contact?",
    a: c.store.contactEmail
      ? `Write to ${c.who} at ${c.store.contactEmail}. You're buying directly from ${c.who}.`
      : `Reply to your receipt email — you're buying directly from ${c.who}.`,
  },
];

const f = {
  text: (key: string, label: string, def: (c: Ctx) => string, hint?: string): Field => ({ key, label, type: "text", def, hint }),
  area: (key: string, label: string, def: (c: Ctx) => string, hint?: string): Field => ({ key, label, type: "textarea", def, hint }),
  code: (key: string, label: string, def: (c: Ctx) => string, hint?: string): Field => ({ key, label, type: "code", def, hint }),
  list: (key: string, label: string, def: (c: Ctx) => string[], hint?: string): Field => ({ key, label, type: "list", def, hint }),
  items: (
    key: string,
    label: string,
    fields: { key: string; label: string; multiline?: boolean }[],
    def: (c: Ctx) => Item[],
    opts: { hint?: string; max?: number } = {},
  ): Field => ({ key, label, type: "items", fields, def, ...opts }),
};

const faqSection = (title = "Before you buy", eyebrow = "FAQ"): SectionSchema => ({
  id: "faq",
  label: "Questions (FAQ)",
  optional: true,
  fields: [
    f.text("eyebrow", "Small label", () => eyebrow),
    f.text("title", "Title", () => title),
    f.items("items", "Questions", [{ key: "q", label: "Question" }, { key: "a", label: "Answer", multiline: true }], faqDefaults, { max: 10 }),
  ],
});

// ---- Scrivetta / literary (concept 1, the default) ----------------------------------------------------------

const literaryFaq = faqSection();

const literary: StyleSchema = {
  id: "literary",
  name: "Scrivetta",
  tagline: "Warm paper, a quiet serif and books on a shelf. For fiction, poetry and essays.",
  swatch: { bg: "#F4EFE6", fg: "#1C1A16", accent: "#7F5220", font: "var(--font-newsreader), Georgia, serif", sample: "Aa" },
  accents: ["#7F5220", "#7A2E2A", "#2F4A3A", "#2C3B5A"],
  decor: null,
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("eyebrow", "Small label", (c) => c.who),
        f.area("headline", "Headline", headline, HL),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => buy(c, "Buy", "—", "See the books")),
        f.text("secondary", "Second link", () => "See all books →"),
        f.list("trust", "Reassurances", () => ["Instant download", "Read on any device", "Secure checkout by Stripe"]),
        f.text("badgeTag", "Label on the newest book", () => "New", "Shown next to the first book. Leave empty to hide."),
      ],
    },
    {
      id: "strip",
      label: "How buying works",
      optional: true,
      fields: [
        f.items("items", "Steps", [{ key: "label", label: "Step" }, { key: "text", label: "Text" }], () => [
          { label: "Choose a book", text: "Read a sample first if you like." },
          { label: "Pay once, by card", text: "No account, no subscription." },
          { label: "Download straight away", text: "On screen, plus a link by email." },
        ], { max: 4 }),
      ],
    },
    {
      id: "books",
      label: "Ebooks",
      fields: [
        f.text("title", "Title", (c) => (c.products.length > 1 ? "The books" : "The book"), HL),
        f.text("note", "Small print", () => "prices in USD"),
      ],
    },
    {
      id: "read",
      label: "Read a page (spread)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", (c) => (c.featured ? `From ${c.featured.title}` : "A sample")),
        f.text("title", "Title", () => "Read the first *pages*.", HL),
        f.text("leftLabel", "Left page — running head", (c) => c.featured?.title ?? ""),
        f.text("leftTitle", "Left page — title", () => "[Title of a piece]"),
        f.area("leftText", "Left page — text", () => "Paste the first lines of a poem, story or chapter here.\nKeep the line breaks the way they are in the book."),
        f.text("leftPage", "Left page — number", () => "12"),
        f.text("rightLabel", "Right page — running head", (c) => c.who),
        f.text("rightTitle", "Right page — title", () => "[Another title]"),
        f.area("rightText", "Right page — text", () => "A second short passage,\nso readers hear your voice\nbefore they buy."),
        f.text("rightPage", "Right page — number", () => "13"),
        f.text("button", "Button", (c) => (c.featured ? `Keep reading — ${c.price(c.featured)}` : "")),
        f.text("link", "Link", (c) => (c.featured && c.chapters.length ? `See all ${c.chapters.length} chapters →` : "See the book →")),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "The author"),
        f.text("title", "Title", (c) => `A note from ${c.first}`),
        f.area("text", "Text", (c) => c.store.description || ""),
      ],
    },
    { ...literaryFaq, fields: literaryFaq.fields.filter((x) => x.key !== "eyebrow") },
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.text("title", "Title", () => "Tonight, read something *slowly*.", HL),
        f.text("primary", "Main button", (c) => buy(c, "Buy")),
        f.text("secondary", "Second link", () => "Browse all books →"),
        f.text("fine", "Small print", () => "Instant download · Secure checkout by Stripe · Sold directly by the author"),
      ],
    },
  ],
};

// ---- Code (concept 2) -------------------------------------------------------------

/** The sample code, file names and stack for the author's chosen language. */
const lang = (c: Ctx) => codeSample(c.variant);

/** The chapter the "inside a chapter" panel and the folder listing point at by default. */
const showcaseChapter = (c: Ctx) => c.chapters[Math.min(4, c.chapters.length - 1)]?.number ?? 5;
const nn = (n: number) => String(n).padStart(2, "0");

const code: StyleSchema = {
  id: "code",
  name: "Code",
  tagline: "Near-black, Geist and code you can read line by line. For programming and tech books.",
  swatch: { bg: "#090B0E", fg: "#E8EAED", accent: "#6EE7A0", font: "var(--sd-geist), system-ui, sans-serif", sample: "{ }" },
  accents: ["#6EE7A0", "#F2B866", "#8AB4F8", "#C4A7FF"],
  decor: { options: [{ id: "code", label: "Code behind the book" }, { id: "none", label: "None" }], def: "code" },
  variant: {
    label: "Code language",
    hint: "Sets the sample code, file names, tech stack and terminals. Anything you've edited yourself stays as it is.",
    options: Object.entries(CODE_SAMPLES).map(([id, x]) => ({ id, label: x.label })),
    def: "java",
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("badgeTag", "Badge tag", () => "New"),
        f.text("badge", "Badge text", (c) => (c.featured ? `${c.featured.title} is out` : ""), "Leave empty to hide the badge."),
        f.area("headline", "Headline", headline, "Wrap words in *asterisks* to soften them (shown in grey). A new line starts a new line."),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", () => "Get the book", "The price is added next to it."),
        f.text("secondary", "Second button", () => "Look inside", "Wrap words in *asterisks* to soften them."),
        f.text("byline", "Line under your name", () => "", "E.g. what you do or how long you've done it. Leave empty to hide."),
        f.list("tabs", "Code behind the book — open files", (c) => lang(c).tabs,
          "Shown when the moving background is on. The first file is the open one."),
        f.code("code", "Code behind the book", (c) => lang(c).hero, "Start a line with + to mark it as added; the last added line types itself out."),
        f.list("status", "Code behind the book — status bar", (c) => lang(c).status, "The last item takes the accent color."),
      ],
    },
    {
      id: "glance",
      label: "At a glance (numbers)",
      optional: true,
      fields: [
        f.items("items", "Numbers", [{ key: "value", label: "Number" }, { key: "label", label: "Label" }], (c) =>
          ([
            c.featured?.pageCount ? { value: String(c.featured.pageCount), label: "pages" } : null,
            c.chapters.length ? { value: String(c.chapters.length), label: "chapters, one project" } : null,
            c.products.length > 1 ? { value: String(c.products.length), label: "books" } : null,
            { value: "PDF", label: "instant download" },
          ] as (Item | null)[]).filter((x): x is Item => !!x), { max: 4 }),
        f.text("stackLabel", "Tech stack — label", () => "stack"),
        f.list("stack", "Tech stack", (c) => lang(c).stack, "Leave empty to hide the row."),
      ],
    },
    {
      id: "inside",
      label: "Inside a chapter (notes + code)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "Inside a chapter"),
        f.text("title", "Title", () => "Explained line by line, *like a good code review.*", HL),
        f.area("text", "Text", () => "You read why, then write the code. Hover a note to see exactly which lines it explains."),
        f.text("file", "Page — file name", (c) => `chapter-${nn(showcaseChapter(c))}.pdf`),
        f.text("page", "Page — page number", () => "p. 112"),
        f.text("label", "Page — chapter", (c) => {
          const ch = c.chapters.find((x) => x.number === showcaseChapter(c));
          return ch ? `${nn(ch.number)} · ${ch.title}` : "05 · Orders: idempotency and state machines";
        }),
        f.text("heading", "Page — title", () => "Make checkout safe to retry"),
        f.area("pageText", "Page — text", () => "Networks fail. A customer double-taps “Pay”, a mobile client retries after a timeout — and without protection you charge them twice."),
        f.items("notes", "Notes", [{ key: "text", label: "Note", multiline: true }, { key: "lines", label: "Code lines it explains (e.g. 3-5)" }], (c) => lang(c).notes.map((n) => ({ ...n })), { max: 4, hint: "Wrap code in `backticks`. The notes take turns; hovering one shows its lines." }),
        f.text("codeFile", "Code — file name", (c) => lang(c).codeFile),
        f.text("codePath", "Code — folder", (c) => lang(c).codePath),
        f.code("code", "Code", (c) => lang(c).code),
        f.text("test", "Test result — name", (c) => lang(c).test, "Leave empty to hide the result line."),
        f.text("testResult", "Test result — details", (c) => lang(c).testResult),
        f.items("cards", "Cards under the code", [{ key: "title", label: "Title" }, { key: "cmd", label: "Command" }, { key: "text", label: "Text", multiline: true }], (c) => [
          { cmd: "$ git log --oneline", title: "One commit per chapter", text: "Stuck? Diff your code against the reference." },
          { cmd: lang(c).testCmd, title: "Tests in every chapter", text: lang(c).testText },
          { cmd: "$ docker compose up", title: "Ends in production", text: "The last chapter ships what you built." },
        ], { max: 4 }),
      ],
    },
    {
      id: "files",
      label: "What you get (files + folders)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "What you get"),
        f.text("title", "Title", () => "Everything you need *to follow along.*", HL),
        f.area("text", "Text", () => "Every chapter is its own folder you can run — so you can start anywhere and always compare with working code."),
        f.items("rows", "Files", [{ key: "name", label: "What it is" }, { key: "ext", label: "Type (e.g. .pdf)" }, { key: "size", label: "Size" }], () => [
          { ext: ".pdf", name: "The book", size: "" },
        ], { max: 6 }),
        f.text("window", "Terminal — title", () => "~/books — zsh"),
        f.text("root", "Terminal — folder", (c) => `${slugify(c.featured?.title ?? "project")}/`),
        f.list("tree", "Terminal — what's inside", (c) => {
          const ch = c.chapters.slice(0, 12);
          if (!ch.length) return ["01-setup/", "02-first-feature/", "03-tests/", "README.md"];
          const names = ch.map((x) => `${nn(x.number)}-${shortSlug(x.title)}/`);
          const hi = Math.min(4, names.length - 1);
          return [...names.map((n, i) => (i === hi ? `> ${n.padEnd(22)}# ← you saw this` : n)), "README.md"];
        }, "One per line. Folders end with /. Start a line with > to highlight it; text after # is a comment."),
      ],
    },
    {
      id: "books",
      label: "Books",
      fields: [
        f.text("eyebrow", "Small label", (c) => (c.products.length > 1 ? "The books" : "The book")),
        f.text("note", "Small print", () => "prices in USD"),
        f.text("title", "Title", () => "Pick a project. *Ship it.*", HL),
        f.text("tag", "Tag on the first book", () => "start here", "Shown when there's more than one book. Leave empty to hide."),
        f.text("button", "Card link", () => "View book →"),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "The author"),
        f.area("quote", "Quote", (c) => (c.store.description ? `“${firstParagraph(c.store.description)}”` : ""), HL),
        f.area("text", "Text under the quote", (c) => c.store.description?.split(/\n\s*\n/).slice(1).join("\n\n").trim() ?? ""),
      ],
    },
    faqSection(),
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.area("title", "Title", (c) => (c.chapters.length ? `Your first real project is *${c.chapters.length} chapters away.*` : "Start building *today.*"), HL),
        f.text("primary", "Main button", () => "Get the book", "The price is added next to it."),
        f.text("secondary", "Second button", (c) => (c.products.length > 1 ? "All books" : "")),
        f.list("fine", "Small print", () => ["instant download", "stripe checkout", "sold directly by the author"]),
        f.text("window", "Terminal — title", (c) => `chapter-${nn(c.chapters.at(-1)?.number ?? 12)} — zsh`),
        f.code("terminal", "Terminal", (c) => lang(c).terminal, "Lines starting with $ are commands; a passing line takes the accent color. Leave empty to hide."),
      ],
    },
    {
      id: "footer",
      label: "Footer",
      fields: [f.area("text", "About the store", (c) => firstSentence(c.store.description))],
    },
  ],
};

// ---- Minimal (concept 3) ------------------------------------------------------------

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

const minimal: StyleSchema = {
  id: "minimal",
  name: "Minimal",
  tagline: "Off-white, big type, thin rules and lots of air. For guides and non-fiction.",
  swatch: { bg: "#F4F2EE", fg: "#111111", accent: "#E5482D", font: "var(--sd-instrument), system-ui, sans-serif", sample: "Aa" },
  accents: ["#E5482D", "#F2C230", "#B9C7A5", "#C9BFF0"],
  decor: null,
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("kicker", "Small line above", (c) => `(${c.who} — Ebooks)`),
        f.text("note", "Small line on the right", () => "", "E.g. what you write. Leave empty to hide."),
        f.area("headline", "Headline", headline, "Each line slides in on its own. Wrap words in *asterisks* to soften them (shown in grey)."),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => buy(c, "Start with", "—", "See the ebooks"), "Leave empty to hide."),
        f.text("secondary", "Second link", (c) => (c.products.length > 1 ? "All ebooks" : ""), "Leave empty to hide."),
        f.text("button", "Button under the featured ebook", () => "Buy now"),
      ],
    },
    {
      id: "facts",
      label: "Facts row",
      optional: true,
      fields: [
        f.items("items", "Facts", [{ key: "value", label: "Value" }, { key: "label", label: "Label" }], (c) => {
          const cheapest = c.products.reduce<typeof c.featured>((m, p) => (!m || p.priceCents < m.priceCents ? p : m), null);
          return [
            { value: String(c.products.length), label: c.products.length === 1 ? "title" : "titles" },
            { value: String(c.totalPages || "—"), label: "pages in total" },
            { value: cheapest ? c.price(cheapest) : "—", label: c.products.length > 1 ? "starting price" : "one payment" },
            { value: "PDF", label: "on screen and by email" },
          ];
        }, { max: 4 }),
      ],
    },
    {
      id: "spread",
      label: "A look inside (spread)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "A look inside"),
        f.text("title", "Title", () => "Pages you’ll actually use.", HL),
        f.area("text", "Text", () => "Every chapter ends with something to do, not something to think about."),
        f.text("link", "Link", (c) => (c.featured ? "See the book" : ""), "Leads to the first ebook. Leave empty to hide."),
        f.text("leftLabel", "Left page — running head", (c) => (c.chapters[0] ? `Chapter ${String(c.chapters[0].number).padStart(2, "0")} — ${c.chapters[0].title}` : "Chapter 01")),
        f.text("leftTitle", "Left page — title", () => "[A section title]"),
        f.area("leftText", "Left page — text", () => "Paste a short passage from the book here — a paragraph that shows how you explain things.", "Wrap words in *asterisks* to set them in bold."),
        f.text("leftPage", "Left page — number", () => "34"),
        f.text("rightLabel", "Right page — running head", (c) => c.featured?.title ?? ""),
        f.items("rows", "Right page — table", [{ key: "k", label: "Left column" }, { key: "v", label: "Right column" }], () => [
          { k: "Today", v: "Max. 3 items. One is the deep block." },
          { k: "This week", v: "What has a date. Checked each morning." },
          { k: "Later", v: "Everything else. Read on Fridays only." },
        ], { max: 6 }),
        f.area("tip", "Right page — tip", () => "*Try it* — pick one idea from this page and use it today.", "Wrap words in *asterisks* to set them in bold."),
        f.text("rightPage", "Right page — number", () => "35"),
      ],
    },
    {
      id: "changes",
      label: "What changes (4 columns)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "What changes"),
        f.text("title", "Title", () => "Four weeks from now.", HL),
        f.items("items", "Columns", [{ key: "title", label: "Title" }, { key: "text", label: "Text", multiline: true }], () => [
          { title: "[Result one]", text: "What readers can do after the book." },
          { title: "[Result two]", text: "Something concrete, not a promise." },
          { title: "[Result three]", text: "A skill, a habit or a decision." },
          { title: "[Result four]", text: "Keep each one to a line." },
        ], { max: 4 }),
      ],
    },
    {
      id: "books",
      label: "Ebooks",
      fields: [
        f.text("eyebrow", "Small label", () => "Ebooks"),
        f.text("title", "Title", (c) => `${NUMBER_WORDS[c.products.length] ?? c.products.length} short ${c.products.length === 1 ? "book" : "books"}.`, HL),
        f.text("note", "Small print", () => "PDF · prices in USD"),
        f.text("tag", "Tag on the first ebook", () => "Start here", "Shown when there's more than one ebook. Leave empty to hide."),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "About"),
        f.area("quote", "Quote", (c) => (c.store.description ? `“${firstParagraph(c.store.description)}”` : ""), "Wrap words in *asterisks* to soften them (shown in grey)."),
        f.text("name", "Name", (c) => c.who),
        f.text("role", "Role", () => ""),
      ],
    },
    faqSection("Before you buy.", "Help"),
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.area("title", "Title", () => "Start with\none book.", HL),
        f.text("fine", "Small print", (c) => `PDF by email · Secure checkout by Stripe · Sold directly by ${c.first}`),
        f.text("button", "Button", (c) => buy(c, "Get", "—", "See the ebooks")),
      ],
    },
  ],
};

// ---- Modern (concept 4) --------------------------------------------------------------

const modern: StyleSchema = {
  id: "modern",
  name: "Modern",
  tagline: "Dark glass, glowing orbs and a bold grotesque. For fitness, lifestyle and courses.",
  swatch: { bg: "#0B0B0E", fg: "#E8E8EE", accent: "#D4FF3A", font: "var(--sd-bricolage), system-ui, sans-serif", sample: "Aa" },
  accents: ["#D4FF3A", "#8C7BFF", "#FF7A45", "#3AE0FF"],
  decor: {
    options: [
      { id: "orbs", label: "Glowing orbs" },
      { id: "dots", label: "Dot grid" },
      { id: "none", label: "None" },
    ],
    def: "orbs",
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("badgeTag", "Badge tag", () => "New"),
        f.text("badge", "Badge text", (c) => (c.featured ? `${c.featured.title} is out →` : "")),
        f.area("headline", "Headline", headline, HL),
        f.list("words", "Rotating words after the headline", () => [], "Optional. 2–4 words that rotate at the end of the headline."),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => buy(c, "Start with", "·")),
        f.text("secondary", "Second button", () => "Look inside"),
        f.list("trust", "Reassurances", () => ["Instant PDF", "Stripe checkout", "No subscription"]),
        f.text("chipTitle", "Floating card — title", (c) => (c.featured?.pageCount ? `${c.featured.pageCount} pages` : "Ready to read")),
        f.text("chipText", "Floating card — text", () => "PDF · read anywhere"),
        f.text("barsLabel", "Bars card — label", () => "THIS WEEK"),
      ],
    },
    {
      id: "marquee",
      label: "Scrolling strip",
      optional: true,
      fields: [f.list("items", "Phrases", () => ["Instant PDF", "Pay once, keep forever", "Secure checkout", "Straight from the author"])],
    },
    {
      id: "inside",
      label: "Look inside (phones)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "LOOK INSIDE"),
        f.text("title", "Title", () => "Built to open on your phone."),
        f.area("text", "Text", () => "Every page fits on one screen. No pinching, no zooming."),
        f.text("mainLabel", "Middle phone — label", (c) => (c.chapters[0] ? `CHAPTER ${c.chapters[0].number}` : "CHAPTER 1")),
        f.text("mainTitle", "Middle phone — title", (c) => c.chapters[0]?.title ?? "[Chapter title]"),
        f.items("mainRows", "Middle phone — rows", [{ key: "n", label: "Left" }, { key: "r", label: "Right" }], () => [
          { n: "Step one", r: "5 min" },
          { n: "Step two", r: "10 min" },
          { n: "Step three", r: "5 min" },
          { n: "Review", r: "2 min" },
        ], { max: 6 }),
        f.text("mainTip", "Middle phone — tip", () => "Short, clear steps on every page."),
        f.text("leftLabel", "Left phone — label", (c) => (c.chapters[1] ? `CHAPTER ${c.chapters[1].number}` : "CHAPTER 2")),
        f.text("leftTitle", "Left phone — title", (c) => c.chapters[1]?.title ?? "[Chapter title]"),
        f.list("leftChecks", "Left phone — checklist", () => ["x First thing to do", "x Second thing", "Third thing", "Fourth thing"], "Start a line with x to tick it."),
        f.text("rightLabel", "Right phone — label", () => "TRACKER · DAY 1–30"),
        f.text("rightTitle", "Right phone — title", () => "Don’t break the chain"),
      ],
    },
    {
      id: "why",
      label: "Why it works (cards)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "WHY IT WORKS"),
        f.text("title", "Title", () => "Small enough to start. Built to stick."),
        f.text("planTitle", "Chart card — title", () => "A plan, mapped out"),
        f.text("planText", "Chart card — text", () => "You never wonder what comes next."),
        f.text("statLabel", "Number card — label", () => "Per chapter"),
        f.text("statNumber", "Number card — number", () => "20"),
        f.text("statText", "Number card — text", () => "minutes to read and apply."),
        f.text("chipsTitle", "Tags card — title", () => "What you need"),
        f.list("chips", "Tags card — tags", () => ["A phone", "20 minutes", "This book", "You"]),
        f.area("quote", "Quote", () => "Consistency beats intensity. Every single time."),
        f.text("progressTitle", "Ring card — title", () => "Progress you can see"),
        f.area("progressText", "Ring card — text", () => "A checklist at the end of every chapter. Tick it and keep going."),
        f.text("keepTitle", "Last card — title", () => "Yours to keep"),
        f.area("keepText", "Last card — text", () => "One payment. A PDF in your inbox. No app, no subscription."),
      ],
    },
    {
      id: "books",
      label: "Ebooks",
      fields: [
        f.text("title", "Title", (c) => (c.products.length > 1 ? "The books" : "The book")),
        f.list("bullets", "Featured book — bullet points", () => ["Short chapters you can finish in one sitting", "Clear steps, no fluff", "A checklist at the end of every chapter"]),
        f.text("button", "Featured book — button", () => "Get it now →"),
      ],
    },
    {
      id: "plan",
      label: "The plan (3 cards)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "THE PLAN"),
        f.text("title", "Title", (c) => (c.featured ? `Inside ${c.featured.title}` : "The plan")),
        f.items("items", "Phases", [{ key: "t", label: "Title" }, { key: "w", label: "Tag" }, { key: "pp", label: "Pages" }, { key: "d", label: "Text", multiline: true }], (c) => {
          const ch = c.chapters;
          const third = Math.max(1, Math.ceil(ch.length / 3));
          const groups = ch.length ? [ch.slice(0, third), ch.slice(third, third * 2), ch.slice(third * 2)].filter((g) => g.length) : [];
          return groups.length
            ? groups.map((g, i) => ({ w: `Part ${i + 1}`, pp: `ch. ${g[0].number}–${g[g.length - 1].number}`, t: g[0].title, d: g.map((x) => x.title).join(" · ") }))
            : [{ w: "Part 1", pp: "", t: "Foundation", d: "" }, { w: "Part 2", pp: "", t: "Build", d: "" }, { w: "Part 3", pp: "", t: "Own it", d: "" }];
        }, { max: 6 }),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", (c) => `ABOUT ${c.first.toUpperCase()}`),
        f.area("text", "Text", (c) => firstParagraph(c.store.description)),
        f.text("follow", "Links card — label", () => "Follow along"),
      ],
    },
    faqSection(),
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.area("title", "Title", () => "Your first chapter takes *20 minutes.*", HL),
        f.text("primary", "Main button", (c) => buy(c, "Get", "·")),
        f.text("secondary", "Second button", () => "All books"),
      ],
    },
  ],
};

// ---- Bold (concept 5) ------------------------------------------------------------------

const bold: StyleSchema = {
  id: "bold",
  name: "Bold",
  tagline: "Loud colors, thick outlines and a ticker. For money, side hustles and how-tos.",
  swatch: { bg: "#FFF3DF", fg: "#141414", accent: "#FFC93C", font: "var(--sd-archivo), system-ui, sans-serif", sample: "AA" },
  accents: ["#FFC93C", "#FF8A3D", "#7CF29A", "#FF9BD2"],
  decor: { options: [{ id: "on", label: "Stickers + ticker" }, { id: "none", label: "None" }], def: "on" },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("badge", "Badge", () => ""),
        f.area("headline", "Headline", headline, "Wrap words in *asterisks* to put them in a highlighted box. A new line starts a new line."),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => buy(c, "Get", "·", "See the guides")),
        f.text("secondary", "Second button", () => "See all guides"),
        f.text("sticker", "Round sticker", () => "START\nHERE"),
      ],
    },
    {
      id: "ticker",
      label: "Ticker",
      optional: true,
      fields: [f.list("items", "Phrases", (c) => ["Instant PDF", "Pay once, keep forever", "Secure checkout", `Straight from ${c.first}`])],
    },
    {
      id: "books",
      label: "Guides",
      fields: [
        f.text("title", "Title", (c) => (c.products.length > 1 ? "The guides" : "The guide")),
        f.text("button", "Card button", () => "GET IT →"),
        f.text("startTag", "Tag on the first guide", () => "START HERE"),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("title", "Title", (c) => `Hi, I’m ${c.first}.`),
        f.area("text", "Text", (c) => firstParagraph(c.store.description)),
      ],
    },
    faqSection("Questions?"),
  ],
};

export const STYLES: Record<StyleId, StyleSchema> = { literary, code, minimal, modern, bold };

/** A slug cut at a word, for folder names in the terminal listing. */
function shortSlug(s: string, max = 18): string {
  const full = slugify(s);
  if (full.length <= max) return full;
  const cut = full.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf("-") > 0 ? cut.lastIndexOf("-") : max);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "chapter";
}
