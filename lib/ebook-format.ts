import type { ChapterStatus, EbookStatus } from "./types";

export const STATUS_LABEL: Record<EbookStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Queued",
  PLANNING: "Planning",
  WRITING: "Writing",
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

/**
 * Credits needed to start a book with this target: the standard minimum, but
 * never more than the target itself (a short book needs only enough for itself).
 * Mirrors the backend start gate.
 */
export function creditsToStart(minCredits: number | null, targetPages: number | null): number | null {
  if (minCredits === null) return null;
  if (!targetPages || targetPages <= 0) return minCredits;
  return Math.max(1, Math.min(minCredits, targetPages));
}
