import type { BookDepth, EbookStatus, EbookStatusResponse } from "./types";
import { inBook, isGenerating } from "./ebook-format";

/** Short stage names for covers and list pills while a book is generating. */
export const STAGE_SHORT: Partial<Record<EbookStatus, string>> = {
  PENDING: "Queued",
  PLANNING: "Planning",
  WRITING: "Writing",
  EDITING: "Editing",
  PLANNING_IMAGES: "Planning images",
  GENERATING_IMAGES: "Illustrating",
  RENDERING: "Typesetting",
};

/** The pipeline as the reader sees it, each step covering one or more statuses. */
export const PIPELINE: { label: string; statuses: EbookStatus[] }[] = [
  { label: "Plan", statuses: ["PENDING", "PLANNING"] },
  { label: "Write", statuses: ["WRITING"] },
  { label: "Edit", statuses: ["EDITING"] },
  { label: "Images", statuses: ["PLANNING_IMAGES", "GENERATING_IMAGES"] },
  { label: "Typeset", statuses: ["RENDERING"] },
];

/** Chapters drafted (written or edited) out of those that are part of the book. */
export function chapterStats(e: EbookStatusResponse): { done: number; edited: number; total: number } {
  const chapters = inBook(e.chapters ?? []);
  return {
    total: chapters.length,
    done: chapters.filter((c) => c.status === "WRITTEN" || c.status === "EDITED").length,
    edited: chapters.filter((c) => c.status === "EDITED").length,
  };
}

/** Pages to show for a book: the real count once rendered, else the target. */
/** A typical length per depth, only for decorating a book that has no estimate yet. */
const TYPICAL_PAGES: Record<BookDepth, number> = { QUICK: 18, STANDARD: 34, COMPREHENSIVE: 60 };

/**
 * The length to show for a book: the real page count once finished, otherwise
 * the plan, otherwise the middle of the estimate (approximate — never a target).
 */
export function displayPages(
  e: Pick<EbookStatusResponse, "actualPageCount" | "plannedPages" | "estimatedPagesLow" | "estimatedPagesHigh" | "depth">,
): { pages: number; exact: boolean } {
  if (e.actualPageCount > 0) return { pages: e.actualPageCount, exact: true };
  if (e.plannedPages) return { pages: e.plannedPages, exact: false };
  if (e.estimatedPagesLow && e.estimatedPagesHigh) {
    return { pages: Math.round((e.estimatedPagesLow + e.estimatedPagesHigh) / 2), exact: false };
  }
  return { pages: TYPICAL_PAGES[e.depth ?? "STANDARD"], exact: false };
}

export function bookTitle(e: EbookStatusResponse): string {
  if (e.title) return e.title;
  if (e.status === "DRAFT") return "Untitled draft";
  return isGenerating(e.status) ? "Choosing a title…" : "Untitled ebook";
}

export function toDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Newest first by the given timestamp (missing dates sort last). */
export function byNewest(key: "createdAt" | "updatedAt") {
  return (a: EbookStatusResponse, b: EbookStatusResponse) =>
    (b[key] ?? b.createdAt ?? "").localeCompare(a[key] ?? a.createdAt ?? "");
}

const DAY = 864e5;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function shortDate(d: Date, now = new Date()): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/** "today", "yesterday", "3 days ago", then a short date. */
export function relativeDay(d: Date, now = new Date()): string {
  const days = Math.round((startOfDay(now) - startOfDay(d)) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(d, now);
}

/** Shelf group for a creation date: this week, earlier this month, then by month. */
export function dateGroup(d: Date | null, now = new Date()): string {
  if (!d) return "Earlier";
  const days = (startOfDay(now) - startOfDay(d)) / DAY;
  if (days < 7) return "This week";
  if (days < 30) return "Earlier this month";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Deterministic, well-spread number from a string (for picking cover styles). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
