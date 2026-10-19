"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductState } from "@/lib/store/changes";

/**
 * Small pieces shared by Your store and the store editors: a modal dialog, a
 * "⋯" menu, status chips and the draft status line. One look for every state,
 * one word for every thing (see the store redesign's system board).
 */

// ---- Dialog -----------------------------------------------------------------------

/** A modal on the native <dialog>: focus stays inside, Esc closes it. */
export function Dialog({ open, onClose, title, children, wide = false, labelledBy }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  wide?: boolean;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : title}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[92vh] w-[calc(100%-24px)] overflow-y-auto rounded-2xl border border-hairline bg-surface p-0 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop:bg-black/40 ${wide ? "max-w-[1040px]" : "max-w-[460px]"}`}>
      {open && children}
    </dialog>
  );
}

export function DialogHeader({ id, title, onClose }: { id?: string; title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
      <h2 id={id} className="font-display text-[24px] font-normal leading-tight">{title}</h2>
      <button type="button" aria-label="Close" onClick={onClose}
        className="-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}

// ---- Menu ---------------------------------------------------------------------------

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
}

/** The "⋯" button: secondary and destructive actions live here, never as loose buttons. */
export function MoreMenu({ label, items, align = "right" }: { label: string; items: (MenuItem | "sep")[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const item = "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface-2 disabled:opacity-45 disabled:hover:bg-transparent";
  return (
    <div ref={box} className="relative">
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-2 bg-surface text-foreground-2 hover:border-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
      </button>
      {open && (
        <div role="menu" className={`absolute top-11 z-20 flex min-w-[220px] flex-col gap-0.5 rounded-xl border border-hairline bg-surface p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${align === "right" ? "right-0" : "left-0"}`}>
          {items.map((it, i) =>
            it === "sep" ? (
              <span key={i} className="my-1 h-px bg-hairline" />
            ) : it.href ? (
              <a key={i} role="menuitem" href={it.href} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>{it.label}</a>
            ) : (
              <button key={i} type="button" role="menuitem" disabled={it.disabled}
                className={`${item} ${it.danger ? "text-red-700 dark:text-red-400" : "text-foreground"}`}
                onClick={() => {
                  setOpen(false);
                  it.onSelect?.();
                }}>
                {it.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ---- Chips --------------------------------------------------------------------------

const CHIP = "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium";
const dot = <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />;

export function Chip({ tone, children }: { tone: "live" | "draft" | "mute" | "warn" | "ink" | "violet"; children: React.ReactNode }) {
  const tones = {
    live: "bg-good-soft text-good",
    draft: "bg-warn-soft text-warn",
    mute: "bg-surface-2 text-foreground-2",
    warn: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
    ink: "bg-foreground text-background",
    violet: "bg-accent-soft text-accent-ink",
  } as const;
  return <span className={`${CHIP} ${tones[tone]}`}>{children}</span>;
}

export function StoreStateChip({ published }: { published: boolean }) {
  return published ? <Chip tone="live">{dot}Live</Chip> : <Chip tone="draft">{dot}Draft</Chip>;
}

const STATE: Record<ProductState, { tone: "live" | "draft" | "mute" | "warn"; label: string }> = {
  live: { tone: "live", label: "Live" },
  new: { tone: "draft", label: "Goes live when you publish" },
  hiding: { tone: "draft", label: "Hidden when you publish" },
  hidden: { tone: "mute", label: "Hidden" },
  "needs-file": { tone: "warn", label: "Needs a file" },
};

export function ProductStateChip({ state }: { state: ProductState }) {
  const s = STATE[state];
  return <Chip tone={s.tone}>{dot}{s.label}</Chip>;
}

export function FeaturedChip({ short = false }: { short?: boolean }) {
  return (
    <Chip tone="ink">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M8 1l2.1 4.5 4.9.6-3.6 3.3.9 4.9L8 11.9l-4.3 2.4.9-4.9L1 6.1l4.9-.6z" /></svg>
      {short ? "Featured" : "Featured on your store"}
    </Chip>
  );
}

export function AccountPerkChip() {
  return (
    <Chip tone="violet">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" /></svg>
      Account perk
    </Chip>
  );
}

/** The draft status line: a dot and words, the same in every top bar. */
export function DraftDot({ tone, label }: { tone: "busy" | "draft" | "live" | "off"; label: string }) {
  const color = { busy: "bg-faint animate-pulse", draft: "bg-[#C4892B]", live: "bg-good", off: "bg-faint" }[tone];
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-muted" aria-live="polite">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      {label}
    </span>
  );
}

/** Copies the store link and says so for two seconds. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }
  return { copied, copy };
}
