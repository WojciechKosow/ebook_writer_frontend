import type { BookDepth, ChapterStatus, EbookStatus, ScopeBasis } from "./types";

export const STATUS_LABEL: Record<EbookStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Queued",
  PLANNING: "Planning",
  WRITING: "Writing",
  AWAITING_APPROVAL: "Needs your OK",
  EDITING: "Editing",
  PLANNING_IMAGES: "Planning images",
  GENERATING_IMAGES: "Generating images",
  RENDERING: "Rendering",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

/** Tailwind classes for a status pill. */
export const STATUS_CLASSES: Record<EbookStatus, string> = {
  DRAFT: "bg-surface-3 text-muted",
  PENDING: "bg-surface-3 text-muted",
  PLANNING: "bg-accent-soft text-accent-ink",
  WRITING: "bg-accent-soft text-accent-ink",
  AWAITING_APPROVAL: "bg-warn-soft text-amber-800 dark:text-amber-300",
  EDITING: "bg-accent-soft text-accent-ink",
  PLANNING_IMAGES: "bg-accent-soft text-accent-ink",
  GENERATING_IMAGES: "bg-accent-soft text-accent-ink",
  RENDERING: "bg-accent-soft text-accent-ink",
  COMPLETED: "bg-good-soft text-good",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export const STAGE_MESSAGE: Record<EbookStatus, string> = {
  DRAFT: "Draft — add assets, then generate.",
  PENDING: "Queued — starting shortly.",
  PLANNING: "Planning the outline and chapters…",
  WRITING: "Writing chapters one by one…",
  AWAITING_APPROVAL: "Paused — the book is turning out longer than estimated. Your decision is needed.",
  EDITING: "Editing for consistency and flow…",
  PLANNING_IMAGES: "Planning where images add value…",
  GENERATING_IMAGES: "Generating illustrations…",
  RENDERING: "Typesetting your PDF…",
  COMPLETED: "Your ebook is ready.",
  FAILED: "Generation failed.",
};

export function isTerminal(status: EbookStatus): boolean {
  return status === "COMPLETED" || status === "FAILED";
}

/** True while the generation pipeline is actively running (worth polling). */
export function isGenerating(status: EbookStatus): boolean {
  return status !== "DRAFT" && !isTerminal(status);
}

/** Paused until the user decides how long the book may be (nothing runs meanwhile). */
export function needsDecision(status: EbookStatus): boolean {
  return status === "AWAITING_APPROVAL";
}

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  PENDING: "Pending",
  WRITTEN: "Written",
  EDITED: "Edited",
  FAILED: "Failed",
  DEFERRED: "Saved for later",
};

/** Chapters that are part of the book (deferred ones were left out to end it naturally). */
export function inBook<T extends { status: ChapterStatus }>(chapters: T[]): T[] {
  return chapters.filter((c) => c.status !== "DEFERRED");
}

export const DEPTHS: BookDepth[] = ["QUICK", "STANDARD", "COMPREHENSIVE"];

/** Depth names and meanings (mirrors the backend BookDepth; used until estimates load). */
export const DEPTH_INFO: Record<BookDepth, { name: string; detail: string }> = {
  QUICK: { name: "Quick", detail: "A short, focused read: the essentials, without extended side topics." },
  STANDARD: {
    name: "Standard",
    detail: "A full, practical treatment: detailed enough that the reader can actually apply it.",
  },
  COMPREHENSIVE: {
    name: "Comprehensive",
    detail: "A complete, in-depth treatment that uses your materials broadly and leaves nothing important out.",
  },
};

/** "~120–160" (or "~24" when the range collapses) — always shown as an estimate. */
export function approxRange(low: number, high: number): string {
  return low >= high ? `~${high}` : `~${low}–${high}`;
}

/** What an estimate is based on, in the user's words. */
export const SCOPE_BASIS_LABEL: Record<ScopeBasis, string> = {
  BRIEF: "Based on your brief — refined once you add materials and Scrivetta plans the book.",
  SOURCE_TEXT: "Based on your brief and the source text you added.",
  KNOWLEDGE: "Based on your analysed materials.",
  BLUEPRINT: "Based on your materials and approved blueprint.",
};
