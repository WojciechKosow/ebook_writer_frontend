// Markdown <-> HTML bridge for the rich-text editor.
//
// Chapters are stored as Markdown in the backend, but TipTap edits HTML. We
// convert Markdown -> HTML when loading a chapter into the editor, and
// HTML -> Markdown when saving. Keeping the conversion here (rather than a
// TipTap-version-coupled markdown extension) makes it stable across upgrades.

import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx", // "# Heading" — matches how the model writes chapters
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
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
