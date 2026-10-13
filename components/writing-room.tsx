import type { EbookStatusResponse } from "@/lib/types";
import { inBook } from "@/lib/ebook-format";
import { BookCover } from "@/components/library/book-cover";

const NUMBER_WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

// Line widths and the moment each one is "typed" on the page.
const LINES: [string, string][] = [
  ["100%", ".6s"],
  ["96%", "1.65s"],
  ["100%", "2.7s"],
  ["88%", "3.75s"],
  ["100%", "4.8s"],
  ["92%", "5.85s"],
];

/**
 * The writing room: shown while a book is being generated. The chapter in
 * progress is set on a page line by line, and finished pages fly into the
 * book. It is the one workspace screen where the ambient paper takes the
 * stage (the drifting sheets behind it come from the page).
 */
export function WritingRoom({ ebook }: { ebook: EbookStatusResponse }) {
  const chapters = inBook(ebook.chapters ?? []);
  const written = chapters.filter((c) => c.status === "WRITTEN" || c.status === "EDITED").length;
  const current = chapters.find((c) => c.status === "PENDING");
  const number = current?.chapterNumber ?? Math.max(1, written);
  const kicker = `Chapter ${NUMBER_WORDS[number - 1] ?? number}`.toUpperCase();
  const title = current?.title || (chapters.length ? "The next chapter" : "Your outline");
  const planned = ebook.plannedPages;

  return (
    <section
      aria-label="Your book being written"
      className="mt-8 grid grid-cols-1 items-center gap-8 rounded-[28px] border border-hairline bg-surface/70 p-6 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_220px] sm:p-8"
    >
      {/* The page being written */}
      <div
        aria-hidden="true"
        className="mx-auto flex aspect-[6/8] w-full max-w-[360px] flex-col gap-2.5 rounded border border-hairline bg-ip-paper px-8 py-9 ip-shadow"
      >
        <div className="font-mono text-[9px] tracking-[0.16em] text-brass">{kicker}</div>
        <div className="font-display text-[24px] leading-[1.08] text-foreground">{title}</div>
        <div className="mb-2 mt-0.5 h-px w-8 bg-ip-brass-l" />
        {LINES.map(([w, d], i) => (
          <span key={i} className="ip-line" style={{ "--w": w, animationDelay: d } as React.CSSProperties} />
        ))}
        <span className="flex items-center gap-1">
          <span className="ip-line" style={{ "--w": "40%", animationDelay: "6.9s" } as React.CSSProperties} />
          <span className="ip-caret h-3.5 w-0.5 bg-accent" />
        </span>
      </div>

      {/* The book, collecting its pages */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[150px] [perspective:1200px]">
          <div className="[transform:rotateY(-16deg)_rotateX(4deg)]">
            <BookCover book={ebook} />
          </div>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {[0, 1.2, 2.4].map((delay, i) => (
              <span
                key={delay}
                className="ip-flypage left-[38%]"
                style={
                  {
                    top: `${26 + i * 16}%`,
                    animationDelay: `${delay}s`,
                    "--fx": "-180px",
                    "--fy": "-20px",
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        </div>
        <div className="text-center">
          <div className="font-display text-xl text-foreground">
            {chapters.length > 0 ? `${written} of ${chapters.length} chapters` : "Planning the chapters"}
          </div>
          <div className="text-[13px] text-muted">
            {planned ? `~${planned} pages planned · ` : ""}each finished page joins the book
          </div>
        </div>
      </div>
    </section>
  );
}
