"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookStatusResponse } from "@/lib/types";
import { isGenerating } from "@/lib/ebook-format";
import {
  STAGE_SHORT,
  bookTitle,
  byNewest,
  dateGroup,
  displayPages,
  relativeDay,
  shortDate,
  toDate,
} from "@/lib/library";
import { Alert, Button, Spinner } from "@/components/ui";
import { BookCover } from "@/components/library/book-cover";
import { DraftFeature, FinishedFeature, GeneratingFeature } from "@/components/library/featured-book";
import { EmptyLibrary } from "@/components/library/empty-library";
import {
  IconChevron,
  IconDownload,
  IconEdit,
  IconGrid,
  IconList,
  IconPlus,
  IconSearch,
} from "@/components/library/icons";

/** How often the list is refreshed while a book is being generated. */
const POLL_MS = 5000;
/** Books shown before "Show all" (per the current filter). */
const PAGE_SIZE = 24;
/** The library controls only appear once there's something to sift through. */
const TOOLS_FROM = 4;
/** Standard book length used for the "about N books" hint (the backend default target). */
const STANDARD_PAGES = 30;
/** View, sort and filter are remembered on this device. */
const PREFS_KEY = "scrivetta:library-view";

type Filter = "all" | "ready" | "writing" | "drafts" | "stopped";
type Sort = "new" | "old" | "az" | "long";
type View = "shelf" | "list";
type Prefs = { filter: Filter; sort: Sort; view: View };

const FILTERS: { key: Filter; label: string; test: (e: EbookStatusResponse) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "ready", label: "Ready", test: (e) => e.status === "COMPLETED" },
  { key: "writing", label: "Writing", test: (e) => isGenerating(e.status) },
  { key: "drafts", label: "Drafts", test: (e) => e.status === "DRAFT" },
  { key: "stopped", label: "Stopped", test: (e) => e.status === "FAILED" },
];

const SORTS: Record<Sort, { label: string; cmp: (a: EbookStatusResponse, b: EbookStatusResponse) => number }> = {
  new: { label: "Newest", cmp: byNewest("createdAt") },
  old: { label: "Oldest", cmp: (a, b) => byNewest("createdAt")(b, a) },
  az: {
    label: "Title A–Z",
    // Untitled books (drafts, or still being planned) go last.
    cmp: (a, b) => (a.title ?? "\uffff").localeCompare(b.title ?? "\uffff"),
  },
  long: { label: "Longest", cmp: (a, b) => displayPages(b).pages - displayPages(a).pages },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Still writing";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

type Toast = { text: string; downloadId?: string };

export default function DashboardPage() {
  const { token, user } = useAuth();
  const credits = useCredits();
  const [items, setItems] = useState<EbookStatusResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({ filter: "all", sort: "new", view: "shelf" });
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const itemsRef = useRef<EbookStatusResponse[] | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await ebookApi.list(token);
      itemsRef.current = data;
      setItems(data);
      setError(null);
    } catch {
      setError("Couldn't load your ebooks.");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // While anything is generating, keep the list fresh — and announce books
  // that finish (or stop) since the last refresh.
  const generating = items?.some((e) => isGenerating(e.status)) ?? false;
  const refreshCredits = credits?.refresh;
  useEffect(() => {
    if (!token || !generating) return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      let data: EbookStatusResponse[];
      try {
        data = await ebookApi.list(token);
      } catch {
        return; // keep the last list; try again on the next tick
      }
      const before = new Map((itemsRef.current ?? []).map((e) => [e.id, e.status]));
      const wasGenerating = (id: string) => {
        const s = before.get(id);
        return s !== undefined && isGenerating(s);
      };
      const finished = data.filter((e) => e.status === "COMPLETED" && wasGenerating(e.id));
      const stopped = data.filter((e) => e.status === "FAILED" && wasGenerating(e.id));
      itemsRef.current = data;
      setItems(data);
      if (finished.length === 1) {
        const b = finished[0];
        setToast({ text: `“${bookTitle(b)}” is ready — ${b.actualPageCount} pages.`, downloadId: b.id });
      } else if (finished.length > 1) {
        setToast({ text: `${finished.length} books are ready.` });
      } else if (stopped.length > 0) {
        setToast({ text: `“${bookTitle(stopped[0])}” stopped — your credits were refunded.` });
      }
      // The final charge (or refund) lands when a book finishes.
      if (finished.length || stopped.length) void refreshCredits?.();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [token, generating, refreshCredits]);

  // Restore the remembered view (client-only, after hydration).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") as Partial<Prefs> | null;
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrefs((p) => ({
          filter: FILTERS.some((f) => f.key === saved.filter) ? (saved.filter as Filter) : p.filter,
          sort: saved.sort && saved.sort in SORTS ? saved.sort : p.sort,
          view: saved.view === "list" || saved.view === "shelf" ? saved.view : p.view,
        }));
      }
    } catch {
      /* storage unavailable — defaults */
    }
  }, []);

  function updatePrefs(next: Partial<Prefs>) {
    setPrefs((p) => {
      const merged = { ...p, ...next };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
      } catch {
        /* storage unavailable */
      }
      return merged;
    });
    setShowAll(false);
  }

  // "/" jumps to the search box.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
      if (e.key === "/" && !typing && searchRef.current) {
        e.preventDefault();
        searchRef.current.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Toasts dismiss themselves.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const download = useCallback(
    async (id: string) => {
      if (!token) return;
      setDownloadingId(id);
      try {
        await ebookApi.download(token, id);
      } catch (err) {
        setToast({ text: err instanceof ApiError ? err.message : "Download failed. Please try again." });
      } finally {
        setDownloadingId(null);
      }
    },
    [token],
  );

  const list = useMemo(() => items ?? [], [items]);
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, list.filter(f.test).length])) as Record<Filter, number>,
    [list],
  );

  // The spotlight: the book being written now, else the latest finished one,
  // else a draft waiting to be generated.
  const featured = useMemo(() => {
    const writing = list.filter((e) => isGenerating(e.status)).sort(byNewest("updatedAt"))[0];
    if (writing) return { kind: "writing" as const, book: writing };
    const done = list.filter((e) => e.status === "COMPLETED").sort(byNewest("updatedAt"))[0];
    if (done) return { kind: "done" as const, book: done };
    const draft = list.filter((e) => e.status === "DRAFT").sort(byNewest("createdAt"))[0];
    if (draft) return { kind: "draft" as const, book: draft };
    return null;
  }, [list]);

  // A remembered filter that no longer matches anything falls back to "All".
  const filter = counts[prefs.filter] > 0 ? prefs.filter : "all";
  const visible = useMemo(() => {
    const test = FILTERS.find((f) => f.key === filter)!.test;
    const q = query.trim().toLowerCase();
    return list
      .filter(test)
      .filter((e) => !q || `${bookTitle(e)} ${e.subtitle ?? ""}`.toLowerCase().includes(q))
      .sort(SORTS[prefs.sort].cmp);
  }, [list, filter, query, prefs.sort]);
  const shown = showAll ? visible : visible.slice(0, PAGE_SIZE);

  const groups = useMemo(() => {
    if (prefs.sort !== "new" && prefs.sort !== "old") return [{ label: null, books: shown }];
    const map = new Map<string, EbookStatusResponse[]>();
    for (const e of shown) {
      const key = dateGroup(toDate(e.createdAt));
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map].map(([label, books]) => ({ label, books }));
  }, [shown, prefs.sort]);

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const balance = credits?.balance ?? null;

  if (items === null && !error) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted">
        <Spinner /> Opening your library…
      </div>
    );
  }

  return (
    <div>
      <Hero name={firstName} books={list} balance={balance} />

      {error && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <Alert>{error}</Alert>
          </div>
          <Button variant="secondary" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      )}

      {items && items.length === 0 && <EmptyLibrary balance={balance} />}

      {featured?.kind === "writing" && <GeneratingFeature book={featured.book} />}
      {featured?.kind === "done" && (
        <FinishedFeature
          book={featured.book}
          onDownload={() => void download(featured.book.id)}
          downloading={downloadingId === featured.book.id}
        />
      )}
      {featured?.kind === "draft" && <DraftFeature book={featured.book} />}

      {list.length > 0 && (
        <section className="mt-9 sm:mt-12" aria-labelledby="library-heading">
          <h2 id="library-heading" className="font-display text-[26px] text-foreground sm:text-[30px]">
            Your library
            <small className="ml-2 align-middle font-mono text-xs text-muted">{list.length}</small>
          </h2>

          {list.length >= TOOLS_FROM && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[14px] border border-hairline bg-surface p-2">
              <label className="flex h-9 min-w-[180px] flex-1 basis-full items-center gap-2 rounded-[9px] border border-transparent bg-surface-2 px-2.5 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-soft sm:basis-auto">
                <IconSearch className="h-[15px] w-[15px] shrink-0 text-muted" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search titles"
                  aria-label="Search your library"
                  className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-faint focus:outline-none sm:text-sm"
                />
                <kbd className="hidden rounded border border-hairline-2 px-1.5 font-mono text-[10.5px] text-faint sm:inline">/</kbd>
              </label>

              <div className="flex basis-full gap-0.5 overflow-x-auto rounded-[9px] bg-surface-2 p-[3px] sm:basis-auto" role="group" aria-label="Filter">
                {FILTERS.filter((f) => f.key === "all" || counts[f.key] > 0).map((f) => {
                  const on = f.key === filter;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => updatePrefs({ filter: f.key })}
                      className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-[5px] text-[13px] sm:flex-none ${
                        on
                          ? "bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_var(--hairline)]"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {f.label}
                      <span className={`font-mono text-[11px] ${on ? "text-accent" : "text-faint"}`}>{counts[f.key]}</span>
                    </button>
                  );
                })}
              </div>

              <select
                value={prefs.sort}
                onChange={(e) => updatePrefs({ sort: e.target.value as Sort })}
                aria-label="Sort"
                className="h-9 flex-1 rounded-[9px] bg-surface-2 px-2.5 text-[13px] text-foreground-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:flex-none"
              >
                {(Object.keys(SORTS) as Sort[]).map((k) => (
                  <option key={k} value={k}>
                    {SORTS[k].label}
                  </option>
                ))}
              </select>

              <div className="flex gap-0.5 rounded-[9px] bg-surface-2 p-[3px]" role="group" aria-label="View">
                {(
                  [
                    ["shelf", "Shelf view", IconGrid],
                    ["list", "List view", IconList],
                  ] as const
                ).map(([v, label, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    aria-label={label}
                    aria-pressed={prefs.view === v}
                    onClick={() => updatePrefs({ view: v })}
                    className={`rounded-[7px] px-2 py-[5px] ${
                      prefs.view === v
                        ? "bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_var(--hairline)]"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-[15px] w-[15px]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="px-5 py-14 text-center text-muted">
              <p className="mb-1.5 font-display text-[26px] italic text-foreground">Nothing on this shelf.</p>
              Try a different search or filter.
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.label ?? "all"} className="mt-8">
                {g.label && (
                  <div className="mb-4 flex items-center gap-3 text-xs text-muted after:h-px after:flex-1 after:bg-hairline">
                    <b className="text-[13px] font-semibold text-foreground">{g.label}</b>
                    {g.books.length}
                  </div>
                )}
                {prefs.view === "shelf" ? (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(144px,1fr))] sm:gap-x-6 sm:gap-y-8">
                    {g.books.map((e) => (
                      <ShelfBook
                        key={e.id}
                        book={e}
                        onDownload={() => void download(e.id)}
                        downloading={downloadingId === e.id}
                      />
                    ))}
                  </ul>
                ) : (
                  <ul className="overflow-hidden rounded-[14px] border border-hairline bg-surface">
                    {g.books.map((e) => (
                      <ListBook
                        key={e.id}
                        book={e}
                        onDownload={() => void download(e.id)}
                        downloading={downloadingId === e.id}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}

          {visible.length > PAGE_SIZE && !showAll && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={() => setShowAll(true)}>
                Show all {visible.length} books
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Announcements (a book finished, a download failed). */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-foreground py-2.5 pl-4 pr-2.5 text-[13.5px] text-background shadow-float transition-[opacity,transform] duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <span>{toast?.text}</span>
        {toast?.downloadId && (
          <button
            type="button"
            onClick={() => {
              const id = toast.downloadId!;
              setToast(null);
              void download(id);
            }}
            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[12.5px] font-semibold text-white"
          >
            Download
          </button>
        )}
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Dismiss"
          className="shrink-0 px-1 text-background/60 hover:text-background"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ---- Hero ------------------------------------------------------------------

function Hero({ name, books, balance }: { name: string; books: EbookStatusResponse[]; balance: number | null }) {
  const done = books.filter((e) => e.status === "COMPLETED");
  const pages = done.reduce((sum, e) => sum + e.actualPageCount, 0);
  const writing = books.filter((e) => isGenerating(e.status)).length;
  const lastUpdated = toDate(done.slice().sort(byNewest("updatedAt"))[0]?.updatedAt ?? null);

  const facts: React.ReactNode[] =
    books.length === 0
      ? ["Your first book is one short brief away."]
      : [
          <>
            <b className="font-semibold tabular-nums text-foreground">{done.length}</b>{" "}
            {done.length === 1 ? "book" : "books"} on your shelf
          </>,
          pages > 0 && (
            <>
              <b className="font-semibold tabular-nums text-foreground">{pages.toLocaleString("en")}</b> pages written
            </>
          ),
          writing > 0 && (
            <>
              <b className="font-semibold tabular-nums text-foreground">{writing}</b> being written now
            </>
          ),
          lastUpdated && <>last updated {relativeDay(lastUpdated)}</>,
        ].filter(Boolean);

  return (
    <header className="flex flex-col gap-5 border-b border-hairline pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:pb-7">
      <div className="min-w-0">
        <p className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brass" />
          Your writing studio
        </p>
        <h1 className="text-balance font-display text-[36px] leading-[1.02] tracking-tight text-foreground sm:text-[48px]">
          {greeting()}, <em className="text-accent">{name}</em>
        </h1>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted sm:text-[15px]">
          {facts.map((f, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden className="hidden text-faint sm:inline">·</span>}
              <span>{f}</span>
            </span>
          ))}
        </p>
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <Link
          href="/ebooks/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[11px] bg-accent px-4 text-[13.5px] font-semibold text-white shadow-soft transition hover:brightness-95"
        >
          <IconPlus /> New ebook
        </Link>
        {balance !== null && books.length > 0 && (
          <p className="text-center text-xs text-muted sm:text-right">
            {balance.toLocaleString("en")} credits
            {balance >= STANDARD_PAGES ? ` · about ${Math.floor(balance / STANDARD_PAGES)} books of ~${STANDARD_PAGES} pages` : ""}
            {" · "}
            <Link href="/billing" className="font-semibold text-accent hover:underline">
              Buy
            </Link>
          </p>
        )}
      </div>
    </header>
  );
}

// ---- Books -----------------------------------------------------------------

function statusLine(e: EbookStatusResponse): React.ReactNode {
  if (isGenerating(e.status)) {
    return (
      <span className="text-accent-ink">
        {STAGE_SHORT[e.status]} · {Math.round(e.progress)}%
      </span>
    );
  }
  if (e.status === "FAILED") return <span className="text-red-600 dark:text-red-400">Stopped · credits refunded</span>;
  if (e.status === "DRAFT") return <span className="text-brass">Draft · add images &amp; generate</span>;
  const created = toDate(e.createdAt);
  return (
    <>
      {e.actualPageCount > 0 && <span>{e.actualPageCount} pp</span>}
      {e.actualPageCount > 0 && created && <span aria-hidden>·</span>}
      {created && <span>{shortDate(created)}</span>}
    </>
  );
}

function ShelfBook({
  book,
  onDownload,
  downloading,
}: {
  book: EbookStatusResponse;
  onDownload: () => void;
  downloading: boolean;
}) {
  const done = book.status === "COMPLETED";
  return (
    <li className="group relative">
      {/* Sits above the card link but lets clicks through, except on the quick actions. */}
      <div className="pointer-events-none relative z-10 transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1.5">
        <BookCover book={book} />
        {done && (
          <div className="pointer-events-auto absolute right-2 top-2 hidden gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:flex [@media(hover:none)]:opacity-100">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              aria-label={`Download “${bookTitle(book)}” as PDF`}
              title="Download PDF"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-white/95 text-[#17151f] shadow-[0_2px_8px_rgba(0,0,0,.2)] hover:bg-white"
            >
              {downloading ? <Spinner className="h-3.5 w-3.5" /> : <IconDownload className="h-3.5 w-3.5" />}
            </button>
            <Link
              href={`/ebooks/${book.id}/edit`}
              aria-label={`Edit “${bookTitle(book)}”`}
              title="Edit text"
              className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-white/95 text-[#17151f] shadow-[0_2px_8px_rgba(0,0,0,.2)] hover:bg-white"
            >
              <IconEdit className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
      {/* The whole card opens the book; the quick actions sit above this link. */}
      <Link
        href={`/ebooks/${book.id}`}
        className="mt-3 line-clamp-2 text-[13px] font-semibold leading-snug text-foreground after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-accent sm:text-sm"
      >
        {bookTitle(book)}
      </Link>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">{statusLine(book)}</p>
    </li>
  );
}

function ListBook({
  book,
  onDownload,
  downloading,
}: {
  book: EbookStatusResponse;
  onDownload: () => void;
  downloading: boolean;
}) {
  const { pages, exact } = displayPages(book);
  const created = toDate(book.createdAt);
  const pill = isGenerating(book.status)
    ? { text: `${STAGE_SHORT[book.status]} ${Math.round(book.progress)}%`, cls: "bg-accent-soft text-accent-ink" }
    : book.status === "COMPLETED"
      ? { text: "PDF ready", cls: "bg-good-soft text-good" }
      : book.status === "DRAFT"
        ? { text: "Draft", cls: "bg-brass-soft text-brass" }
        : { text: "Stopped", cls: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" };
  const sub =
    book.subtitle ||
    (book.status === "DRAFT"
      ? "Brief saved — not generated yet"
      : book.status === "FAILED"
        ? "Generation stopped — credits refunded"
        : "");

  return (
    <li className="relative grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-t border-hairline px-3.5 py-3 transition-colors first:border-t-0 hover:bg-surface-2 sm:grid-cols-[40px_minmax(0,1fr)_130px_72px] sm:gap-[18px] sm:px-[18px] xl:grid-cols-[40px_minmax(0,1fr)_90px_100px_130px_72px]">
      <BookCover book={book} thumb />
      <div className="min-w-0">
        <Link
          href={`/ebooks/${book.id}`}
          className="block truncate font-semibold text-foreground after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-accent"
        >
          {bookTitle(book)}
        </Link>
        {sub && <p className="mt-0.5 truncate text-[12.5px] text-muted">{sub}</p>}
      </div>
      <span className="hidden text-[13px] tabular-nums text-foreground-2 xl:block">
        {exact ? `${pages} pages` : `~${pages} pages`}
      </span>
      <span className="hidden text-[13px] text-foreground-2 xl:block">{created ? shortDate(created) : ""}</span>
      <span className="hidden sm:block">
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${pill.cls}`}>
          <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-current" />
          {pill.text}
        </span>
      </span>
      <span className="flex justify-end gap-1">
        {book.status === "COMPLETED" && (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            aria-label={`Download “${bookTitle(book)}” as PDF`}
            title="Download PDF"
            className="relative z-10 hidden h-[30px] w-[30px] place-items-center rounded-lg border border-hairline-2 bg-surface text-muted hover:border-faint hover:text-foreground sm:grid"
          >
            {downloading ? <Spinner className="h-3.5 w-3.5" /> : <IconDownload className="h-3.5 w-3.5" />}
          </button>
        )}
        <span aria-hidden className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-hairline-2 bg-surface text-muted">
          <IconChevron className="h-3.5 w-3.5" />
        </span>
      </span>
    </li>
  );
}
