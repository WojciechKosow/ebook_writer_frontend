"use client";

/** What each target length means for the plan (mirrors the backend ContentBudget bands). */
export function lengthBand(pages: number): { name: string; detail: string } {
  if (pages <= 24) return { name: "Focused", detail: "One clear idea per chapter — a quick, dense read." };
  if (pages <= 40) return { name: "Practical", detail: "Explain, show an example, give an exercise." };
  if (pages <= 60) return { name: "Substantial", detail: "Fuller chapters, frameworks and workbook material." };
  if (pages <= 85) return { name: "Comprehensive", detail: "Thorough chapters, case studies, more practice." };
  return { name: "Definitive", detail: "Complete coverage with extensive practice and reference." };
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
  const max = Math.max(...options);
  const band = lengthBand(value);

  return (
    <div>
      <div role="radiogroup" aria-label="Target length" className="grid grid-cols-5 gap-1.5 sm:gap-2">
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
              className={`relative flex flex-col items-center gap-2 rounded-xl border bg-surface px-0 pb-2.5 pt-3 text-center transition-[border-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:items-start sm:gap-3 sm:px-3 sm:pt-3.5 sm:text-left ${
                selected
                  ? "border-accent ring-4 ring-accent-soft"
                  : "border-hairline-2 hover:border-faint"
              } ${covered ? "" : "border-dashed"}`}
            >
              {!covered && (
                <span className="absolute right-2 top-2 hidden rounded-md bg-warn-soft px-1.5 text-[9.5px] font-semibold text-amber-800 sm:block dark:text-amber-300">
                  not covered
                </span>
              )}
              {/* A stack of pages whose height grows with the length. */}
              <span className="flex h-[26px] items-end sm:h-[34px]">
                <i
                  className={`block w-5 rounded-[2px_3px_3px_2px] border sm:w-[26px] ${
                    selected ? "border-accent" : "border-hairline-2"
                  }`}
                  style={{
                    height: `${Math.round(6 + (pages / max) * 28)}px`,
                    maxHeight: "100%",
                    background: selected
                      ? "repeating-linear-gradient(to bottom, var(--accent-2) 0 1px, var(--accent-soft) 1px 3px)"
                      : "repeating-linear-gradient(to bottom, var(--hairline-2) 0 1px, var(--surface-2) 1px 3px)",
                  }}
                />
              </span>
              <span>
                <b
                  className={`block text-base font-semibold tabular-nums tracking-tight sm:text-lg ${
                    selected ? "text-accent" : covered ? "text-foreground" : "text-faint"
                  }`}
                >
                  {pages}
                </b>
                <small className="block text-[11px] text-muted">pages</small>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[13px] text-foreground-2">
        <span className="font-display text-[19px] italic text-foreground">{band.name}.</span>
        {band.detail}
      </p>
      <p className="mt-1.5 max-w-[62ch] text-xs text-muted">
        A planning target, not a hard limit — the book may end a little shorter or longer, but
        it&apos;s never cut off or padded to hit the number.
      </p>
      {overBudget && (
        <p className="mt-2.5 rounded-lg bg-warn-soft px-2.5 py-2 text-[12.5px] text-amber-800 dark:text-amber-300">
          Your credits cover about {affordablePages} pages, so we&apos;ll plan a complete book at that
          size. Add credits for the full ~{value} pages.
        </p>
      )}
    </div>
  );
}
