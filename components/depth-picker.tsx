"use client";

import type { BookDepth, ScopeEstimate } from "@/lib/types";
import { DEPTHS, DEPTH_INFO, approxRange } from "@/lib/ebook-format";

export { DEPTHS, DEPTH_INFO };

/**
 * The depth selector — the user's control over scope. There is no page-count
 * input: Scrivetta determines the length from the topic, the materials and the
 * depth. Each option shows Scrivetta's estimate for it, clearly marked as one.
 */
export function DepthPicker({
  options,
  value,
  onChange,
  disabled = false,
}: {
  /** Estimates per depth, or null while loading. */
  options: ScopeEstimate[] | null;
  value: BookDepth;
  onChange: (depth: BookDepth) => void;
  disabled?: boolean;
}) {
  const byDepth = new Map((options ?? []).map((o) => [o.depth, o]));

  return (
    <div>
      <div role="radiogroup" aria-label="Depth" className="grid gap-2 sm:grid-cols-3">
        {DEPTHS.map((depth, i) => {
          const selected = depth === value;
          const estimate = byDepth.get(depth);
          return (
            <button
              key={depth}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(depth)}
              className={`flex flex-col gap-2 rounded-xl border bg-surface px-3.5 pb-3 pt-3.5 text-left transition-[border-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60 ${
                selected ? "border-accent ring-4 ring-accent-soft" : "border-hairline-2 hover:border-faint"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <b className={`text-[15px] font-semibold tracking-tight ${selected ? "text-accent" : "text-foreground"}`}>
                  {estimate?.label ?? DEPTH_INFO[depth].name}
                </b>
                {/* Depth, drawn as layers rather than as a page count. */}
                <span aria-hidden className="flex items-end gap-[3px]">
                  {[0, 1, 2].map((n) => (
                    <i
                      key={n}
                      className={`block w-[5px] rounded-sm ${
                        n <= i ? (selected ? "bg-accent" : "bg-foreground-2") : "bg-hairline-2"
                      }`}
                      style={{ height: `${8 + n * 5}px` }}
                    />
                  ))}
                </span>
              </span>
              <span className="text-[12.5px] leading-snug text-muted">
                {estimate?.description ?? DEPTH_INFO[depth].detail}
              </span>
              <span className="mt-auto border-t border-dashed border-hairline-2 pt-2 text-[12px] text-foreground-2">
                {estimate ? (
                  <>
                    Est. <b className="font-semibold tabular-nums">{approxRange(estimate.pagesLow, estimate.pagesHigh)}</b>{" "}
                    pages
                  </>
                ) : (
                  <span className="text-faint">Estimating…</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 max-w-[64ch] text-xs text-muted">
        Scrivetta determines the appropriate book length based on your topic, materials and selected
        depth. Page counts are estimates, not limits — the finished book is as long as its content
        needs.
      </p>
    </div>
  );
}
