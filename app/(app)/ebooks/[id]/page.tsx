"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import { useAssets } from "@/lib/use-assets";
import type { EbookStatusResponse } from "@/lib/types";
import { StatusBadge, ProgressBar } from "@/components/ebook-ui";
import { AssetManager } from "@/components/asset-manager";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";
import { CHAPTER_STATUS_LABEL, STAGE_MESSAGE, isGenerating, isTerminal } from "@/lib/ebook-format";

const POLL_MS = 3000;

export default function EbookDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const { token } = useAuth();
  const credits = useCredits();
  const assets = useAssets(token, id);

  const [ebook, setEbook] = useState<EbookStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Poll while the generation is actively running (drafts and terminal states
  // don't poll). Re-armed via reloadKey when the user starts generation.
  useEffect(() => {
    if (!token || !id) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await ebookApi.get(token, id);
        if (!active) return;
        setEbook(data);
        if (isGenerating(data.status)) {
          timer = setTimeout(poll, POLL_MS);
        } else if (isTerminal(data.status)) {
          // A failed generation refunds its credits; refresh the balance.
          credits?.refresh();
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Couldn't load this ebook.");
      }
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id, reloadKey]);

  const startGeneration = useCallback(async () => {
    if (!token || !ebook) return;
    setStarting(true);
    setError(null);
    try {
      const updated = await ebookApi.start(token, ebook.id);
      setEbook(updated);
      credits?.refresh();
      setReloadKey((k) => k + 1); // begin polling
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        const body = err.body as { required?: number; available?: number } | undefined;
        setError(
          `You need ${body?.required ?? "more"} credits but have ${body?.available ?? 0}. Buy more to generate.`,
        );
        credits?.refresh();
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't start generation.");
      }
    } finally {
      setStarting(false);
    }
  }, [token, ebook, credits]);

  const download = useCallback(async () => {
    if (!token || !ebook) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await ebookApi.download(token, ebook.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ebook.title || "ebook"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  }, [token, ebook]);

  if (error && !ebook) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert>{error}</Alert>
        <div className="mt-4">
          <ButtonLink href="/dashboard" variant="secondary">
            Back to your ebooks
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading…
      </div>
    );
  }

  const draft = ebook.status === "DRAFT";
  const active = isGenerating(ebook.status);
  const failed = ebook.status === "FAILED";
  const completed = ebook.status === "COMPLETED";
  const balance = credits?.balance ?? null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← Back to your ebooks
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {ebook.title || (draft ? "Your ebook draft" : "Preparing your ebook…")}
          </h1>
          {ebook.subtitle && (
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">{ebook.subtitle}</p>
          )}
        </div>
        <StatusBadge status={ebook.status} />
      </div>

      {/* Draft — assets + generate */}
      {draft && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="rounded-xl border border-hairline bg-surface-2 p-4">
            <h2 className="text-sm font-semibold text-foreground-2">Assets (optional)</h2>
            <p className="mt-1 text-xs text-muted">
              Upload your own images — a logo, product shots, diagrams. Scrivetta will use the ones
              that fit (on the cover or in the right chapter) and leave the rest. You can add, change
              or remove them later in the editor too.
            </p>
            <div className="mt-4">
              <AssetManager state={assets} mode="draft" />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-300">Your balance</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {balance === null ? "…" : `${balance} credits`}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Generating reserves credits for your page count (about 1 per page); you&apos;re only
              billed for the pages actually produced.
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={startGeneration} loading={starting}>
              Generate ebook
            </Button>
            <ButtonLink href="/billing" variant="secondary">
              Buy credits
            </ButtonLink>
            <span className="text-xs text-zinc-400">
              This can take several minutes — you can watch progress here.
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      {!draft && !failed && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">{STAGE_MESSAGE[ebook.status]}</span>
            <span className="tabular-nums text-zinc-400">{ebook.progress}%</span>
          </div>
          <ProgressBar value={ebook.progress} />
          {active && (
            <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <Spinner className="h-3 w-3" /> Updating automatically…
            </p>
          )}
        </div>
      )}

      {/* Failure */}
      {failed && (
        <div className="mt-6 flex flex-col gap-4">
          <Alert>{ebook.errorMessage || "Generation failed. Please try again."}</Alert>
          <div>
            <ButtonLink href="/ebooks/new">Start a new ebook</ButtonLink>
          </div>
        </div>
      )}

      {/* Completed */}
      {completed && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">Your ebook is ready.</p>
          {ebook.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{ebook.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={download} loading={downloading}>
              Download PDF
            </Button>
            <ButtonLink href={`/ebooks/${ebook.id}/edit`} variant="secondary">
              Edit ebook
            </ButtonLink>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      )}

      {/* Chapters */}
      {ebook.chapters.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chapters</h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            {ebook.chapters.map((c) => {
              const done = c.status === "WRITTEN" || c.status === "EDITED";
              const chapterFailed = c.status === "FAILED";
              return (
                <li
                  key={c.chapterNumber}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                      chapterFailed
                        ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                        : done
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                    }`}
                  >
                    {done ? "✓" : c.chapterNumber}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                    {c.title || `Chapter ${c.chapterNumber}`}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {CHAPTER_STATUS_LABEL[c.status]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
