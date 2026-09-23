"use client";

/** What each target length means for the plan (mirrors the backend ContentBudget bands). */
function describe(pages: number): string {
  if (pages <= 24) return "Focused — one clear idea per chapter";
  if (pages <= 40) return "Practical — explain, show an example, give an exercise";
  if (pages <= 60) return "Substantial — fuller chapters, frameworks, workbook material";
  if (pages <= 85) return "Comprehensive — thorough chapters, case studies, more practice";
  return "Definitive — complete coverage with extensive practice and reference";
}

/**
 * The target-length selector. The selected length is a soft content budget: it
 * shapes how the book is planned (chapters, depth, exercises) so it naturally
 * lands around that size. It is never a hard page limit.
 */
export function TargetLengthPicker({
  options,
  value,
  onChange,
  affordablePages,
}: {
  options: number[];
  value: number;
  onChange: (pages: number) => void;
  /** Pages the balance covers, or null while unknown. */
  affordablePages: number | null;
}) {
  const overBudget = affordablePages !== null && value > affordablePages;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground-2">Target length</legend>
      <div role="radiogroup" className="mt-2 grid grid-cols-5 gap-1.5 rounded-xl border border-hairline-2 bg-surface-2 p-1">
        {options.map((pages) => {
          const selected = pages === value;
          const covered = affordablePages === null || pages <= affordablePages;
          return (
            <button
              key={pages}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(pages)}
              className={`rounded-lg px-2 py-2 text-sm font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                selected
                  ? "bg-accent text-white shadow-soft"
                  : covered
                    ? "text-foreground hover:bg-surface"
                    : "text-faint hover:bg-surface"
              }`}
            >
              ~{pages}
              <span className={`block text-[10px] font-medium ${selected ? "text-white/80" : "text-muted"}`}>
                pages
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        {describe(value)}. This is a guide for planning, not a hard limit: the book may end a little
        shorter or longer, and it&apos;s never cut off or padded to hit the number.
      </p>
      {overBudget && (
        <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
          Your credits cover about {affordablePages} pages, so we&apos;ll plan a complete book at that
          size. Add credits for the full ~{value} pages.
        </p>
      )}
    </fieldset>
  );
}
