"use client";

import { useEffect, useState } from "react";
import { ebookApi } from "@/lib/api";
import type { QualityCategory, QualityFinding, QualityReport, QualitySeverity } from "@/lib/types";
import { Spinner } from "@/components/ui";

const CATEGORY_LABEL: Record<QualityCategory, string> = {
  INCOMPLETE_UNIT: "Incomplete",
  EMPTY_HEADING: "Empty heading",
  ORPHAN_LIST_MARKER: "Broken list",
  DUPLICATE_BLOCK: "Duplicate",
  TEMPLATE_MISMATCH: "Recurring section",
  INTERNAL_LEAK: "Internal text",
  TRUNCATED_READER_TEXT: "Cut-off text",
  VERBATIM_OVERFLOW: "Long line",
  REPETITION: "Repetition",
  LENGTH_BUDGET: "Length",
};

const SEVERITY_CLASSES: Record<QualitySeverity, string> = {
  ERROR: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  WARNING: "bg-warn-soft text-warn",
  INFO: "bg-surface-3 text-muted",
};

/** Where a finding is: "Chapter 3 · Title · p. 41", or "Whole book". */
function location(f: QualityFinding): string {
  const parts: string[] = [];
  if (f.chapter !== null) parts.push(`Chapter ${f.chapter}${f.chapterTitle ? ` · ${f.chapterTitle}` : ""}`);
  else parts.push("Whole book");
  if (f.page !== null) parts.push(`p. ${f.page}`);
  return parts.join(" · ");
}

function FindingRow({ f }: { f: QualityFinding }) {
  return (
    <li className="rounded-lg border border-hairline px-3 py-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${SEVERITY_CLASSES[f.severity]}`}>
          {CATEGORY_LABEL[f.category] ?? f.category}
        </span>
        <span className="text-xs text-muted">{location(f)}</span>
      </div>
      <p className="mt-1.5">{f.message}</p>
      {f.excerpt && (
        <p className="mt-1 line-clamp-2 break-words font-mono text-xs text-muted">“{f.excerpt}”</p>
      )}
    </li>
  );
}

/**
 * The quality check of the book's latest render: what to fix before publishing
 * (incomplete chapters, broken structure, internal text in print, lines too wide
 * for the page, repetition, length against the plan), each with its chapter and
 * page. Re-fetched whenever the book changes (`version`), e.g. after an edit.
 */
export function QualityReportPanel({ token, ebookId, version }: { token: string; ebookId: string; version?: string | null }) {
  // undefined while the first load is in flight; null when the book has no report yet.
  const [report, setReport] = useState<QualityReport | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ebookApi
      .qualityReport(token, ebookId)
      .then((r) => {
        if (!cancelled) {
          setReport(r);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, ebookId, version]);

  if (failed) {
    return (
      <section className="rounded-xl border border-hairline bg-surface-2 p-4 text-sm text-muted">
        The quality check could not be loaded.
      </section>
    );
  }
  if (report === undefined) {
    return (
      <section className="rounded-xl border border-hairline bg-surface-2 p-4">
        <Spinner />
      </section>
    );
  }
  if (!report) return null;

  const important = report.findings.filter((f) => f.severity !== "INFO");
  const notes = report.findings.filter((f) => f.severity === "INFO");

  return (
    <section className="rounded-xl border border-hairline bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-normal text-foreground">Quality check</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            report.readyToPublish ? "bg-good-soft text-good" : SEVERITY_CLASSES.ERROR
          }`}
        >
          {report.readyToPublish
            ? "Ready to publish"
            : `${report.errors} ${report.errors === 1 ? "issue" : "issues"} to fix before publishing`}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {report.pages} pages
        {report.plannedPages ? ` · planned ${report.plannedPages}` : ""}
        {report.warnings > 0 ? ` · ${report.warnings} ${report.warnings === 1 ? "warning" : "warnings"}` : ""}
        {" · "}checked {new Date(report.generatedAt).toLocaleString()}
      </p>

      {important.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {important.map((f, i) => (
            <FindingRow key={i} f={f} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing to fix — no errors or warnings in this render.</p>
      )}

      {(notes.length > 0 || report.repeatedPhrases.length > 0) && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted">
            Notes and most repeated phrases
          </summary>
          {notes.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2">
              {notes.map((f, i) => (
                <FindingRow key={i} f={f} />
              ))}
            </ul>
          )}
          {report.repeatedPhrases.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
              {report.repeatedPhrases.map((p) => (
                <li key={p.phrase}>
                  “{p.phrase}” — {p.occurrences}× in chapters {p.chapters.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </details>
      )}
    </section>
  );
}
