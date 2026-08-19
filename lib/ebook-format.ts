import type { ChapterStatus, EbookStatus } from "./types";

export const STATUS_LABEL: Record<EbookStatus, string> = {
  PENDING: "Queued",
  PLANNING: "Planning",
  WRITING: "Writing",
  EDITING: "Editing",
  RENDERING: "Rendering",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

/** Tailwind classes for a status pill. */
export const STATUS_CLASSES: Record<EbookStatus, string> = {
  PENDING: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  PLANNING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  WRITING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  EDITING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  RENDERING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export const STAGE_MESSAGE: Record<EbookStatus, string> = {
  PENDING: "Queued — starting shortly.",
  PLANNING: "Planning the outline and chapters…",
  WRITING: "Writing chapters one by one…",
  EDITING: "Editing for consistency and flow…",
  RENDERING: "Typesetting your PDF…",
  COMPLETED: "Your ebook is ready.",
  FAILED: "Generation failed.",
};

export function isTerminal(status: EbookStatus): boolean {
  return status === "COMPLETED" || status === "FAILED";
}

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  PENDING: "Pending",
  WRITTEN: "Written",
  EDITED: "Edited",
  FAILED: "Failed",
};
