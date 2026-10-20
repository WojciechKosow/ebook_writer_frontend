import type { PublicStoreProduct, StoreProfile } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";

/**
 * Store designs: the author picks one of a few styles for their public store
 * page and edits its copy, colors and sections. The whole design is one JSON
 * document saved on the store (`themeSettings`); the backend only checks it.
 *
 * Only what the author changed is stored. Everything else falls back to
 * defaults computed from the store itself (name, ebooks, chapters), so a
 * design keeps up with new ebooks and profile edits.
 */

export type StyleId = "literary" | "code" | "minimal" | "modern" | "bold";

export const STYLE_IDS: StyleId[] = ["literary", "code", "minimal", "modern", "bold"];

/** Stores that never picked a style (or picked the retired "classic") get this one. */
export const DEFAULT_STYLE: StyleId = "literary";

/** One row of a repeatable list ("items" fields): sub-field key → text. */
export type Item = Record<string, string>;
export type FieldValue = string | string[] | Item[];

/** The author's edits to one section. `enabled: false` hides it. */
export type SectionEdits = { enabled?: boolean } & Record<string, FieldValue | boolean | undefined>;

export interface StyleSettings {
  accent?: string;
  decor?: string;
  /** The style's variant, e.g. Code's programming language. */
  variant?: string;
  sections?: Record<string, SectionEdits>;
  customCss?: string;
}

export interface DesignDoc {
  v: 1;
  active: StyleId;
  /** Edits per style, kept when switching so nothing is lost. */
  themes: Partial<Record<StyleId, StyleSettings>>;
}

export const EMPTY_DESIGN: DesignDoc = { v: 1, active: DEFAULT_STYLE, themes: {} };

export function parseDesign(json: string | null | undefined): DesignDoc {
  if (!json) return EMPTY_DESIGN;
  try {
    const d = JSON.parse(json);
    if (d && typeof d === "object") {
      const themes = d.themes && typeof d.themes === "object" ? d.themes : {};
      return { v: 1, active: STYLE_IDS.includes(d.active) ? d.active : DEFAULT_STYLE, themes };
    }
  } catch {
    // fall through
  }
  return EMPTY_DESIGN;
}

// ---- What defaults are computed from ---------------------------------------

export interface DesignContext {
  store: StoreProfile;
  products: PublicStoreProduct[];
  chapters: { number: number; title: string }[];
}

export interface Ctx extends DesignContext {
  /** The author, or the store when no author name is set. */
  who: string;
  first: string;
  featured: PublicStoreProduct | null;
  price: (p: PublicStoreProduct | null) => string;
  totalPages: number;
  /** The style variant the author picked (see StyleSchema.variant); defaults can follow it. */
  variant?: string;
}

export function makeCtx(c: DesignContext): Ctx {
  const who = c.store.authorName || c.store.name;
  return {
    ...c,
    who,
    first: who.trim().split(/\s+/)[0] || who,
    featured: c.products[0] ?? null,
    price: (p) => (p ? formatPrice(p.priceCents) : ""),
    totalPages: c.products.reduce((n, p) => n + Math.max(0, p.pageCount), 0),
  };
}

// ---- Editable fields ---------------------------------------------------------

/** An editable field; `C` is what its default is computed from (the store, or a product page). */
export type Field<C = Ctx> =
  | { key: string; label: string; type: "text" | "textarea" | "code"; hint?: string; def: (c: C) => string }
  | { key: string; label: string; type: "list"; hint?: string; def: (c: C) => string[] }
  | {
      key: string;
      label: string;
      type: "items";
      hint?: string;
      /** Sub-fields of one row; the first is used as the row's title in the editor. */
      fields: { key: string; label: string; multiline?: boolean }[];
      max?: number;
      def: (c: C) => Item[];
    };

export interface SectionSchema<C = Ctx> {
  id: string;
  label: string;
  /** Can the author hide this section? (Hero and ebooks can't be hidden.) */
  optional?: boolean;
  /** Hidden until the author turns it on — for sections that need their own words (a page spread, a quote). */
  offByDefault?: boolean;
  fields: Field<C>[];
}

export interface StyleSchema {
  id: StyleId;
  name: string;
  tagline: string;
  /** Mini swatch for the style picker. */
  swatch: { bg: string; fg: string; accent: string; font: string; sample: string };
  accents: string[];
  decor: { options: { id: string; label: string }[]; def: string } | null;
  /** A choice that changes the style's sample content (Code's programming language). */
  variant?: { label: string; hint: string; options: { id: string; label: string }[]; def: string };
  sections: SectionSchema[];
}

// ---- Resolving edits + defaults -------------------------------------------

export interface ResolvedSection {
  enabled: boolean;
  values: Record<string, FieldValue>;
}

export interface ResolvedStyle {
  id: StyleId;
  accent: string;
  decor: string;
  variant: string;
  customCss: string;
  sections: Record<string, ResolvedSection>;
}

/** Each section's values (the author's edits, else the defaults) and whether it is shown. */
export function resolveSections<C>(
  schemas: SectionSchema<C>[],
  edits: Record<string, SectionEdits> | undefined,
  ctx: C,
): Record<string, ResolvedSection> {
  const sections: Record<string, ResolvedSection> = {};
  for (const sec of schemas) {
    const e = edits?.[sec.id] ?? {};
    const values: Record<string, FieldValue> = {};
    for (const f of sec.fields) {
      const v = e[f.key];
      values[f.key] = isValueFor(f, v) ? (v as FieldValue) : f.def(ctx);
    }
    const enabled = typeof e.enabled === "boolean" ? e.enabled : !sec.offByDefault;
    sections[sec.id] = { enabled: !sec.optional || enabled, values };
  }
  return sections;
}

export function resolveStyle(schema: StyleSchema, settings: StyleSettings | undefined, ctx: Ctx): ResolvedStyle {
  const s = settings ?? {};
  const variant = schema.variant?.options.some((o) => o.id === s.variant) ? s.variant! : schema.variant?.def ?? "";
  const sections = resolveSections(schema.sections, s.sections, { ...ctx, variant });
  return {
    id: schema.id,
    accent: isColor(s.accent) ? s.accent! : schema.accents[0],
    decor: schema.decor && schema.decor.options.some((o) => o.id === s.decor) ? s.decor! : schema.decor?.def ?? "",
    variant,
    customCss: safeCss(s.customCss) ?? "",
    sections,
  };
}

function isValueFor<C>(f: Field<C>, v: unknown): boolean {
  if (f.type === "list") return Array.isArray(v) && v.every((x) => typeof x === "string");
  if (f.type === "items") return Array.isArray(v) && v.every((x) => x && typeof x === "object" && !Array.isArray(x));
  return typeof v === "string";
}

export function isColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

// Section value accessors — themes read values through these.
export const txt = (s: ResolvedSection, k: string): string => (typeof s.values[k] === "string" ? (s.values[k] as string) : "");
export const lst = (s: ResolvedSection, k: string): string[] =>
  Array.isArray(s.values[k]) ? (s.values[k] as unknown[]).filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
export const itm = (s: ResolvedSection, k: string): Item[] =>
  Array.isArray(s.values[k]) ? (s.values[k] as unknown[]).filter((x): x is Item => !!x && typeof x === "object") : [];

// ---- Custom CSS ----------------------------------------------------------------

/** Mirrors the backend's StoreThemeValidator: no fetches, no way out of <style>. */
const FORBIDDEN_CSS = /@import|url\s*\(|image-set|image\s*\(|expression\s*\(|javascript:|behavior\s*:|-moz-binding|<|\\/i;
export const MAX_CSS_LENGTH = 20_000;

export function cssProblem(css: string): string | null {
  if (css.length > MAX_CSS_LENGTH) return `Custom CSS is too long (max ${MAX_CSS_LENGTH.toLocaleString("en-US")} characters).`;
  if (FORBIDDEN_CSS.test(css)) return 'Custom CSS can\'t load files or other pages (url(), @import), use "<" or backslashes.';
  return null;
}

export function safeCss(css: string | undefined): string | null {
  return css && !cssProblem(css) ? css : null;
}

// ---- Live preview (design editor → /store-preview frame) ----------------------

export interface PreviewMessage {
  type: "sd-preview";
  doc: DesignDoc;
  data: DesignContext;
  styleId: StyleId;
  /** Scroll this section (data-section) into view. */
  focus?: string | null;
  /** Click-to-edit: sections are outlined on hover and a click reports them back. */
  pick?: { labels: Record<string, string>; selected: string | null } | null;
  /** Set by the product page editor: show this product page (in the store's style) instead of the store. */
  page?: import("./product-page").ProductPreview | null;
}

/** Sent by the preview frame when the author clicks a section. */
export interface PreviewPick {
  type: "sd-preview-pick";
  section: string;
}
