// Markdown <-> HTML bridge for the rich-text editor.
//
// Chapters are stored as Markdown in the backend, but TipTap edits HTML. We
// convert Markdown -> HTML when loading a chapter into the editor, and
// HTML -> Markdown when saving. Keeping the conversion here (rather than a
// TipTap-version-coupled markdown extension) makes it stable across upgrades.
//
// Images are project assets referenced in the Markdown as `ebook-image:<id>`.
// The R2 bucket is private, so for display we swap that token for an
// authenticated blob URL (and tag the <img> with data-ebook-image-id); on save
// we convert those <img>s back to the `ebook-image:<id>` token — never the blob
// URL — so the stored Markdown keeps referencing the asset, not a transient URL.

import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx", // "# Heading" — matches how the model writes chapters
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});

// An asset image round-trips to its stable token, regardless of the (transient)
// blob URL currently in its src.
turndown.addRule("ebookImage", {
  filter: (node) =>
    node.nodeName === "IMG" && !!(node as HTMLElement).getAttribute("data-ebook-image-id"),
  replacement: (_content, node) => {
    const el = node as HTMLElement;
    const id = el.getAttribute("data-ebook-image-id");
    const alt = el.getAttribute("alt") || "";
    return `\n\n![${alt}](ebook-image:${id})\n\n`;
  },
});

/** Markdown (from the DB) -> HTML (for the editor). */
export function markdownToHtml(markdown: string | null | undefined): string {
  if (!markdown) return "";
  // async:false keeps this synchronous so callers get a string, not a Promise.
  return marked.parse(markdown, { async: false }) as string;
}

/** HTML (from the editor) -> Markdown (to store). */
export function htmlToMarkdown(html: string | null | undefined): string {
  if (!html) return "";
  return turndown.turndown(html).trim();
}

/** How an `ebook-image:<id>` reference should render in the editor. */
export interface ResolvedImage {
  /** Loadable (blob) URL for display. */
  url: string;
  /** Optional display width as a percentage of the column. */
  widthPercent?: number | null;
}

/**
 * Rewrite `<img src="ebook-image:<id>">` tokens produced from the Markdown into
 * displayable `<img>`s: swap the src for the resolver's blob URL, tag the
 * element with `data-ebook-image-id` (so it round-trips back to a token on
 * save), and apply any stored display width. A token with no resolved asset is
 * left untouched.
 */
export function resolveEbookImages(
  html: string,
  resolve: (id: string) => ResolvedImage | undefined,
): string {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const m = tag.match(/src="ebook-image:([^"]+)"/);
    if (!m) return tag;
    const id = m[1];
    const resolved = resolve(id);
    if (!resolved) return tag;
    let out = tag.replace(/src="ebook-image:[^"]+"/, `src="${resolved.url}"`);
    const style = resolved.widthPercent ? ` style="width:${resolved.widthPercent}%"` : "";
    out = out.replace(/\s*\/?>$/, ` data-ebook-image-id="${id}"${style}>`);
    return out;
  });
}
