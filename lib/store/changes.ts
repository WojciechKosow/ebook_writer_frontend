import type { PendingChange, StoreDashboard } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { parseDesign } from "@/lib/store-design/core";
import { STYLES } from "@/lib/store-design/schemas";

/**
 * The store's unpublished changes, in words. Every edit in Your store and the
 * editors autosaves as a draft; "Publish changes" applies them all. These lines
 * are what the publish review lists, and their count is the number on the
 * button — the same everywhere.
 */
export interface ChangeLine {
  /** What it's about: a product's title, "Brand", "Store design"… */
  subject: string;
  /** What changes, e.g. "$9.99 → $8.99". */
  text: string;
}

const PROFILE_LABELS: Record<string, string> = {
  name: "Store name",
  headline: "Headline",
  authorName: "Your name",
  description: "About you",
  contactEmail: "Contact email",
  instagramUrl: "Instagram link",
  tiktokUrl: "TikTok link",
  websiteUrl: "Website link",
};

/** Short values are shown in full; long texts just say they changed. */
function fromTo(before: string | null, after: string | null): string {
  if ((before?.length ?? 0) > 40 || (after?.length ?? 0) > 40) return "edited";
  if (!after) return `removed (was “${before}”)`;
  if (!before) return `added: “${after}”`;
  return `“${before}” → “${after}”`;
}

function themeText(before: string | null, after: string | null): string {
  const a = parseDesign(before);
  const b = parseDesign(after);
  const parts: string[] = [];
  if (a.active !== b.active) parts.push(`${STYLES[a.active].name} → ${STYLES[b.active].name} theme`);
  const accA = a.themes[b.active]?.accent ?? STYLES[b.active].accents[0];
  const accB = b.themes[b.active]?.accent ?? STYLES[b.active].accents[0];
  if (a.active === b.active && accA !== accB) parts.push("accent color");
  if (JSON.stringify(a.themes[b.active]?.sections ?? {}) !== JSON.stringify(b.themes[b.active]?.sections ?? {})) parts.push("section texts");
  if ((a.themes[b.active]?.customCss ?? "") !== (b.themes[b.active]?.customCss ?? "")) parts.push("custom CSS");
  return parts.length ? parts.join(", ") : "edited";
}

export function describeChanges(d: StoreDashboard): ChangeLine[] {
  const out: ChangeLine[] = [];
  const title = (id: string | null) => d.products.find((p) => p.id === id)?.title ?? "A product";
  const byProduct = new Map<string, PendingChange[]>();

  for (const c of d.changes) {
    if (c.kind === "profile") {
      out.push({ subject: "Brand & about you", text: `${PROFILE_LABELS[c.field] ?? c.field}: ${fromTo(c.before, c.after)}` });
    } else if (c.kind === "theme") {
      out.push({ subject: "Store design", text: themeText(c.before, c.after) });
    } else if (c.kind === "order") {
      const before = c.before?.split(",")[0] ?? null;
      const after = c.after?.split(",")[0] ?? null;
      out.push({
        subject: "Products",
        text: before !== after ? `featured: ${title(before)} → ${title(after)}` : "new order on your store",
      });
    } else if (c.productId) {
      const list = byProduct.get(c.productId) ?? [];
      list.push(c);
      byProduct.set(c.productId, list);
    }
  }

  for (const [id, list] of byProduct) {
    const subject = title(id);
    let page = false;
    for (const c of list) {
      if (c.kind === "product" && c.field === "priceCents") {
        out.push({ subject, text: `price ${formatPrice(Number(c.before))} → ${formatPrice(Number(c.after))}` });
      } else if (c.kind === "product" && c.field === "active") {
        out.push({ subject, text: c.after === "true" ? "goes on sale" : "hidden from your store" });
      } else if (c.kind === "product" && c.field === "title") {
        out.push({ subject, text: `renamed from “${c.before}”` });
      } else if (c.kind === "product") {
        page = true;
      } else if (c.kind === "file") {
        const f = d.products.find((p) => p.id === id)?.files.find((x) => x.id === c.fileId);
        const name = f?.label || f?.filename || "an extra";
        if (c.field === "accountOnly") {
          out.push({ subject, text: c.after === "true" ? `${name}: now an account perk` : `${name}: every buyer gets it` });
        } else {
          out.push({ subject, text: `${name}: ${c.field === "label" ? "name for buyers" : "what it's for"} ${fromTo(c.before, c.after)}` });
        }
      }
    }
    if (page) out.push({ subject, text: "product page edited" });
  }
  return out;
}

/** The draft status line shown in every editor's top bar and on Your store. */
export function draftStatus(d: StoreDashboard, saving: boolean): { tone: "busy" | "draft" | "live" | "off"; label: string } {
  const n = describeChanges(d).length;
  if (saving) return { tone: "busy", label: "Saving draft…" };
  if (!d.published) return { tone: "off", label: n ? `Draft saved · ${n} change${n === 1 ? "" : "s"} · store not public yet` : "Not public yet" };
  if (n) return { tone: "draft", label: `Draft saved · ${n} change${n === 1 ? "" : "s"} not live yet` };
  return { tone: "live", label: "Live · up to date" };
}

/**
 * Why the store can't open yet (first publish), or null. Edits to a live
 * store can always be published.
 */
export function publishBlocker(d: StoreDashboard): string | null {
  if (d.published) return null;
  if (!d.pro) return "Opening a store needs Scrivetta PRO.";
  if (d.stripe.state !== "READY") return "Connect Stripe first, so buyers can pay you.";
  if (!d.products.some((p) => p.active && p.deliverable)) return "Add a product with something to download first.";
  return null;
}

/** A product's state, in one word, for its chip. */
export type ProductState = "live" | "new" | "hidden" | "needs-file" | "hiding";

export function productState(p: StoreDashboard["products"][number]): ProductState {
  if (!p.deliverable) return "needs-file";
  if (p.active && p.liveActive) return "live";
  if (p.active) return "new";
  if (p.liveActive) return "hiding";
  return "hidden";
}

/** "store/<slug>" as people type it, and the full address to copy. */
export function storeAddress(slug: string) {
  const path = `/store/${slug}`;
  return { path, shown: `scrivetta.com${path}` };
}
