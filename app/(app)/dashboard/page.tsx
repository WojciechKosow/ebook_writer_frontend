"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi } from "@/lib/api";
import type { EbookStatusResponse } from "@/lib/types";
import { StatusBadge, ProgressBar } from "@/components/ebook-ui";
import { Alert, ButtonLink, Spinner } from "@/components/ui";
import { STAGE_MESSAGE, isTerminal } from "@/lib/ebook-format";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function timeOfDay(): { greeting: string } {
  const h = new Date().getHours();
  if (h < 5) return { greeting: "Still writing" };
  if (h < 12) return { greeting: "Good morning" };
  if (h < 18) return { greeting: "Good afternoon" };
  return { greeting: "Good evening" };
}

/** Deterministic accent for a book cover based on its id. */
const COVER_GRADIENTS = [
  "from-[#5B4BE1] to-[#3F32B0]",
  "from-[#C0873A] to-[#8a5f24]",
  "from-[#0E9D6E] to-[#0a6b4b]",
  "from-[#e15b8a] to-[#a03360]",
];
function coverFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length];
}

/** Chapters written / total, when we have chapter data. */
function chapterProgress(e: EbookStatusResponse): { done: number; total: number } | null {
  const total = e.chapters?.length ?? 0;
  if (total === 0) return null;
  const done = e.chapters.filter((c) => c.status === "WRITTEN" || c.status === "EDITED").length;
  return { done, total };
}

/** A rotating line of encouragement, so the header never feels static. */
const WRITER_LINES = [
  "Every book starts with a single sentence.",
  "The blank page doesn't stand a chance today.",
  "Somewhere a reader is waiting for your next chapter.",
  "Write the book only you can write.",
  "Progress over perfection — one chapter at a time.",
];

export default function DashboardPage() {
  const { token, user } = useAuth();
  const credits = useCredits();
  const [items, setItems] = useState<EbookStatusResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        const data = await ebookApi.list(token);
        if (active) setItems(data);
      } catch {
        if (active) setError("Couldn't load your ebooks.");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  // Rotate the writer's line every few seconds.
  useEffect(() => {
    setLine(Math.floor(Math.random() * WRITER_LINES.length));
    const t = setInterval(() => setLine((n) => (n + 1) % WRITER_LINES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const list = items ?? [];
    const finished = list.filter((e) => e.status === "COMPLETED").length;
    const inProgress = list.filter((e) => !isTerminal(e.status)).length;
    return { total: list.length, finished, inProgress };
  }, [items]);

  // The most recently touched book that's still being generated — the thing
  // the author most likely wants to jump back into.
  const activeBook = useMemo(() => {
    const list = items ?? [];
    return (
      list
        .filter((e) => !isTerminal(e.status))
        .sort((a, b) => (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""))[0] ?? null
    );
  }, [items]);

  // Latest finished book, used as the spotlight when nothing is generating.
  const latestDone = useMemo(() => {
    const list = items ?? [];
    return (
      list
        .filter((e) => e.status === "COMPLETED")
        .sort((a, b) => (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""))[0] ?? null
    );
  }, [items]);

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const { greeting } = timeOfDay();

  return (
    <div className="space-y-8">
      {/* ---- Editorial greeting band ---------------------------------------- */}
      <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-6 shadow-soft sm:p-8">
        {/* drifting aurora glow */}
        <div
          aria-hidden
          className="aurora pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 32%, transparent), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="aurora pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full"
          style={{
            animationDelay: "-7s",
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--brass) 24%, transparent), transparent 70%)",
          }}
        />
        {/* faint ruled paper */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(var(--hairline) 1px, transparent 1px)",
            backgroundSize: "100% 30px",
            maskImage: "linear-gradient(180deg, #000, transparent 80%)",
            WebkitMaskImage: "linear-gradient(180deg, #000, transparent 80%)",
          }}
        />

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-2 bg-surface/70 px-3 py-1 text-xs font-semibold text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              Your writing studio
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              {greeting},{" "}
              <span className="font-[family-name:var(--font-display)] italic font-medium text-accent">
                {firstName}
              </span>
            </h1>
            <p key={line} className="float-in mt-2 max-w-md text-sm text-muted">
              {items === null
                ? "Opening your library…"
                : items.length === 0
                  ? "Your shelf is empty — let's put the first book on it."
                  : WRITER_LINES[line]}
            </p>
          </div>

          <ButtonLink href="/ebooks/new" className="shrink-0 px-4 py-2.5">
            <IconPlus /> New ebook
          </ButtonLink>
        </div>

        {/* inline stat strip */}
        <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total ebooks" value={items === null ? "…" : stats.total} icon={IconBooks} />
          <StatCard label="Finished" value={items === null ? "…" : stats.finished} icon={IconCheck} />
          <StatCard label="In progress" value={items === null ? "…" : stats.inProgress} icon={IconClock} live={stats.inProgress > 0} />
          <StatCard
            label="Credits left"
            value={credits?.balance ?? "…"}
            icon={IconDiamond}
            href="/billing"
          />
        </div>
      </header>

      {/* ---- Spotlight: continue writing / latest finished ------------------ */}
      {activeBook ? (
        <ContinueCard book={activeBook} />
      ) : latestDone ? (
        <FinishedCard book={latestDone} />
      ) : null}

      {/* ---- Library -------------------------------------------------------- */}
      <div>
        {error && <Alert>{error}</Alert>}

        {items === null && !error ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted">
            <Spinner /> Loading…
          </div>
        ) : items && items.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-hairline-2 bg-surface-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-11 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-ink shadow-[0_4px_12px_-4px_rgba(0,0,0,.4)]">
              <IconPlus className="h-5 w-5 text-white/90" />
            </div>
            <p className="text-sm text-muted">You haven&apos;t created any ebooks yet.</p>
            <div className="mt-4 flex justify-center">
              <ButtonLink href="/ebooks/new" className="px-4 py-2.5">
                Write your first book
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <span className="text-[15px] font-semibold text-foreground">Your library</span>
              <span className="text-xs font-medium text-faint">{stats.total} total</span>
            </div>
            <ul>
              {items?.map((e) => {
                const cp = chapterProgress(e);
                return (
                  <li key={e.id}>
                    <Link
                      href={`/ebooks/${e.id}`}
                      className="group flex items-center gap-4 border-b border-hairline px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-2"
                    >
                      <span
                        className={`grid h-14 w-10 shrink-0 place-items-center rounded-md bg-gradient-to-br ${coverFor(e.id)} px-1 text-center shadow-[0_4px_10px_-4px_rgba(0,0,0,.35)] transition-transform group-hover:-translate-y-0.5`}
                      >
                        <span className="font-[family-name:var(--font-display)] text-[9px] italic leading-tight text-white/95 line-clamp-3">
                          {e.title || "Untitled"}
                        </span>
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {e.title || "Untitled ebook"}
                        </p>
                        {e.subtitle && (
                          <p className="mt-0.5 truncate text-sm text-muted">{e.subtitle}</p>
                        )}
                        <p className="mt-1 text-xs text-faint">
                          {formatDate(e.createdAt)}
                          {cp && !isTerminal(e.status) ? ` · ${cp.done}/${cp.total} chapters` : ""}
                        </p>
                      </div>

                      <div className="hidden w-40 shrink-0 sm:block">
                        {isTerminal(e.status) ? (
                          <p className="text-right text-xs font-medium text-muted">
                            {e.status === "COMPLETED" ? "PDF ready" : "Failed"}
                          </p>
                        ) : (
                          <>
                            <ProgressBar value={e.progress} />
                            <p className="mt-1.5 text-right text-[11px] font-medium tabular-nums text-muted">
                              {Math.round(e.progress)}%
                            </p>
                          </>
                        )}
                      </div>

                      <StatusBadge status={e.status} />

                      <IconChevron className="hidden shrink-0 text-faint transition-transform group-hover:translate-x-0.5 sm:block" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Spotlight cards -------------------------------------------------------

/** Big "jump back in" card for the book currently being generated. */
function ContinueCard({ book }: { book: EbookStatusResponse }) {
  const cp = chapterProgress(book);
  return (
    <Link
      href={`/ebooks/${book.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-hairline bg-surface p-5 shadow-soft transition-colors hover:border-hairline-2 sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 50%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-5">
        <span
          className={`hidden h-20 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br sm:grid ${coverFor(book.id)} px-1.5 text-center shadow-[0_6px_16px_-6px_rgba(0,0,0,.45)] transition-transform group-hover:-translate-y-0.5`}
        >
          <span className="font-[family-name:var(--font-display)] text-[11px] italic leading-tight text-white/95 line-clamp-4">
            {book.title || "Untitled"}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="live-dot h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">
              Writing now
            </span>
          </div>
          <p className="mt-1.5 truncate text-lg font-semibold text-foreground">
            {book.title || "Untitled ebook"}
          </p>
          <p className="truncate text-sm text-muted">{STAGE_MESSAGE[book.status]}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <ProgressBar value={book.progress} />
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {Math.round(book.progress)}%
            </span>
          </div>
          {cp && (
            <p className="mt-1.5 text-xs text-faint">
              {cp.done} of {cp.total} chapters drafted
            </p>
          )}
        </div>

        <span className="hidden shrink-0 items-center gap-1 self-stretch pl-2 text-sm font-semibold text-accent sm:flex">
          Resume
          <IconChevron className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Spotlight for the most recent finished book when nothing is generating. */
function FinishedCard({ book }: { book: EbookStatusResponse }) {
  return (
    <Link
      href={`/ebooks/${book.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-hairline bg-surface p-5 shadow-soft transition-colors hover:border-hairline-2 sm:p-6"
    >
      <div className="relative flex items-center gap-5">
        <span
          className={`hidden h-20 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br sm:grid ${coverFor(book.id)} px-1.5 text-center shadow-[0_6px_16px_-6px_rgba(0,0,0,.45)] transition-transform group-hover:-translate-y-0.5`}
        >
          <span className="font-[family-name:var(--font-display)] text-[11px] italic leading-tight text-white/95 line-clamp-4">
            {book.title || "Untitled"}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-good">
            <IconCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">Latest finished</span>
          </div>
          <p className="mt-1.5 truncate text-lg font-semibold text-foreground">
            {book.title || "Untitled ebook"}
          </p>
          <p className="truncate text-sm text-muted">
            {book.subtitle || "Your PDF is ready to download."}
          </p>
        </div>

        <span className="hidden shrink-0 items-center gap-1 self-stretch pl-2 text-sm font-semibold text-accent sm:flex">
          Open
          <IconChevron className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  live = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: (p: { className?: string }) => React.ReactElement;
  href?: string;
  live?: boolean;
}) {
  const inner = (
    <div className="group h-full rounded-2xl border border-hairline bg-surface/80 p-4 backdrop-blur transition-colors hover:border-hairline-2">
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
        {live && <span className="live-dot ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ---- Icons -----------------------------------------------------------------

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconBooks({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}
function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconDiamond({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 4 9l8 13 8-13-8-7Z" opacity="0.9" />
    </svg>
  );
}
function IconChevron({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
