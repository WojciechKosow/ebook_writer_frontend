// Screenshots of the pages an author's store produces, in one store style
// (theme), so each style can be redesigned on its own:
// design/snapshot/out/themes/<style>/*.png.
//
//   npx next build && npx next start -p 3100
//   NODE_PATH=$(npm root -g) node design/snapshot/themes.mjs literary   # BASE=http://localhost:3100
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

// ---- Sample store -------------------------------------------------------------

const SLUG = "marta-lis";

const store = {
  slug: SLUG,
  name: "Small Hours Press",
  headline: "Essays and poems for the *quiet part* of the day.",
  description:
    "I write short essays and poems about ordinary evenings — kitchens, trains, the light at 6 p.m. Each book is small enough to finish in one sitting and typeset like a printed one.\n\nI've been writing for literary magazines for ten years; these are the pieces readers kept asking for.",
  authorName: "Marta Lis",
  contactEmail: "marta@smallhours.press",
  instagramUrl: "https://instagram.com/smallhours.press",
  tiktokUrl: null,
  websiteUrl: "https://smallhours.press",
  logoUrl: null,
  photoUrl: null,
  purchasable: true,
  unavailableReason: null,
};

const products = [
  {
    id: "p-evening",
    title: "The Evening Hours",
    subtitle: "Twelve essays on slowing down",
    description:
      "Twelve short essays about the hour after work — cooking for one, the last train home, a window left open in October. Read one a night.",
    priceCents: 1400,
    currency: "usd",
    pageCount: 86,
    language: "en",
    coverUrl: "/covers/evening.png",
  },
  {
    id: "p-salt",
    title: "Salt & Paper",
    subtitle: "Poems",
    description: "Forty poems about the sea, letters, and the people we write to.",
    priceCents: 900,
    currency: "usd",
    pageCount: 54,
    language: "en",
    coverUrl: "/covers/salt.png",
  },
  {
    id: "p-letters",
    title: "Letters to a Slow Reader",
    subtitle: "On reading less, and better",
    description: "A short book of letters on attention, rereading and keeping a notebook.",
    priceCents: 1200,
    currency: "usd",
    pageCount: 68,
    language: "en",
    coverUrl: "/covers/letters.png",
  },
];

const chapters = [
  "The hour after work",
  "Cooking for one",
  "The last train home",
  "A window left open in October",
  "Notes from a balcony",
  "What the radio said",
  "Lamps",
  "Walking the long way",
  "Dishes, slowly",
  "The neighbour's piano",
  "Sunday, 6 p.m.",
  "Going to bed early",
].map((title, i) => ({ number: i + 1, title }));

const file = (over) => ({
  id: "ebook-pdf", filename: null, format: "PDF", sizeBytes: 2_400_000, version: 1, updatedAt: null,
  label: null, note: null, accountOnly: false, downloadsLeft: null, updated: false, ...over,
});

const included = [
  file({}),
  file({ id: "f-epub", format: "EPUB", sizeBytes: 900_000, label: "For e-readers", note: "EPUB — for Kindle, Kobo or Apple Books" }),
  file({ id: "f-audio", format: "ZIP", sizeBytes: 48_000_000, label: "Read by the author", note: "Three essays as audio (MP3)", accountOnly: true }),
];

// Every optional section on, with the sample copy filled in.
const fullTheme = {
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
  highlights: [
    "Read one essay a night, in ten minutes",
    "Notice the small things that make an evening yours",
    "Typeset like a printed book, on any screen",
  ],
  updatedAt: "2026-09-12T10:00:00Z",
  chapters,
  formats: ["PDF", "EPUB"],
  more: products.slice(1),
  themeSettings: design(full),
  pageSettings: null,
  sampleChapters: [chapters[0], chapters[1]],
  included,
  downloadLimit: 5,
  downloadDays: 30,
});

const sample = (n) => ({
  number: n,
  title: chapters[n - 1].title,
  html:
    "<p>There is an hour, after the door closes and before anyone asks for dinner, that belongs to no one. I used to fill it — with email, with the radio, with the small chores that wait by the sink. Lately I have been leaving it empty.</p>" +
    "<p>It is not a long hour. Some days it is barely ten minutes. But it has a particular light, and a particular sound: the fridge, a neighbour's door, the bus going round the corner. If you sit still long enough, the day finishes arriving.</p>" +
    "<p>This book is about that hour, and the others like it.</p>",
});

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
  files: included.filter((f) => !f.accountOnly).map((f) => ({ ...f, filename: f.format === "PDF" ? "the-evening-hours.pdf" : "the-evening-hours.epub", downloadsLeft: 5 })),
  perks: included.filter((f) => f.accountOnly),
  expiresAt: "2026-11-18T10:00:00Z",
  inLibrary: false,
  downloadLimit: 5,
};

// ---- Covers -------------------------------------------------------------------

const COVERS = {
  evening: { bg: "#2E3A4F", fg: "#F1E6CF", accent: "#D9A55B", title: "The Evening<br>Hours", sub: "Twelve essays on slowing down" },
  salt: { bg: "#E9E1D2", fg: "#2A2722", accent: "#7A2E2E", title: "Salt &amp;<br>Paper", sub: "Poems" },
  letters: { bg: "#5B3A29", fg: "#F4EBDD", accent: "#E7C38C", title: "Letters to a<br>Slow Reader", sub: "On reading less, and better" },
};

async function renderCovers(browser) {
  const page = await browser.newPage({ viewport: { width: 600, height: 900 } });
  const out = {};
  for (const [id, c] of Object.entries(COVERS)) {
    await page.setContent(`<!doctype html><html><body style="margin:0">
      <div style="width:600px;height:900px;background:${c.bg};color:${c.fg};font-family:Georgia,serif;box-sizing:border-box;padding:70px 60px;display:flex;flex-direction:column;position:relative;overflow:hidden">
        <div style="position:absolute;right:-120px;top:120px;width:420px;height:420px;border-radius:50%;background:${c.accent};opacity:.85"></div>
        <div style="position:relative;font-size:18px;letter-spacing:.3em;text-transform:uppercase;opacity:.8">Marta Lis</div>
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
