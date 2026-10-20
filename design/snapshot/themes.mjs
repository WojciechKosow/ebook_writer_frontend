// Screenshots of the pages an author's store produces, in one store style
// (theme), so each style can be redesigned on its own:
// design/snapshot/out/themes/<style>/*.png.
//
//   npx next build && npx next start -p 3100
//   NODE_PATH=$(npm root -g) node design/snapshot/themes.mjs literary   # BASE=http://localhost:3100
//   BOOKS=1 node design/snapshot/themes.mjs literary store   # a store with 1–5 books (default 3)
//
// Each page is saved whole (<id>.png) and cut into parts (parts/<id>-NN.png).
//
// The public store API is mocked with a sample author store.

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node-tools/node_modules/playwright"));
}

const BASE = process.env.BASE || "http://localhost:3100";
const API = process.env.API || "http://localhost:8080";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const STYLES = ["literary", "code", "minimal", "modern", "bold"];

const style = process.argv[2];
if (!STYLES.includes(style)) {
  console.error(`Usage: node themes.mjs <${STYLES.join("|")}>`);
  process.exit(1);
}
const OUT = path.join(HERE, "out", "themes", style);

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

// ---- Sample stores ----------------------------------------------------------------
// A literary author by default; the code style gets a technical author, so each
// style is shown with the kind of books it is made for.

const file = (over) => ({
  id: "ebook-pdf", filename: null, format: "PDF", sizeBytes: 2_400_000, version: 1, updatedAt: null,
  label: null, note: null, accountOnly: false, downloadsLeft: null, updated: false, ...over,
});

const product = (id, title, subtitle, description, price, pageCount, cover) =>
  ({ id, title, subtitle, description, priceCents: price, currency: "usd", pageCount, language: "en", coverUrl: `/covers/${cover}.png` });

const SAMPLES = {
  books: {
    slug: "marta-lis",
    store: {
      name: "Small Hours Press",
      headline: "Essays and poems for the *quiet part* of the day.",
      description:
        "I write short essays and poems about ordinary evenings — kitchens, trains, the light at 6 p.m. Each book is small enough to finish in one sitting and typeset like a printed one.\n\nI've been writing for literary magazines for ten years; these are the pieces readers kept asking for.",
      authorName: "Marta Lis",
      contactEmail: "marta@smallhours.press",
      instagramUrl: "https://instagram.com/smallhours.press",
      tiktokUrl: null,
      websiteUrl: "https://smallhours.press",
    },
    products: [
      product("p-evening", "The Evening Hours", "Twelve essays on slowing down",
        "Twelve short essays about the hour after work — cooking for one, the last train home, a window left open in October. Read one a night.", 1400, 86, "evening"),
      product("p-salt", "Salt & Paper", "Poems", "Forty poems about the sea, letters, and the people we write to.", 900, 54, "salt"),
      product("p-letters", "Letters to a Slow Reader", "On reading less, and better", "A short book of letters on attention, rereading and keeping a notebook.", 1200, 68, "letters"),
      product("p-notebook", "A Notebook for October", "Prompts for slow evenings", "Thirty-one short prompts, one for every evening of the month.", 700, 40, "salt"),
      product("p-rooms", "Rooms", "Poems", "Poems about the rooms we leave behind.", 900, 48, "evening"),
    ],
    chapters: [
      "The hour after work", "Cooking for one", "The last train home", "A window left open in October", "Notes from a balcony", "What the radio said",
      "Lamps", "Walking the long way", "Dishes, slowly", "The neighbour's piano", "Sunday, 6 p.m.", "Going to bed early",
    ],
    highlights: ["Read one essay a night, in ten minutes", "Notice the small things that make an evening yours", "Typeset like a printed book, on any screen"],
    included: [
      file({}),
      file({ id: "f-epub", format: "EPUB", sizeBytes: 900_000, label: "For e-readers", note: "EPUB — for Kindle, Kobo or Apple Books" }),
      file({ id: "f-audio", format: "ZIP", sizeBytes: 48_000_000, label: "Read by the author", note: "Three essays as audio (MP3)", accountOnly: true }),
    ],
    sampleHtml:
      "<p>There is an hour, after the door closes and before anyone asks for dinner, that belongs to no one. I used to fill it — with email, with the radio, with the small chores that wait by the sink. Lately I have been leaving it empty.</p>" +
      "<p>It is not a long hour. Some days it is barely ten minutes. But it has a particular light, and a particular sound: the fridge, a neighbour's door, the bus going round the corner. If you sit still long enough, the day finishes arriving.</p>" +
      "<p>This book is about that hour, and the others like it.</p>",
    covers: {
      look: "serif",
      evening: { bg: "#2E3A4F", fg: "#F1E6CF", accent: "#D9A55B", title: "The Evening<br>Hours", sub: "Twelve essays on slowing down" },
      salt: { bg: "#E9E1D2", fg: "#2A2722", accent: "#7A2E2E", title: "Salt &amp;<br>Paper", sub: "Poems" },
      letters: { bg: "#5B3A29", fg: "#F4EBDD", accent: "#E7C38C", title: "Letters to a<br>Slow Reader", sub: "On reading less, and better" },
    },
  },
  tech: {
    slug: "kuba-nowak",
    store: {
      name: "Backend Notes",
      headline: "Production-ready backends, *one chapter at a time*.",
      description:
        "I've built payment and order systems in Java for twelve years. These books are the guides I wish I'd had: one real project each, tests included, no toy examples.\n\nEvery book comes with the full source code, chapter by chapter.",
      authorName: "Kuba Nowak",
      contactEmail: "kuba@backendnotes.dev",
      instagramUrl: null,
      tiktokUrl: null,
      websiteUrl: "https://backendnotes.dev",
    },
    products: [
      product("p-spring", "Production-Ready Spring Boot", "Build an e-commerce backend, step by step",
        "One real project from first commit to deploy: JWT security, idempotent orders, centralised errors, Testcontainers and a CI pipeline.", 3900, 251, "spring"),
      product("p-testing", "Testing Java Services", "From unit tests to contract tests", "Fast, honest tests for services that talk to databases, queues and other teams.", 2400, 148, "testing"),
      product("p-postgres", "PostgreSQL for Backend Developers", "Indexes, locks and migrations", "What your ORM doesn't tell you: query plans, indexes, locking and zero-downtime migrations.", 2900, 182, "postgres"),
      product("p-kafka", "Kafka in Practice", "Events without the pain", "Topics, partitions, retries and the outbox pattern, in one order-processing system.", 2700, 160, "spring"),
      product("p-logs", "Clean Logs", "A short guide to logging", "Structured logs, correlation ids and alerts that wake you for the right reasons.", 900, 48, "testing"),
    ],
    chapters: [
      "Project setup and the domain model", "REST API design that lasts", "Validation and centralised errors", "Security with JWT and refresh tokens",
      "Orders: idempotency and state machines", "Payments and webhooks", "Persistence with JPA and Flyway", "Testing with Testcontainers",
      "Caching with Redis", "Observability: logs, metrics, traces", "Docker and the CI pipeline", "Deploying to production",
    ],
    highlights: ["Ship a backend with security, payments and tests that you'd put in production", "Follow one real project, commit by commit", "Reuse the patterns at work the next day"],
    included: [
      file({ sizeBytes: 6_800_000 }),
      file({ id: "f-epub", format: "EPUB", sizeBytes: 2_100_000, label: "For e-readers", note: "EPUB — for Kindle, Kobo or Apple Books" }),
      file({ id: "f-code", format: "ZIP", sizeBytes: 3_400_000, label: "Source code", note: "The full project, one folder per chapter" }),
      file({ id: "f-sheet", format: "PDF", sizeBytes: 400_000, label: "Cheat sheet", note: "Annotations, config and test recipes on two pages", accountOnly: true }),
    ],
    sampleHtml:
      "<p>Most tutorials stop where production starts. We'll build the same shop backend you would at work — and keep it running when two requests arrive at once.</p>" +
      "<h3>Creating the project</h3><p>Start from Spring Initializr with Web, Validation, Data JPA, PostgreSQL and Flyway. Then add the first entity:</p>" +
      "<pre><code>@Entity\npublic class Order {\n    @Id @GeneratedValue\n    private Long id;\n    private String idempotencyKey;\n    @Enumerated(EnumType.STRING)\n    private OrderStatus status = OrderStatus.NEW;\n}</code></pre>" +
      "<p>The <code>idempotencyKey</code> is what lets a client retry a payment without charging twice. We'll come back to it in chapter 5.</p>",
    covers: {
      look: "tech",
      spring: { bg: "#0F1720", fg: "#E6EDF3", accent: "#6EE7B7", title: "Production-Ready<br>Spring Boot", sub: "Build an e-commerce backend" },
      testing: { bg: "#14161F", fg: "#E6E8F0", accent: "#93C5FD", title: "Testing Java<br>Services", sub: "Unit to contract tests" },
      postgres: { bg: "#F1F5F9", fg: "#0F172A", accent: "#2563EB", title: "PostgreSQL for<br>Backend Devs", sub: "Indexes, locks, migrations" },
    },
  },
  guide: {
    slug: "ola-mazur",
    store: {
      name: "Quiet Work",
      headline: "Practical guides for *calmer, focused* work.",
      description:
        "I coach small teams on how to plan their weeks. These guides are the methods we use, written down: short, practical, with templates you can use on Monday morning.\n\nNo productivity theatre — just fewer, better hours.",
      authorName: "Ola Mazur",
      contactEmail: "ola@quietwork.co",
      instagramUrl: "https://instagram.com/quietwork.co",
      tiktokUrl: null,
      websiteUrl: "https://quietwork.co",
    },
    products: [
      product("p-quiet", "The Quiet Productivity Method", "Build calm, focused routines that last",
        "A practical guide for busy professionals who want to get more done with less stress — one routine at a time, with weekly templates.", 1900, 112, "quiet"),
      product("p-week", "Plan a Week in 30 Minutes", "A Friday ritual for the week ahead", "One planning session, three lists and a calendar that finally tells the truth.", 900, 46, "week"),
      product("p-no", "Saying No at Work", "Scripts for protecting your time", "Twenty-four short scripts for meetings, requests and deadlines — polite, clear and kind.", 1200, 64, "no"),
      product("p-meet", "Fewer Meetings", "A guide for team leads", "Cut a third of your team's meetings without losing what they were for.", 1500, 88, "week"),
      product("p-mornings", "Better Mornings", "A 14-day plan", "Fourteen small changes to start the day on purpose.", 700, 38, "no"),
    ],
    chapters: [
      "Why habits beat motivation", "The anatomy of a routine", "Designing your morning", "Deep work blocks", "Managing energy, not time", "The weekly review",
      "Email in two sittings", "Meetings with a purpose", "Recovering from setbacks", "Working with a team", "Making it stick for good",
    ],
    highlights: ["Plan your week in 30 minutes, every Friday", "Protect two deep-work blocks a day", "Finish the workday with an empty head"],
    included: [
      file({ sizeBytes: 3_100_000 }),
      file({ id: "f-epub", format: "EPUB", sizeBytes: 1_200_000, label: "For e-readers", note: "EPUB — for Kindle, Kobo or Apple Books" }),
      file({ id: "f-templates", format: "ZIP", sizeBytes: 2_600_000, label: "Planning templates", note: "Weekly planner and review sheets (PDF, Notion)" }),
      file({ id: "f-workbook", format: "PDF", sizeBytes: 800_000, label: "Workbook", note: "Exercises for every chapter", accountOnly: true }),
    ],
    sampleHtml:
      "<p>Motivation is a feeling. Habits are a system. This chapter is about building the second, so you can stop waiting for the first.</p>" +
      "<h3>The three-list week</h3><p>Every Friday, write three lists:</p>" +
      "<ul><li><strong>Today</strong> — at most three items, one of them a deep-work block.</li><li><strong>This week</strong> — anything with a date.</li><li><strong>Later</strong> — everything else, read only on Fridays.</li></ul>" +
      "<p>That's it. The rest of the book is about keeping these lists honest.</p>",
    covers: {
      look: "minimal",
      quiet: { bg: "#F5F4F0", fg: "#111111", accent: "#E4572E", title: "The Quiet<br>Productivity<br>Method", sub: "Calm, focused routines" },
      week: { bg: "#1F3B2D", fg: "#F2F1EC", accent: "#B7D36B", title: "Plan a Week<br>in 30 Minutes", sub: "A Friday ritual" },
      no: { bg: "#E9E4F5", fg: "#1D1A33", accent: "#5B4BDB", title: "Saying No<br>at Work", sub: "Scripts for your time" },
    },
  },
};

const SAMPLE = SAMPLES[{ code: "tech", minimal: "guide" }[style] ?? "books"];
const SLUG = SAMPLE.slug;
const store = { slug: SLUG, ...SAMPLE.store, logoUrl: null, photoUrl: null, purchasable: true, unavailableReason: null };
const products = SAMPLE.products.slice(0, Number(process.env.BOOKS) || 3);
const chapters = SAMPLE.chapters.map((title, i) => ({ number: i + 1, title }));
const included = SAMPLE.included;

// Every optional section on, with the sample copy filled in.
const fullTheme = {
  minimal: {
    sections: {
      spread: {
        enabled: true,
        leftTitle: "The three-list week",
        leftText: "Every Friday, write three lists. Today holds at most three items, and one of them is a deep-work block. This week holds anything with a date. Later holds everything else — and you only read it on Fridays.",
      },
      changes: {
        enabled: true,
        items: [
          { title: "A planned week", text: "Thirty minutes on Friday instead of an anxious Monday." },
          { title: "Two deep blocks a day", text: "Protected time for the work that matters." },
          { title: "Half the email time", text: "Two sittings a day, nothing in between." },
          { title: "An empty head at 6 p.m.", text: "A shutdown routine that actually ends the day." },
        ],
      },
    },
  },
  literary: {
    sections: {
      read: {
        enabled: true,
        leftTitle: "Cooking for one",
        leftText: "I set the table anyway.\nOne plate, one glass, a fork laid straight —\nthe way my grandmother did\nwhen there was no one to see it.",
        rightTitle: "Lamps",
        rightText: "By October the lamps come on at five.\nThe street turns into a row of small, lit rooms,\neach one a story I will never read.",
      },
    },
  },
};

const design = (full) => JSON.stringify({ v: 1, active: style, themes: full && fullTheme[style] ? { [style]: fullTheme[style] } : {} });

const publicStore = (full) => ({ store, products, themeSettings: design(full), featuredChapters: chapters });

const publicProduct = (full) => ({
  store,
  ...products[0],
  highlights: SAMPLE.highlights,
  updatedAt: "2026-09-12T10:00:00Z",
  chapters,
  formats: [...new Set(included.filter((f) => !f.accountOnly).map((f) => f.format))],
  more: products.slice(1),
  themeSettings: design(full),
  pageSettings: null,
  sampleChapters: [chapters[0], chapters[1]],
  included,
  downloadLimit: 5,
  downloadDays: 30,
});

const sample = (n) => ({ number: n, title: chapters[n - 1].title, html: SAMPLE.sampleHtml });

const order = {
  orderId: "o-1",
  status: "PAID",
  productTitle: products[0].title,
  storeSlug: SLUG,
  storeName: store.name,
  pageSettings: null,
  productId: products[0].id,
  coverUrl: products[0].coverUrl,
  amount: products[0].priceCents,
  buyerEmail: "reader@example.com",
  files: included.filter((f) => !f.accountOnly).map((f) => ({ ...f, filename: `${products[0].id}-${f.id}.${f.format.toLowerCase()}`, downloadsLeft: 5 })),
  perks: included.filter((f) => f.accountOnly),
  expiresAt: "2026-11-18T10:00:00Z",
  inLibrary: false,
  downloadLimit: 5,
};

// ---- Covers -------------------------------------------------------------------

async function renderCovers(browser) {
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });
  const out = {};
  const { look, ...specs } = SAMPLE.covers;
  for (const [id, c] of Object.entries(specs)) {
    await page.setContent(look === "minimal" ? `<!doctype html><html><body style="margin:0">
      <div style="width:600px;height:900px;background:${c.bg};color:${c.fg};font-family:system-ui,Helvetica,sans-serif;box-sizing:border-box;padding:64px 56px;display:flex;flex-direction:column;position:relative;overflow:hidden">
        <div style="display:flex;justify-content:space-between;font-size:17px;letter-spacing:.04em"><span>${store.authorName}</span><span>A guide</span></div>
        <div style="margin-top:20px;height:1px;background:${c.fg};opacity:.5"></div>
        <div style="margin-top:110px;font-weight:600;font-size:72px;line-height:.98;letter-spacing:-.045em">${c.title}</div>
        <div style="margin-top:auto;display:flex;align-items:center;gap:16px;font-size:20px"><span style="width:18px;height:18px;border-radius:50%;background:${c.accent}"></span>${c.sub}</div>
      </div></body></html>` : look === "tech" ? `<!doctype html><html><body style="margin:0">
      <div style="width:600px;height:900px;background:${c.bg};color:${c.fg};font-family:ui-monospace,Menlo,monospace;box-sizing:border-box;padding:64px 56px;display:flex;flex-direction:column;position:relative;overflow:hidden;
        background-image:linear-gradient(${c.fg}10 1px,transparent 1px),linear-gradient(90deg,${c.fg}10 1px,transparent 1px);background-size:40px 40px">
        <div style="position:relative;font-size:18px;letter-spacing:.2em;text-transform:uppercase;opacity:.7">${store.authorName}</div>
        <div style="position:relative;margin-top:90px;font-size:22px;color:${c.accent}">$ ./mvnw verify<br><span style="opacity:.7">BUILD SUCCESS</span></div>
        <div style="position:relative;margin-top:auto;font-family:system-ui,sans-serif;font-weight:800;font-size:62px;line-height:1.02;letter-spacing:-.03em">${c.title}</div>
        <div style="position:relative;margin-top:22px;font-size:20px;opacity:.8">${c.sub}</div>
        <div style="position:relative;margin-top:44px;height:6px;width:96px;background:${c.accent}"></div>
      </div></body></html>` : `<!doctype html><html><body style="margin:0">
      <div style="width:600px;height:900px;background:${c.bg};color:${c.fg};font-family:Georgia,serif;box-sizing:border-box;padding:70px 60px;display:flex;flex-direction:column;position:relative;overflow:hidden">
        <div style="position:absolute;right:-120px;top:120px;width:420px;height:420px;border-radius:50%;background:${c.accent};opacity:.85"></div>
        <div style="position:relative;font-size:18px;letter-spacing:.3em;text-transform:uppercase;opacity:.8">${store.authorName}</div>
        <div style="position:relative;margin-top:auto;font-size:76px;line-height:1.02;font-style:italic">${c.title}</div>
        <div style="position:relative;margin-top:24px;font-size:22px;opacity:.85">${c.sub}</div>
        <div style="position:relative;margin-top:48px;height:2px;width:80px;background:${c.fg};opacity:.6"></div>
      </div></body></html>`);
    out[`/covers/${id}.png`] = await page.screenshot({ type: "png" });
  }
  await page.close();
  return out;
}

// ---- Screens ------------------------------------------------------------------

// [id, title, path, options]
const SCREENS = [
  ["store", "Store home — default sections", `/store/${SLUG}`, {}],
  ["store-full", "Store home — every optional section on", `/store/${SLUG}`, { full: true }],
  ["product", "Product (sales) page", `/store/${SLUG}/${products[0].id}`, {}],
  ["product-sample", "Product page — free sample opened", `/store/${SLUG}/${products[0].id}`, { openSample: true }],
  ["purchase", "After purchase — download page", `/store/${SLUG}/success?order=o-1&session_id=cs_test`, {}],
  ["m-store", "Store home — mobile", `/store/${SLUG}`, { mobile: true }],
  ["m-store-full", "Store home — every section, mobile", `/store/${SLUG}`, { mobile: true, full: true }],
  ["m-product", "Product page — mobile", `/store/${SLUG}/${products[0].id}`, { mobile: true }],
  ["m-purchase", "After purchase — mobile", `/store/${SLUG}/success?order=o-1&session_id=cs_test`, { mobile: true }],
];

function mockApi(p, opts, covers) {
  const json = (o) => [200, JSON.stringify(o), "application/json"];
  if (covers[p]) return [200, covers[p], "image/png"];
  if (p === `/api/public/stores/${SLUG}`) return json(publicStore(opts.full));
  const sampleMatch = p.match(/\/preview\/(\d+)$/);
  if (sampleMatch) return json(sample(Number(sampleMatch[1])));
  if (p.startsWith(`/api/public/stores/${SLUG}/products/`)) return json(publicProduct(opts.full));
  if (p.startsWith("/api/public/orders/")) return json(order);
  return null;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const covers = await renderCovers(browser);
const only = process.argv.slice(3);

for (const [id, title, route, opts] of SCREENS) {
  if (only.length && !only.includes(id)) continue;
  if (opts.full && !fullTheme[style]) continue;
  const context = await browser.newContext({
    viewport: opts.mobile ? MOBILE : DESKTOP,
    deviceScaleFactor: 2,
    colorScheme: "light",
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
  });
  await context.addInitScript(() => {
    try {
      localStorage.removeItem("ebook.accessToken");
      localStorage.setItem("scrivetta.consent.v1", JSON.stringify({ analytics: false, at: "2026-01-01T00:00:00Z" }));
    } catch {}
  });
  await context.route(`${API}/**`, async (r) => {
    const req = r.request();
    const headers = { "access-control-allow-origin": BASE, "access-control-allow-credentials": "true", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
    if (req.method() === "OPTIONS") return r.fulfill({ status: 204, headers });
    const hit = mockApi(new URL(req.url()).pathname, opts, covers);
    const [status, body, type] = hit ?? [404, JSON.stringify({ message: "Not found" }), "application/json"];
    r.fulfill({ status, body, headers: { ...headers, "content-type": type } });
  });
  await context.route(/googletagmanager|google-analytics|vercel-insights|_vercel/, (r) => r.abort());

  const page = await context.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  if (opts.openSample) {
    const target = page.locator("#preview, [data-section='preview']").first();
    if (await target.count()) await target.scrollIntoViewIfNeeded();
    const btn = page.getByRole("button", { name: /read|sample|chapter/i }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1200);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    // Scroll through so scroll-triggered sections render, then back to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
  }
  await page.addStyleTag({ content: ".reveal{opacity:1!important;transform:none!important;animation:none!important}" });
  fs.writeFileSync(path.join(OUT, `${id}.png`), await page.screenshot({ fullPage: true }));
  // The same page in screen-sized parts, readable when uploaded one by one.
  const vp = opts.mobile ? MOBILE : DESKTOP;
  const sliceH = opts.mobile ? 1000 : 1100;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  fs.mkdirSync(path.join(OUT, "parts"), { recursive: true });
  for (let i = 0, y = 0; y < total; i++, y += sliceH) {
    const clip = { x: 0, y, width: vp.width, height: Math.min(sliceH, total - y) };
    if (clip.height < 80) break;
    const name = `${id}-${String(i + 1).padStart(2, "0")}.png`;
    fs.writeFileSync(path.join(OUT, "parts", name), await page.screenshot({ fullPage: true, clip }));
  }
  console.log(`✓ ${id} — ${title}`);
  await context.close();
}

await browser.close();
console.log(`\n${OUT}`);
