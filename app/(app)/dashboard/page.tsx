"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
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

export default function DashboardPage() {
  const { token } = useAuth();
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your ebooks
        </h1>
        <ButtonLink href="/ebooks/new">New ebook</ButtonLink>
      </div>

      <div className="mt-8">
        {error && <Alert>{error}</Alert>}

        {items === null && !error ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Spinner /> Loading…
          </div>
        ) : items && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You haven&apos;t created any ebooks yet.
            </p>
            <div className="mt-4 flex justify-center">
              <ButtonLink href="/ebooks/new">Create your first ebook</ButtonLink>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {items?.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/ebooks/${e.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {e.title || "Untitled ebook"}
                      </p>
                      {e.subtitle && (
                        <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                          {e.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">{formatDate(e.createdAt)}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  {!isTerminal(e.status) && (
                    <div className="mt-4">
                      <ProgressBar value={e.progress} />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
