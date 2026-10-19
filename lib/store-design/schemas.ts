import type { Ctx, Field, Item, SectionSchema, StyleId, StyleSchema } from "./core";

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
const buy = (c: Ctx, verb: "Get" | "Start with", sep = "—", fallback = "See the books") => {
  if (!c.featured) return fallback;
  const short = c.featured.title.length <= 26;
  const what = short ? `${verb} ${c.featured.title}` : verb === "Get" ? "Get the book" : "Start reading";
  return `${what} ${sep} ${c.price(c.featured)}`;
};
const startCta = (c: Ctx) => buy(c, "Start with", "—", "See the ebooks");

function firstParagraph(s: string | null): string {
  if (!s) return "";
  return s.split(/\n\s*\n/)[0].trim();
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

const tocDefaults = (c: Ctx): Item[] =>
  c.chapters.slice(0, 12).map((ch) => ({ n: String(ch.number).padStart(2, "0"), t: ch.title, d: "", p: "" }));

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

const contentsSection = (eyebrow: string, title: (c: Ctx) => string): SectionSchema => ({
  id: "contents",
  label: "Table of contents",
  optional: true,
  fields: [
    f.text("eyebrow", "Small label", () => eyebrow),
    f.text("title", "Title", title, HL),
    f.area("text", "Intro", (c) =>
      c.featured && c.chapters.length
        ? `${c.chapters.length} chapters${c.featured.pageCount ? `, ${c.featured.pageCount} pages` : ""}.`
        : "",
    ),
    f.items(
      "items",
      "Chapters",
      [
        { key: "t", label: "Title" },
        { key: "n", label: "Number" },
        { key: "d", label: "One-line description" },
        { key: "p", label: "Pages (e.g. pp. 3–17)" },
      ],
      tocDefaults,
      { max: 16, hint: "Starts from the chapters of your first ebook." },
    ),
  ],
});

// ---- Scrivetta / literary (concept 1, the default) ----------------------------------------------------------

const literary: StyleSchema = {
  id: "literary",
  name: "Scrivetta",
  tagline: "Warm paper, a serif display and drifting pages. For fiction, poetry and essays.",
  swatch: { bg: "#F4F0E8", fg: "#1D1B17", accent: "#8B5E24", font: "var(--font-newsreader), Georgia, serif", sample: "Aa" },
  accents: ["#8B5E24", "#3A3270", "#7A2E2E", "#2F5A45"],
  decor: {
    options: [
      { id: "pages", label: "Pages + letters" },
      { id: "letters", label: "Letters only" },
      { id: "none", label: "None" },
    ],
    def: "pages",
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("badgeTag", "Badge tag", () => "NEW"),
        f.text("badge", "Badge text", (c) => (c.featured ? `${c.featured.title} is out` : "")),
        f.area("headline", "Headline", headline, HL),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => `${startCta(c)} →`),
        f.text("secondary", "Second button", () => "See all books"),
        f.list("trust", "Reassurances", () => ["Instant PDF by email", "Secure checkout by Stripe", "Straight from the author"]),
        f.text("excerptTitle", "Page behind the book — title", () => ""),
        f.area("excerpt", "Page behind the book — text", () => "", "A few lines from the book on a page behind the cover. Leave empty to hide it."),
        f.text("card1Title", "Floating card 1 — title", (c) => (c.featured?.pageCount ? `${c.featured.pageCount} pages` : "Ready to read")),
        f.text("card1Text", "Floating card 1 — text", (c) => c.featured?.subtitle || "Typeset PDF"),
        f.text("card2Title", "Floating card 2 — title", () => "Ready to read"),
        f.text("card2Text", "Floating card 2 — text", () => "Typeset PDF, yours to keep"),
      ],
    },
    {
      id: "strip",
      label: "Three promises",
      optional: true,
      fields: [
        f.items("items", "Promises", [{ key: "label", label: "Label" }, { key: "text", label: "Text" }], () => [
          { label: "YOU READ", text: "Short pieces, one sitting each" },
          { label: "YOU KEEP", text: "A typeset PDF, yours forever" },
          { label: "YOU SUPPORT", text: "An independent writer, directly" },
        ], { max: 4 }),
      ],
    },
    {
      id: "read",
      label: "Read a page (spread)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "READ A PAGE"),
        f.text("title", "Title", () => "Before you buy, *open it*.", HL),
        f.text("leftLabel", "Left page — running head", (c) => (c.featured ? c.featured.title.toUpperCase() : "")),
        f.text("leftTitle", "Left page — title", () => "[Title of a piece]"),
        f.area("leftText", "Left page — text", () => "Paste the first lines of a poem, story or chapter here.\nKeep the line breaks the way they are in the book."),
        f.text("leftPage", "Left page — number", () => "12"),
        f.text("rightLabel", "Right page — running head", (c) => c.who.toUpperCase()),
        f.text("rightTitle", "Right page — title", () => "[Another title]"),
        f.area("rightText", "Right page — text", () => "A second short passage,\nso readers hear your voice\nbefore they buy."),
        f.text("rightPage", "Right page — number", () => "13"),
        f.text("note", "Sticky note", (c) => (c.featured ? `Sample from ${c.featured.title}` : "")),
      ],
    },
    {
      id: "inside",
      label: "What's inside (cards)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "WHAT'S INSIDE"),
        f.text("title", "Title", () => "Small books, made with *care*.", HL),
        f.text("partsTitle", "Parts card — title", (c) => (c.featured ? `Inside ${c.featured.title}` : "How it's organised")),
        f.text("partsText", "Parts card — text", () => "Read it in order, or open anywhere."),
        f.items("parts", "Parts", [{ key: "name", label: "Name" }, { key: "n", label: "Numeral" }, { key: "sub", label: "Small text" }], (c) =>
          c.chapters.slice(0, 4).map((ch, i) => ({ n: ["I", "II", "III", "IV"][i], name: ch.title, sub: "" })),
          { max: 4 }),
        f.area("quote", "Quote", () => "A line from the book that stays with people."),
        f.text("quoteSource", "Quote source", (c) => (c.featured ? `FROM “${c.featured.title.toUpperCase()}”` : "")),
        f.items("cards", "Small cards", [{ key: "title", label: "Title" }, { key: "text", label: "Text", multiline: true }], () => [
          { title: "Typeset like a printed book", text: "Real margins, real line breaks — the page looks the way it was written." },
          { title: "Made for a phone at night", text: "Opens on any phone. No scrolling past the last line." },
          { title: "In your inbox in a minute", text: "Pay once, get the PDF by email. No account, no app." },
        ], { max: 3 }),
      ],
    },
    {
      id: "books",
      label: "Ebooks",
      fields: [
        f.text("eyebrow", "Small label", () => "THE BOOKS"),
        f.text("title", "Title", (c) => (c.products.length > 1 ? `${c.products.length} books.` : "The book."), HL),
        f.list("bullets", "Featured book — bullet points", () => ["Read in one evening, or a little each night", "Yours to keep, on every device", "A gift that fits in an email"]),
        f.text("button", "Featured book — button", () => "Get the book →"),
      ],
    },
    contentsSection("CONTENTS", (c) => (c.featured ? `Inside *${c.featured.title}*` : "Contents")),
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "THE AUTHOR"),
        f.text("title", "Title", (c) => `A note from ${c.first}`),
        f.area("text", "Text", (c) => c.store.description || ""),
      ],
    },
    faqSection(),
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.text("title", "Title", () => "Tonight, read something *slowly*.", HL),
        f.text("primary", "Main button", (c) => buy(c, "Get")),
        f.text("secondary", "Second button", () => "All books"),
        f.text("fine", "Small print", () => "PDF by email · Secure checkout by Stripe · Sold directly by the author"),
      ],
    },
  ],
};

// ---- Code (concept 2) -------------------------------------------------------------

const SAMPLE_CODE = `@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orders;
    private final PaymentGateway payments;

    @Transactional
    public Order checkout(Cart cart) {
+       if (cart.isEmpty()) throw new EmptyCartException();
+       var order = Order.from(cart);
+       payments.charge(order.total());
        return orders.save(order);
    }
}`;

const SAMPLE_TERMINAL = `$ ./mvnw test
[INFO] Tests run: 42, Failures: 0, Errors: 0
[INFO] BUILD SUCCESS  in 6.2s
$ ./mvnw spring-boot:run
Started ShopApplication in 1.84 seconds`;

const code: StyleSchema = {
  id: "code",
  name: "Code",
  tagline: "A dark, technical look with a live editor window. For programming and tech books.",
  swatch: { bg: "#07080A", fg: "#C9D1DC", accent: "#8AB4FF", font: "var(--sd-geist), system-ui, sans-serif", sample: "{ }" },
  accents: ["#8AB4FF", "#6EE7B7", "#F5C88A", "#C4A7FF"],
  decor: {
    options: [
      { id: "beams", label: "Light beams" },
      { id: "stream", label: "Code stream" },
      { id: "none", label: "None" },
    ],
    def: "beams",
  },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("badgeTag", "Badge tag", () => "NEW"),
        f.text("badge", "Badge text", (c) => c.featured?.title ?? ""),
        f.area("headline", "Headline", headline, HL),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", (c) => buy(c, "Get")),
        f.text("secondary", "Second button", () => "See the table of contents"),
      ],
    },
    {
      id: "editor",
      label: "Editor window",
      optional: true,
      fields: [
        f.text("window", "Window title", (c) => (c.featured ? `${slugify(c.featured.title)} — chapter-01` : "project — chapter-01")),
        f.list("tabs", "Open files (first is active)", () => ["OrderService.java", "Order.java", "application.yml"]),
        f.list("tree", "Sidebar", (c) =>
          c.chapters.length ? c.chapters.slice(0, 10).map((ch) => `${String(ch.number).padStart(2, "0")}-${slugify(ch.title)}`) : ["01-setup", "02-basics", "03-project"],
          "One entry per line. Start a line with two spaces to indent it; the first indented line is shown as open."),
        f.code("code", "Code", () => SAMPLE_CODE, "Start a line with + to mark it as added in this chapter."),
        f.text("callout", "Callout next to the code", () => "You write these lines in chapter 05"),
        f.code("terminal", "Terminal", () => SAMPLE_TERMINAL, "Lines starting with $ are shown as commands."),
        f.text("statusLeft", "Status bar — left", () => "chapter-05 · orders & transactions"),
        f.text("statusRight", "Status bar — right", () => "Java 21 · Spring Boot 3 · UTF-8"),
      ],
    },
    {
      id: "stack",
      label: "Tech stack strip",
      optional: true,
      fields: [
        f.text("label", "Label", () => "BUILT ON"),
        f.list("items", "Technologies", () => ["Java 21", "Spring Boot 3", "PostgreSQL 16", "Docker", "JUnit 5"]),
      ],
    },
    {
      id: "build",
      label: "What you build (cards)",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "WHAT YOU BUILD"),
        f.text("title", "Title", () => "A real project, shaped like the ones you’ll work on."),
        f.text("flowTitle", "Big card — title", () => "Layered architecture, end to end"),
        f.text("flowText", "Big card — text", () => "Every layer is something you write and test yourself."),
        f.list("flow", "Big card — diagram (left to right, 2nd is highlighted)", () => ["Client", "REST API", "Services", "Repositories", "PostgreSQL"]),
        f.list("chips", "Big card — tags", () => ["Payments", "JWT auth", "Migrations", "Error handling"]),
        f.text("commitsTitle", "Commits card — title", () => "One commit per chapter"),
        f.text("commitsText", "Commits card — text", () => "Stuck? Diff against the reference."),
        f.items("commits", "Commits", [{ key: "m", label: "Message" }, { key: "h", label: "Hash" }], (c) =>
          (c.chapters.length ? c.chapters.slice(0, 5).map((ch) => `feat: ${ch.title.toLowerCase()}`) : ["feat: project setup", "feat: first endpoint", "test: integration tests"])
            .map((m, i) => ({ h: ["c41e9a2", "9b07f13", "3fd2c80", "e6a1b45", "07c3d9e"][i] ?? "a1b2c3d", m })),
          { max: 6 }),
        f.text("testsTitle", "Tests card — title", () => "Tested like production code"),
        f.text("testsText", "Tests card — text", () => "Unit and integration tests in every chapter."),
        f.text("testsLabel", "Tests card — result", () => "42 passing · 0 failing"),
        f.text("shipTitle", "Code card — title", () => "Ships in a container"),
        f.text("shipText", "Code card — text", () => "The last chapter deploys what you built."),
        f.code("shipCode", "Code card — code", () => `FROM eclipse-temurin:21-jre\nCOPY target/app.jar app.jar\nEXPOSE 8080\nENTRYPOINT ["java","-jar","app.jar"]`),
        f.text("noteTitle", "Annotation card — title", () => "Code that reads well on paper"),
        f.text("noteText", "Annotation card — text", () => "Syntax-highlighted listings, explained line by line."),
        f.text("noteCode", "Annotation card — code line", () => "@Transactional"),
        f.area("noteBody", "Annotation card — explanation", () => "Either the order and the payment both happen, or neither does. That’s the whole point of this annotation."),
      ],
    },
    {
      id: "books",
      label: "Books",
      fields: [
        f.text("eyebrow", "Small label", () => "THE BOOKS"),
        f.text("title", "Title", () => "Pick a project. Ship it."),
        f.list("bullets", "Featured book — bullet points", () => ["Build a real project chapter by chapter", "Every chapter ends with working code", "Source code included"]),
        f.text("button", "Featured book — button", () => "Get the book →"),
      ],
    },
    contentsSection("CONTENTS", (c) => (c.featured ? `Inside ${c.featured.title}` : "Contents")),
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "THE AUTHOR"),
        f.text("title", "Name", (c) => c.who),
        f.area("text", "Text", (c) => c.store.description || ""),
      ],
    },
    faqSection(),
    {
      id: "closing",
      label: "Closing call to action",
      optional: true,
      fields: [
        f.text("title", "Title", (c) => (c.featured ? `Your first real project is ${c.chapters.length || "a few"} chapters away.` : "Start building today.")),
        f.text("primary", "Main button", (c) => buy(c, "Get")),
        f.text("secondary", "Second button", () => "All books"),
        f.text("fine", "Small print", () => "PDF by email · Secure checkout by Stripe · Sold directly by the author"),
      ],
    },
  ],
};

// ---- Minimal (concept 3) ------------------------------------------------------------

const minimal: StyleSchema = {
  id: "minimal",
  name: "Minimal",
  tagline: "Off-white, big type, thin rules and lots of air. For guides and non-fiction.",
  swatch: { bg: "#F5F4F0", fg: "#111111", accent: "#111111", font: "var(--sd-hanken), system-ui, sans-serif", sample: "Aa" },
  accents: ["#111111", "#2F4BD8", "#C2410C", "#1F5E46"],
  decor: { options: [{ id: "none", label: "None" }, { id: "grid", label: "Grid lines" }], def: "none" },
  sections: [
    {
      id: "hero",
      label: "Hero",
      fields: [
        f.text("kicker", "Small line above", (c) => `${c.who} — Ebooks`),
        f.area("headline", "Headline", headline, HL),
        f.area("intro", "Intro", intro),
        f.text("primary", "Main button", startCta),
        f.text("secondary", "Second link", () => "All ebooks"),
        f.text("caption", "Caption under the cover", (c) => (c.featured ? `Fig. 01 — ${c.featured.title}${c.featured.pageCount ? `, ${c.featured.pageCount} pp.` : ""}` : "")),
      ],
    },
    {
      id: "facts",
      label: "Facts row",
      optional: true,
      fields: [
        f.items("items", "Facts", [{ key: "value", label: "Value" }, { key: "label", label: "Label" }], (c) => [
          { value: String(c.products.length), label: c.products.length === 1 ? "title" : "titles" },
          { value: String(c.totalPages || "—"), label: "pages in total" },
          { value: "PDF", label: "by email, instantly" },
          { value: "0", label: "accounts needed" },
        ], { max: 4 }),
      ],
    },
    {
      id: "spread",
      label: "A look inside (spread)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "(A look inside)"),
        f.text("title", "Title", () => "Pages you’ll actually use."),
        f.area("text", "Text", () => "Every chapter ends with something to do, not something to think about."),
        f.text("leftLabel", "Left page — running head", (c) => (c.chapters[0] ? `Chapter ${String(c.chapters[0].number).padStart(2, "0")} — ${c.chapters[0].title}` : "Chapter 01")),
        f.text("leftTitle", "Left page — title", () => "[A section title]"),
        f.area("leftText", "Left page — text", () => "Paste a short passage from the book here — a paragraph that shows how you explain things."),
        f.text("rightLabel", "Right page — running head", (c) => c.featured?.title ?? ""),
        f.items("rows", "Right page — table", [{ key: "k", label: "Left column" }, { key: "v", label: "Right column" }], () => [
          { k: "Today", v: "Max. 3 items. One is the deep block." },
          { k: "This week", v: "What has a date. Checked each morning." },
          { k: "Later", v: "Everything else. Read on Fridays only." },
        ], { max: 6 }),
        f.area("tip", "Right page — tip", () => "Try it — pick one idea from this page and use it today."),
      ],
    },
    {
      id: "changes",
      label: "What changes (4 columns)",
      optional: true,
      offByDefault: true,
      fields: [
        f.text("eyebrow", "Small label", () => "(What changes)"),
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
        f.text("eyebrow", "Small label", () => "(Ebooks)"),
        f.text("button", "Featured ebook — button", () => "Buy now"),
        f.items("rows", "Featured ebook — highlights", [{ key: "text", label: "Text" }, { key: "ref", label: "Reference (e.g. ch. 03)" }], (c) =>
          c.chapters.slice(0, 3).map((ch) => ({ text: ch.title, ref: `ch. ${String(ch.number).padStart(2, "0")}` })), { max: 6 }),
      ],
    },
    {
      id: "about",
      label: "About the author",
      optional: true,
      fields: [
        f.text("eyebrow", "Small label", () => "(About)"),
        f.area("quote", "Quote", (c) => (c.store.description ? `“${firstParagraph(c.store.description)}”` : "")),
        f.text("name", "Name", (c) => c.who),
        f.text("role", "Role", () => ""),
      ],
    },
    faqSection("", "(Help)"),
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

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "chapter";
}
