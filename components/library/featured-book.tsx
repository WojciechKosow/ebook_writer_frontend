import Link from "next/link";
import type { EbookStatusResponse } from "@/lib/types";
import { STAGE_MESSAGE, inBook } from "@/lib/ebook-format";
import { PIPELINE, chapterStats, relativeDay, toDate } from "@/lib/library";
import { Spinner } from "@/components/ui";
import { BookCover } from "./book-cover";
import { IconCheck, IconDownload, IconEdit } from "./icons";

const shell =
  "mt-8 grid grid-cols-[92px_minmax(0,1fr)] items-center gap-5 rounded-[20px] border border-hairline bg-surface bg-[radial-gradient(90%_140%_at_0%_50%,var(--accent-soft),transparent_55%)] p-5 shadow-soft sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-8 sm:p-7 xl:grid-cols-[150px_minmax(0,1fr)_auto]";
const actions = "col-span-full flex flex-wrap gap-2 xl:col-span-1 xl:min-w-[170px] xl:flex-col";
const btn =
  "inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border px-4 text-[13.5px] font-semibold transition-colors xl:flex-none";
const btnPrimary = `${btn} border-foreground bg-foreground text-background hover:border-accent hover:bg-accent hover:text-white`;
const btnSecondary = `${btn} border-hairline-2 bg-surface text-foreground hover:border-faint`;
const btnGhost = `${btn} border-transparent text-muted hover:text-foreground`;

function TiltedCover({ book }: { book: EbookStatusResponse }) {
  return (
    <div className="group/cover [perspective:900px]">
      <BookCover
        book={book}
        className="transition-transform duration-400 [transform:rotateY(-14deg)] group-hover/cover:[transform:rotateY(-5deg)]"
      />
    </div>
  );
}

/** The book currently being generated: stage, overall progress and chapters. */
export function GeneratingFeature({ book }: { book: EbookStatusResponse }) {
  const { done, total } = chapterStats(book);
  const step = PIPELINE.findIndex((s) => s.statuses.includes(book.status));
  const chapters = inBook(book.chapters ?? []);
  const firstPending = chapters.findIndex((c) => c.status === "PENDING");
  const where =
    book.status === "WRITING" && total > 0
      ? `Chapter ${Math.min(total, done + 1)} of ${total}`
      : book.status === "PENDING" || book.status === "PLANNING"
        ? "Outlining chapters"
        : total > 0
          ? `${done} of ${total} chapters drafted`
          : null;

  return (
    <section className={shell} aria-label="Writing now">
      <TiltedCover book={book} />
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-ink">
          <span className="live-dot h-[7px] w-[7px] rounded-full bg-accent" />
          Writing now
        </p>
        <h2 className="mt-2.5 text-balance font-display text-[23px] leading-[1.06] text-foreground sm:text-[34px]">
          {book.title || "Your new book"}
        </h2>
        <p className="mt-2 max-w-[56ch] text-[13.5px] leading-snug text-muted sm:text-[15px]">
          {book.subtitle || STAGE_MESSAGE[book.status]}
        </p>

        <ol className="mt-4 hidden flex-wrap items-center gap-1.5 text-xs text-faint sm:flex" aria-label="Stages">
          {PIPELINE.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="h-px w-3.5 bg-hairline-2" />}
              <span
                aria-current={i === step ? "step" : undefined}
                className={`flex items-center gap-1.5 ${
                  i < step ? "text-muted" : i === step ? "font-semibold text-foreground" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < step ? "bg-good" : i === step ? "bg-accent ring-[3px] ring-accent-soft" : "bg-hairline-2"
                  }`}
                />
                {s.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-3.5 max-w-[520px]">
          <div className="mb-1.5 flex justify-between gap-3 text-xs text-muted">
            <span className="truncate">
              {where ? `${where} · ` : ""}
              {STAGE_MESSAGE[book.status]}
            </span>
            <b className="font-semibold tabular-nums text-foreground">{Math.round(book.progress)}%</b>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-500"
              style={{ width: `${Math.max(0, Math.min(100, book.progress))}%` }}
            />
          </div>
          {chapters.length > 0 && (
            <div className="mt-2 flex gap-[3px]" aria-hidden>
              {chapters.map((c, i) => (
                <i
                  key={c.chapterNumber}
                  className={`h-[3px] flex-1 rounded-sm ${
                    c.status === "EDITED"
                      ? "bg-accent"
                      : c.status === "WRITTEN"
                        ? "bg-accent-2"
                        : book.status === "WRITING" && i === firstPending
                          ? "chapter-now"
                          : c.status === "FAILED"
                            ? "bg-red-400"
                            : "bg-hairline-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={actions}>
        <Link href={`/ebooks/${book.id}`} className={btnPrimary}>
          Watch it write
        </Link>
      </div>
    </section>
  );
}

/** The most recent finished book, with its main actions. */
export function FinishedFeature({
  book,
  onDownload,
  downloading,
}: {
  book: EbookStatusResponse;
  onDownload: () => void;
  downloading: boolean;
}) {
  const updated = toDate(book.updatedAt ?? book.createdAt);
  return (
    <section className={shell} aria-label="Latest finished">
      <TiltedCover book={book} />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-good">
          <IconCheck className="h-3 w-3" />
          Latest finished
        </p>
        <h2 className="mt-2.5 text-balance font-display text-[23px] leading-[1.06] text-foreground sm:text-[34px]">
          {book.title || "Untitled ebook"}
        </h2>
        {book.subtitle && (
          <p className="mt-2 max-w-[56ch] text-[13.5px] leading-snug text-muted sm:text-[15px]">{book.subtitle}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-foreground-2">
          {book.actualPageCount > 0 && <Chip>{book.actualPageCount} pages</Chip>}
          {book.creditsCharged > 0 && <Chip>{book.creditsCharged} credits used</Chip>}
          {updated && <Chip>Updated {relativeDay(updated)}</Chip>}
        </div>
      </div>
      <div className={actions}>
        <button type="button" onClick={onDownload} disabled={downloading} className={`${btnPrimary} disabled:opacity-70`}>
          {downloading ? <Spinner /> : <IconDownload className="h-3.5 w-3.5" />}
          Download PDF
        </button>
        <Link href={`/ebooks/${book.id}/edit`} className={btnSecondary}>
          <IconEdit className="h-3.5 w-3.5" />
          Edit text
        </Link>
        <Link href={`/ebooks/${book.id}`} className={btnGhost}>
          Open book →
        </Link>
      </div>
    </section>
  );
}

/** A draft that hasn't been generated yet — nudge the author to finish it. */
export function DraftFeature({ book }: { book: EbookStatusResponse }) {
  const created = toDate(book.createdAt);
  return (
    <section className={shell} aria-label="Draft">
      <TiltedCover book={book} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brass">Draft · not generated yet</p>
        <h2 className="mt-2.5 text-balance font-display text-[23px] leading-[1.06] text-foreground sm:text-[34px]">
          Pick up where you left off
        </h2>
        <p className="mt-2 max-w-[56ch] text-[13.5px] leading-snug text-muted sm:text-[15px]">
          Your brief is saved. Add any images you want in the book, then start generating — credits
          are only reserved when you do.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-foreground-2">
          <Chip>~{book.targetPages} pages planned</Chip>
          {created && <Chip>Started {relativeDay(created)}</Chip>}
        </div>
      </div>
      <div className={actions}>
        <Link href={`/ebooks/${book.id}`} className={btnPrimary}>
          Add images &amp; generate
        </Link>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-hairline-2 bg-surface px-2.5 py-0.5">{children}</span>;
}
