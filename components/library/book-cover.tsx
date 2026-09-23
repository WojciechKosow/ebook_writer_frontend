import type { EbookStatusResponse } from "@/lib/types";
import { isGenerating } from "@/lib/ebook-format";
import { STAGE_SHORT, displayPages, hashString } from "@/lib/library";

/** Cover palettes: [from, to, ink] — the same family as the new-ebook preview. */
const PALETTES: [string, string, string][] = [
  ["#3b2f8f", "#1c1640", "#f6f2ff"],
  ["#1f4d3f", "#0f2620", "#f1f6ee"],
  ["#7a2b2b", "#3a1414", "#fbf1ea"],
  ["#1d3557", "#0d1b2e", "#eef3fb"],
  ["#a07a35", "#5c4418", "#fbf4e4"],
  ["#4a4458", "#1f1c28", "#efedf5"],
];

type CoverBook = Pick<
  EbookStatusResponse,
  "id" | "status" | "title" | "progress" | "targetPages" | "actualPageCount"
>;

/**
 * A typographic cover for a library book. The palette and layout are picked
 * from the book id, so a book keeps its look; drafts get an unfinished paper
 * cover, and generating/failed books get a status overlay.
 */
export function BookCover({
  book,
  thumb = false,
  className = "",
}: {
  book: CoverBook;
  /** Small list thumbnail: colour only, no text. */
  thumb?: boolean;
  className?: string;
}) {
  const { pages, exact } = displayPages(book as EbookStatusResponse);

  if (book.status === "DRAFT") {
    return (
      <div className={`lib-cover draft ${thumb ? "thumb" : ""} ${className}`} aria-hidden>
        <div className="k">Draft</div>
        <div className="t">{book.title || "Untitled draft"}</div>
        <div className="f">~{pages} pp planned</div>
      </div>
    );
  }

  const h = hashString(book.id);
  const [c1, c2, ci] = PALETTES[h % PALETTES.length];
  const style = (h >>> 3) % 3;
  const title = book.title || "Choosing a title…";
  const titleClass = book.title ? "t" : "t pending";
  const pp = exact ? `${pages} pp` : `~${pages} pp`;
  const initial = (book.title || "·").replace(/^(the|your|a|an)\s+/i, "").trim().charAt(0);

  const generating = isGenerating(book.status);
  const failed = book.status === "FAILED";

  return (
    <div
      className={`lib-cover s${style} ${generating ? "gen" : ""} ${failed ? "failed" : ""} ${thumb ? "thumb" : ""} ${className}`}
      style={{ "--c1": c1, "--c2": c2, "--ci": ci } as React.CSSProperties}
      aria-hidden
    >
      {style === 0 && (
        <>
          <div className="k">{pages <= 30 ? "A practical guide" : "The complete guide"}</div>
          <span className="r block" />
          <div className={titleClass}>{title}</div>
          <div className="f">
            <span>Scrivetta</span>
            <span>{pp}</span>
          </div>
        </>
      )}
      {style === 1 && (
        <>
          <span className="band">{initial}</span>
          <div className="body">
            <div className={titleClass}>{title}</div>
            <div className="f">{exact ? `${pages} pages` : `~${pages} pages`}</div>
          </div>
        </>
      )}
      {style === 2 && (
        <>
          <span className="in" />
          <div className="wc">
            <div className={titleClass}>{title}</div>
            <div className="f">Scrivetta · {pp}</div>
          </div>
        </>
      )}

      {generating && (
        <div className="state">
          <span>
            {STAGE_SHORT[book.status]} · {Math.round(book.progress)}%
          </span>
          <div className="bar">
            <i style={{ width: `${Math.max(0, Math.min(100, book.progress))}%` }} />
          </div>
        </div>
      )}
      {failed && (
        <div className="state">
          <span>Generation stopped</span>
          <small>Credits refunded</small>
        </div>
      )}
    </div>
  );
}
