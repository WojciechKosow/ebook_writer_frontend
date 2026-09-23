"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  COMMON_LANGUAGES,
  OTHER_LANGUAGES,
  languageLabel,
  matchesLanguage,
  type Language,
} from "@/lib/languages";

type Option = { label: string; hint?: string; value: string; group: string };

/**
 * Searchable language picker. Shows native names, stores the English name
 * (see lib/languages.ts), and lets the user type a language that isn't listed.
 */
export function LanguagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (english: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const toOption = (group: string) => (l: Language): Option => ({
    label: l.native,
    hint: l.native === l.english ? undefined : l.english,
    value: l.english,
    group,
  });
  const q = query.trim();
  const options: Option[] = [
    ...COMMON_LANGUAGES.filter((l) => matchesLanguage(l, q)).map(toOption(q ? "" : "Most used")),
    ...OTHER_LANGUAGES.filter((l) => matchesLanguage(l, q)).map(toOption(q ? "" : "All languages")),
  ];
  const exact = options.some(
    (o) => o.label.toLowerCase() === q.toLowerCase() || o.value.toLowerCase() === q.toLowerCase(),
  );
  if (q && !exact) options.push({ label: `Use “${q}”`, value: q, group: "Not on the list?" });

  // Close when clicking anywhere outside the picker.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[active]) choose(options[active].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span id={`${id}-label`} className="mb-1.5 block text-xs font-medium text-muted">
        Language
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen((o) => !o);
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 py-2.5 text-left text-base text-foreground transition-[border-color,box-shadow] focus:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent-soft sm:text-sm ${
          open ? "border-accent ring-4 ring-accent-soft" : "border-hairline-2"
        }`}
      >
        <span id={`${id}-value`} className="truncate">
          {languageLabel(value) || "English"}
        </span>
        <svg className="h-3.5 w-3.5 shrink-0 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 rounded-xl border border-hairline-2 bg-surface p-1.5 shadow-float">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search languages…"
            aria-label="Search languages"
            aria-controls={`${id}-list`}
            aria-activedescendant={options[active] ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            className="mb-1 w-full rounded-lg border border-hairline bg-surface-2 px-2.5 py-2 text-base text-foreground placeholder:text-faint focus:outline-none sm:text-sm"
          />
          <div ref={listRef} id={`${id}-list`} role="listbox" className="max-h-60 overflow-y-auto">
            {options.map((o, i) => (
              <div key={`${o.group}-${o.value}`}>
                {o.group && o.group !== options[i - 1]?.group && (
                  <p className="px-2 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-faint">
                    {o.group}
                  </p>
                )}
                <button
                  type="button"
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm ${
                    i === active ? "bg-accent-soft text-accent-ink" : "text-foreground"
                  } ${o.value === value ? "font-semibold" : ""}`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.hint && <span className="shrink-0 text-xs text-faint">{o.hint}</span>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
