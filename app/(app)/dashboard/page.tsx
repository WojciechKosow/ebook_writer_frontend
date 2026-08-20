"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi } from "@/lib/api";
import type { EbookStatusResponse } from "@/lib/types";
import { StatusBadge, ProgressBar } from "@/components/ebook-ui";
import { Alert, ButtonLink, Spinner } from "@/components/ui";
import { isTerminal } from "@/lib/ebook-format";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
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

export default function DashboardPage() {
  const { token, user } = useAuth();
  const credits = useCredits();
  const [items, setItems] = useState<EbookStatusResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const stats = useMemo(() => {
    const list = items ?? [];
    const finished = list.filter((e) => e.status === "COMPLETED").length;
    const inProgress = list.filter((e) => !isTerminal(e.status)).length;
    return { total: list.length, finished, inProgress };
  }, [items]);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div>
      {/* Page head */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {items === null
              ? "Loading your library…"
              : items.length === 0
                ? "Your library is empty — start your first book."
                : `${stats.total} ebook${stats.total === 1 ? "" : "s"} · ${stats.finished} finished · ${stats.inProgress} in progress`}
          </p>
        </div>
        <ButtonLink href="/ebooks/new" className="px-4 py-2.5">
          <IconPlus /> New ebook
        </ButtonLink>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total ebooks" value={items === null ? "…" : stats.total} icon={IconBooks} />
        <StatCard label="Finished" value={items === null ? "…" : stats.finished} icon={IconCheck} />
        <StatCard label="In progress" value={items === null ? "…" : stats.inProgress} icon={IconClock} />
        <StatCard
          label="Credits left"
          value={credits?.balance ?? "…"}
          icon={IconDiamond}
          href="/billing"
        />
      </div>

      {/* Library panel */}
      <div className="mt-8">
        {error && <Alert>{error}</Alert>}

        {items === null && !error ? (
          <div className="flex items-center gap-2 py-10 text-sm text-muted">
            <Spinner /> Loading…
          </div>
        ) : items && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hairline-2 bg-surface-2 p-12 text-center">
            <p className="text-sm text-muted">You haven&apos;t created any ebooks yet.</p>
            <div className="mt-4 flex justify-center">
              <ButtonLink href="/ebooks/new" className="px-4 py-2.5">
                Create your first ebook
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <span className="text-[15px] font-semibold text-foreground">Your library</span>
              <span className="text-xs font-medium text-faint">
                {stats.total} total
              </span>
            </div>
            <ul>
              {items?.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/ebooks/${e.id}`}
                    className="flex items-center gap-4 border-b border-hairline px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-2"
                  >
                    <span
                      className={`grid h-14 w-10 shrink-0 place-items-center rounded-md bg-gradient-to-br ${coverFor(e.id)} px-1 text-center shadow-[0_4px_10px_-4px_rgba(0,0,0,.35)]`}
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
                      <p className="mt-1 text-xs text-faint">{formatDate(e.createdAt)}</p>
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

                    <IconChevron className="hidden shrink-0 text-faint sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: (p: { className?: string }) => React.ReactElement;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-soft transition-colors hover:border-hairline-2">
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
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
