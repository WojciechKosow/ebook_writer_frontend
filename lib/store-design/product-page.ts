import type {
  DownloadInfo,
  ProductFile,
  PublicProduct,
  PublicStoreProduct,
  SampleChapter,
  StoreDashboard,
  StoreProduct,
  StoreProfile,
} from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { resolveSections, type FieldValue, type ResolvedSection, type SectionEdits, type SectionSchema } from "./core";

/**
 * A product's two pages, as the author designed them: the sales page (with its
 * free preview) and the page buyers see after paying. Both use the store's
 * style (see page-theme); this document holds only their words and sections,
 * saved on the product as `pageSettings`. Like the store design, only what the
 * author changed is stored — the rest comes from the product itself.
 *
 * The title, description and "what you'll be able to do" are the product's own
 * fields (they also show on the store's home page): the editor saves those to
 * the product, never into this document. `preview.chapters` is the one part the
 * backend acts on — the chapters anyone may read for free (max 3).
 */
export interface ProductPageDoc {
  v: 1;
  sections?: Record<string, SectionEdits>;
  preview?: { chapters?: number[] };
}

export const MAX_SAMPLE_CHAPTERS = 3;

export function parsePageDoc(json: string | null | undefined): ProductPageDoc {
  if (!json) return { v: 1 };
  try {
    const d = JSON.parse(json);
    if (d && typeof d === "object" && !Array.isArray(d)) {
      const chapters = Array.isArray(d.preview?.chapters)
        ? (d.preview.chapters as unknown[]).filter((n): n is number => Number.isInteger(n))
        : [];
      return {
        v: 1,
        sections: d.sections && typeof d.sections === "object" ? d.sections : {},
        preview: { chapters },
      };
    }
  } catch {
    // fall through
  }
  return { v: 1 };
}

// ---- What the pages are built from ----------------------------------------------

export interface ProductPageData {
  store: StoreProfile;
  product: {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    highlights: string[];
    priceCents: number;
    pageCount: number;
    language: string | null;
    updatedAt: string | null;
    coverUrl: string | null;
    formats: string[];
    /** The ebook's chapters (the default table of contents). */
    chapters: { number: number; title: string }[];
    /** What's included: every file a buyer gets, account perks marked (from Files & price). */
    included: ProductFile[];
    /** The guest download rule: each file `downloadLimit` times within `downloadDays` days. */
    downloadLimit: number;
    downloadDays: number;
  };
  more: PublicStoreProduct[];
}

/** The guest download rule, unless the backend says otherwise. */
export const DOWNLOAD_LIMIT = 5;
export const DOWNLOAD_DAYS = 30;

/** The ebook's own PDF, as "What's included" lists it. */
export const EBOOK_PDF_ID = "ebook-pdf";

/** The name buyers see for a file: "The book", the author's name for an extra, else the filename. */
export function fileName(f: ProductFile): string {
  if (f.id === EBOOK_PDF_ID) return "The book";
  return f.label?.trim() || f.filename || `${f.format} file`;
}

/** One line on what a file is for — the author's words, else something true about its format. */
export function fileNote(f: ProductFile, pageCount = 0): string {
  if (f.note?.trim()) return f.note.trim();
  if (f.id === EBOOK_PDF_ID) return pageCount > 0 ? `PDF · ${pageCount} pages` : "PDF";
  return { PDF: "PDF", EPUB: "EPUB — for Kindle, Kobo or Apple Books", ZIP: "ZIP archive" }[f.format];
}

/** The account perks of a product, by name: "the starter schedule and …". */
export function perkNames(included: ProductFile[]): string {
  const names = included.filter((f) => f.accountOnly).map(fileName);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** The ebook's PDF as a file entry (the dashboard lists only uploads). */
function ebookPdf(sizeBytes = 0): ProductFile {
  return {
    id: EBOOK_PDF_ID, filename: null, format: "PDF", sizeBytes, version: 1, updatedAt: null,
    label: null, note: null, accountOnly: false, downloadsLeft: null, updated: false,
  };
}

/** The public product page's data. */
export function pageDataFromPublic(p: PublicProduct): ProductPageData {
  return {
    store: p.store,
    product: {
      id: p.id, title: p.title, subtitle: p.subtitle, description: p.description, highlights: p.highlights,
      priceCents: p.priceCents, pageCount: p.pageCount, language: p.language, updatedAt: p.updatedAt,
      coverUrl: p.coverUrl, formats: p.formats, chapters: p.chapters,
      included: p.included ?? [], downloadLimit: p.downloadLimit ?? DOWNLOAD_LIMIT, downloadDays: p.downloadDays ?? DOWNLOAD_DAYS,
    },
    more: p.more,
  };
}

/** The store as buyers would see it, from the author's dashboard. */
export function profileFromDashboard(d: StoreDashboard): StoreProfile {
  return {
    slug: d.slug, name: d.name, description: d.description, headline: d.headline, authorName: d.authorName,
    contactEmail: d.contactEmail, instagramUrl: d.instagramUrl, tiktokUrl: d.tiktokUrl, websiteUrl: d.websiteUrl,
    logoUrl: d.logoUrl, photoUrl: d.photoUrl, purchasable: true, unavailableReason: null,
  };
}

/** A product's page data in the editor, from the dashboard (unsaved product fields applied by the editor). */
export function pageDataFromDashboard(d: StoreDashboard, p: StoreProduct): ProductPageData {
  const formats = [...(p.ebookId ? ["PDF"] : []), ...p.files.map((f) => f.format)].filter((f, i, a) => a.indexOf(f) === i);
  return {
    store: profileFromDashboard(d),
    product: {
      id: p.id, title: p.title, subtitle: p.subtitle, description: p.description,
      highlights: (p.highlights ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
      priceCents: p.priceCents, pageCount: p.pageCount, language: p.language, updatedAt: null, coverUrl: p.coverUrl,
      formats, chapters: p.chapters.map((c) => ({ number: c.number, title: c.title })),
      included: [...(p.ebookId ? [ebookPdf()] : []), ...p.files],
      downloadLimit: DOWNLOAD_LIMIT, downloadDays: DOWNLOAD_DAYS,
    },
    more: d.products.filter((x) => x.active && x.id !== p.id).map((x) => ({
      id: x.id, title: x.title, subtitle: x.subtitle, description: x.description, priceCents: x.priceCents,
      currency: x.currency, pageCount: x.pageCount, language: x.language, coverUrl: x.coverUrl,
    })),
  };
}

/** The after-purchase page's data on the buyer's download page. */
export function pageDataFromDownload(info: DownloadInfo): ProductPageData {
  const store: StoreProfile = info.store ?? {
    slug: info.storeSlug ?? "", name: info.storeName ?? "", description: null, headline: null,
    authorName: info.authorName, contactEmail: info.contactEmail, instagramUrl: null, tiktokUrl: null, websiteUrl: null,
    logoUrl: info.logoUrl, photoUrl: null, purchasable: false, unavailableReason: null,
  };
  return {
    store,
    product: {
      id: "", title: info.productTitle, subtitle: null, description: null, highlights: [], priceCents: 0, pageCount: 0,
      language: null, updatedAt: null, coverUrl: info.coverUrl, formats: info.files.map((f) => f.format), chapters: [],
      included: [...info.files, ...(info.perks ?? [])], downloadLimit: info.downloadLimit ?? DOWNLOAD_LIMIT, downloadDays: DOWNLOAD_DAYS,
    },
    more: info.more,
  };
}

/** Written in a text where the price goes; always shows the product's current price. */
export const PRICE_TOKEN = "{price}";

/** A text with {price} filled in. */
export function withPrice(text: string, ctx: { price: string }): string {
  return text.split(PRICE_TOKEN).join(ctx.price);
}

export interface ProductCtx extends ProductPageData {
  who: string;
  price: string;
}

export function makeProductCtx(d: ProductPageData): ProductCtx {
  return { ...d, who: d.store.authorName || d.store.name, price: formatPrice(d.product.priceCents) };
}

/** Fields stored on the product itself, not in the page document. */
export const PRODUCT_FIELDS: Record<string, { section: string; key: string }> = {
  title: { section: "hero", key: "title" },
  description: { section: "about", key: "text" },
  highlights: { section: "highlights", key: "items" },
};

// ---- Sections --------------------------------------------------------------------

export const SALES_SECTIONS: SectionSchema<ProductCtx>[] = [
  {
    id: "hero",
    label: "Title & buy box",
    fields: [
      { key: "eyebrow", label: "Small line above the title", type: "text", hint: "Leave empty to hide.", def: (c) =>
        [...(c.product.formats.length ? c.product.formats : ["PDF"]), c.product.pageCount > 0 ? `${c.product.pageCount} pages` : null]
          .filter(Boolean).join(" · ") },
      { key: "title", label: "Title", type: "text", hint: "The product's name everywhere in your store.", def: (c) => c.product.title },
      { key: "subtitle", label: "Subtitle", type: "textarea", hint: "One or two sentences under the title.", def: (c) => c.product.subtitle ?? "" },
      { key: "buyLabel", label: "Buy button", type: "text", hint: "{price} is filled in from Files & price, so the button always shows the real price.",
        def: () => `Buy now — ${PRICE_TOKEN}` },
      { key: "trust", label: "Under the button", type: "list", hint: "Starts from your settings: the download rule and what a free account adds.",
        def: (c) => [
          `Files right after paying, and a link by email. Download each file up to ${c.product.downloadLimit} times within ${c.product.downloadDays} days.`,
          perkNames(c.product.included)
            ? `With a free Scrivetta account: keep it for good, plus ${perkNames(c.product.included)}.`
            : "With a free Scrivetta account it stays in My purchases — download any time.",
          "Secure card checkout by Stripe. No account needed to buy.",
        ] },
    ],
  },
  {
    id: "included",
    label: "What's included",
    optional: true,
    fields: [
      { key: "title", label: "Heading", type: "text", hint: "The list itself comes from Files & price.", def: () => `Everything you get for ${PRICE_TOKEN}` },
      { key: "note", label: "Small print", type: "text", def: (c) =>
        c.product.included.some((f) => f.accountOnly) ? "Items marked “with a free account” come with a free Scrivetta account." : "" },
    ],
  },
  {
    id: "highlights",
    label: "What you'll be able to do",
    optional: true,
    fields: [
      { key: "title", label: "Heading", type: "text", def: () => "What you'll be able to do" },
      { key: "items", label: "Points", type: "list", hint: "One point per line. Also saved to the product.", def: (c) => c.product.highlights },
    ],
  },
  {
    id: "preview",
    label: "Free preview",
    optional: true,
    fields: [
      { key: "title", label: "Heading", type: "text", def: (c) => (c.product.chapters.length ? "Inside the book" : "What's inside") },
      { key: "intro", label: "Intro", type: "textarea", def: (c) =>
        c.product.chapters.length
          ? `${c.product.chapters.length} ${c.product.chapters.length === 1 ? "chapter" : "chapters"}${c.product.pageCount > 0 ? ` across ${c.product.pageCount} pages` : ""}.`
          : "" },
      { key: "contents", label: "Contents list", type: "list", hint: "One item per line — your table of contents, or what's in the bundle. Starts from your chapters.",
        def: (c) => c.product.chapters.map((ch) => ch.title) },
      { key: "sampleTitle", label: "Free sample heading", type: "text", def: () => "Read a free sample" },
    ],
  },
  {
    id: "about",
    label: "About this product",
    optional: true,
    fields: [
      { key: "title", label: "Heading", type: "text", def: (c) => (c.product.chapters.length ? "About this book" : "About this product") },
      { key: "text", label: "Description", type: "textarea", hint: "Also shown on your store's home page.", def: (c) => c.product.description ?? "" },
    ],
  },
  {
    id: "author",
    label: "About you",
    optional: true,
    fields: [
      { key: "title", label: "Small heading", type: "text", def: () => "Written by" },
      { key: "text", label: "Text", type: "textarea", hint: "Starts from your store profile.", def: (c) => c.store.description ?? "" },
    ],
  },
  {
    id: "more",
    label: "More from you",
    optional: true,
    fields: [{ key: "title", label: "Heading", type: "text", def: (c) => `More from ${c.who}` }],
  },
  {
    id: "faq",
    label: "Questions",
    optional: true,
    fields: [
      { key: "items", label: "Questions", type: "items", max: 8, fields: [{ key: "q", label: "Question" }, { key: "a", label: "Answer", multiline: true }],
        def: (c) => [
          { q: "How do I get my files?", a: `They appear on screen right after you pay, and we email you a link too. Download each file up to ${c.product.downloadLimit} times within ${c.product.downloadDays} days. With a free Scrivetta account, it's yours for good.` },
          { q: "Do I need an account?", a: perkNames(c.product.included)
            ? `No — pay securely by card through Stripe. A free Scrivetta account adds ${perkNames(c.product.included)} and keeps everything in My purchases.`
            : "No. Pay securely by card through Stripe — the files appear right away and the link arrives in your inbox." },
          { q: "Something went wrong — who do I contact?", a: c.store.contactEmail ? `Write to ${c.store.contactEmail} — ${c.who} answers personally.` : `Reply to your receipt email to reach ${c.who}.` },
        ] },
    ],
  },
];

export const PURCHASE_SECTIONS: SectionSchema<ProductCtx>[] = [
  {
    id: "thanks",
    label: "Thank-you",
    fields: [
      { key: "eyebrow", label: "Small line", type: "text", def: () => "Your download is ready" },
      { key: "title", label: "Heading", type: "text", def: (c) => c.product.title },
      { key: "message", label: "Your message", type: "textarea", hint: "A personal note to your buyers — what to do first, where to start.",
        def: (c) => `Thank you for buying directly from ${c.who}.` },
    ],
  },
  {
    id: "files",
    label: "Downloads",
    fields: [
      { key: "title", label: "Heading", type: "text", def: () => "Your files" },
      { key: "tip", label: "Tip", type: "textarea", def: () => "On a phone, tap Download and choose “Save to Files” or open it in Books so it's always with you." },
    ],
  },
  {
    id: "account",
    label: "Keep it for good",
    optional: true,
    fields: [
      { key: "text", label: "Text", type: "textarea", def: (c) =>
        `Keep it for good: create a free Scrivetta account with the email you bought with — your purchase appears in My purchases, with unlimited downloads${perkNames(c.product.included) ? `, plus ${perkNames(c.product.included)}` : ""}.` },
    ],
  },
  {
    id: "more",
    label: "More from you",
    optional: true,
    fields: [{ key: "title", label: "Heading", type: "text", def: (c) => `More from ${c.who}` }],
  },
  {
    id: "help",
    label: "Help line",
    fields: [
      { key: "text", label: "Text", type: "text", def: (c) =>
        c.store.contactEmail ? `Problem with your download? Write to ${c.store.contactEmail}.` : `Problem with your download? Reply to your receipt email to reach ${c.who}.` },
    ],
  },
];

export type PageKind = "product" | "purchase";

export const PAGE_SECTIONS: Record<PageKind, SectionSchema<ProductCtx>[]> = {
  product: SALES_SECTIONS,
  purchase: PURCHASE_SECTIONS,
};

/** Section edits live under "<kind>.<section>" so both pages can share section ids. */
export function sectionEdits(doc: ProductPageDoc, kind: PageKind): Record<string, SectionEdits> {
  const out: Record<string, SectionEdits> = {};
  for (const [k, v] of Object.entries(doc.sections ?? {})) {
    if (k.startsWith(`${kind}.`) && v && typeof v === "object") out[k.slice(kind.length + 1)] = v;
  }
  return out;
}

export function resolvePage(doc: ProductPageDoc, kind: PageKind, ctx: ProductCtx): Record<string, ResolvedSection> {
  return resolveSections(PAGE_SECTIONS[kind], sectionEdits(doc, kind), ctx);
}

export function sampleChapters(doc: ProductPageDoc): number[] {
  return doc.preview?.chapters ?? [];
}

// ---- Live preview ----------------------------------------------------------------

/** What the page editor sends the preview frame (inside PreviewMessage.page). */
export interface ProductPreview {
  kind: PageKind;
  data: ProductPageData;
  doc: ProductPageDoc;
  /** Free-preview chapters, fetched by the editor (the frame has no access of its own). */
  samples: SampleChapter[];
  /** What a buyer of this product gets, for the after-purchase page. */
  files: ProductFile[];
  /** Account perks, shown locked as a guest sees them. */
  perks?: ProductFile[];
}

export type { FieldValue };
