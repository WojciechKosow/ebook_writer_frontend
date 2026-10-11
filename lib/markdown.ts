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

/** The horizontal alignments an inline image can carry. */
const ALIGNS = new Set(["left", "center", "right"]);

/** Coerce an arbitrary alignment string to a safe value (defaults to centre). */
function normalizeAlign(value: string | null | undefined): "left" | "center" | "right" {
  return value && ALIGNS.has(value) ? (value as "left" | "center" | "right") : "center";
}

/** Escape a string for safe use inside a double-quoted HTML attribute. */
function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// An asset image round-trips to its stable `ebook-image:<id>` reference,
// regardless of the (transient) blob URL currently in its src.
//
// We deliberately emit a small raw-HTML block instead of a plain `![](…)` image.
// Both the on-screen preview and the downloadable PDF are produced by the same
// backend from this Markdown, but they render with different engines: the
// preview runs in a browser, the PDF in openhtmltopdf. A browser centres a
// block image with `margin:auto`, but openhtmltopdf ignores auto margins on
// images and left-aligns them — so a centred image in the preview "escaped" to
// the left in the PDF. Wrapping the image in a block with `text-align` and
// making the image `inline-block` centres/aligns it identically in *both*
// engines, so the PDF matches the preview 1:1. commonmark (backend) and marked
// (this file, on load) both pass the HTML block through untouched, and the
// render pipeline still rewrites the `ebook-image:` src and applies the stored
// display width. `data-align` on the <img> is what lets the alignment round-trip
// back into the editor on the next load.
turndown.addRule("ebookImage", {
  filter: (node) =>
    node.nodeName === "IMG" && !!(node as HTMLElement).getAttribute("data-ebook-image-id"),
  replacement: (_content, node) => {
    const el = node as HTMLElement;
    const id = el.getAttribute("data-ebook-image-id");
    const alt = el.getAttribute("alt") || "";
    const align = normalizeAlign(el.getAttribute("data-align"));
    return (
      `\n\n<div class="ebook-figure" style="text-align:${align}">` +
      `<img src="ebook-image:${id}" alt="${escapeAttr(alt)}" data-align="${align}"` +
      ` style="display:inline-block;max-width:100%"/></div>\n\n`
    );
  },
});

// ---- Design-component blocks (`:::name … :::`) ------------------------------
//
// The book's components — boxes, exercises, checklists, action plans, verbatim
// blocks (verse, addresses, line-based lists) — are written as `:::name` …
// `:::` blocks whose line breaks and indentation carry meaning, and which may
// nest or sit inside a list item. Neither marked nor TipTap knows them: as a
// plain paragraph their lines would be collapsed into one, and on save the
// block would come back as `:::warning text :::`, which the backend can no
// longer close. So each block travels through the editor untouched, as a code
// block in the `directive` language: loaded verbatim, edited as text, and
// written back exactly as it is. The preview and the PDF render it properly.

/** Code-block language that carries a raw `:::` block through the editor. */
export const DIRECTIVE_LANGUAGE = "directive";

const DIRECTIVE_OPEN = /^:::\s*[a-zA-Z][\w-]*.*$/;
const DIRECTIVE_CLOSE = /^:::\s*$/;
const FENCE_OPEN = /^(`{3,}|~{3,})/;
/** Verbatim blocks are literal: their first `:::` closes them (mirrors the backend). */
const VERBATIM_OPEN = /^:::\s*(verbatim|preformatted|lines|verse|poem)\b/i;

function closesFence(line: string, marker: string): boolean {
  const run = line.match(/^(`+|~+)\s*$/);
  return !!run && run[1][0] === marker[0] && run[1].length >= marker.length;
}

/**
 * Wrap every top-level `:::` block in a fenced `directive` code block at the
 * same indentation (so a block inside a list item stays in it). Nesting and
 * code fences are respected exactly as the backend parses them; an unclosed
 * block runs to the end of the chapter, as it does there.
 */
export function protectDirectives(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (fence) {
      if (closesFence(t, fence)) fence = null;
      out.push(line);
      continue;
    }
    const opened = t.match(FENCE_OPEN);
    if (opened) {
      fence = opened[1];
      out.push(line);
      continue;
    }
    if (!DIRECTIVE_OPEN.test(t)) {
      out.push(line);
      continue;
    }
    const indent = line.slice(0, line.indexOf(":"));
    const verbatim = VERBATIM_OPEN.test(t);
    const block = [line];
    let depth = 1;
    let innerFence: string | null = null;
    let j = i + 1;
    for (; j < lines.length && depth > 0; j++) {
      const u = lines[j].trim();
      block.push(lines[j]);
      if (innerFence) {
        if (closesFence(u, innerFence)) innerFence = null;
      } else if (!verbatim && u.match(FENCE_OPEN)) {
        innerFence = u.match(FENCE_OPEN)![1];
      } else if (DIRECTIVE_CLOSE.test(u)) {
        depth--;
      } else if (!verbatim && DIRECTIVE_OPEN.test(u)) {
        depth++;
      }
    }
    i = j - 1;
    const raw = block.map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l.trimStart())).join("\n");
    // A fence longer than any backtick run inside, so the block's own code survives.
    const longest = Math.max(2, ...(raw.match(/`+/g) ?? []).map((r) => r.length));
    const ticks = "`".repeat(longest + 1);
    out.push("", `${indent}${ticks}${DIRECTIVE_LANGUAGE}`, ...raw.split("\n").map((l) => indent + l), `${indent}${ticks}`, "");
  }
  return out.join("\n");
}

// A `directive` code block is written back as the raw block it carries.
turndown.addRule("directiveBlock", {
  filter: (node) =>
    node.nodeName === "PRE" &&
    !!node.firstChild &&
    node.firstChild.nodeName === "CODE" &&
    ((node.firstChild as HTMLElement).getAttribute("class") || "")
      .split(/\s+/)
      .includes(`language-${DIRECTIVE_LANGUAGE}`),
  replacement: (_content, node) => {
    const text = (node.firstChild as HTMLElement).textContent || "";
    return `\n\n${text.replace(/\n+$/, "")}\n\n`;
  },
});

/** Markdown (from the DB) -> HTML (for the editor). */
export function markdownToHtml(markdown: string | null | undefined): string {
  if (!markdown) return "";
  // async:false keeps this synchronous so callers get a string, not a Promise.
  return marked.parse(protectDirectives(markdown), { async: false }) as string;
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
 * displayable `<img>`s the editor can load: swap the src for the resolver's blob
 * URL, tag the element with `data-ebook-image-id` (so it round-trips back to a
 * token on save), carry the stored alignment (`data-align`), and apply any
 * stored display width. Each matched image is rebuilt from scratch so the editor
 * gets a clean, single-`style` tag (the stored Markdown carries a render-only
 * inline style that the editor styles via CSS instead). A token with no resolved
 * asset is left untouched. Also handles legacy plain `![](ebook-image:<id>)`
 * images, which have no `data-align` and default to centre.
 */
export function resolveEbookImages(
  html: string,
  resolve: (id: string) => ResolvedImage | undefined,
): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const m = tag.match(/src=["']ebook-image:([^"']+)["']/i);
    if (!m) return tag;
    const id = m[1];
    const resolved = resolve(id);
    if (!resolved) return tag;
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    const align = normalizeAlign(tag.match(/\bdata-align=["']([^"']*)["']/i)?.[1]);
    const style = resolved.widthPercent ? ` style="width:${resolved.widthPercent}%"` : "";
    return (
      `<img src="${resolved.url}" alt="${escapeAttr(alt)}"` +
      ` data-ebook-image-id="${id}" data-align="${align}"${style}>`
    );
  });
}
