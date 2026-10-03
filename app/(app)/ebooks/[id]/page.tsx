"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import { useAssets } from "@/lib/use-assets";
import type { BookDepth, BookScopeResponse, EbookStatusResponse } from "@/lib/types";
import { StatusBadge, ProgressBar } from "@/components/ebook-ui";
import { AssetManager } from "@/components/asset-manager";
import { KnowledgeStep } from "@/components/knowledge-step";
import { BlueprintStep } from "@/components/blueprint-step";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";
import { DepthPicker } from "@/components/depth-picker";
import {
  CHAPTER_STATUS_LABEL,
  SCOPE_BASIS_LABEL,
  STAGE_MESSAGE,
  approxRange,
  inBook,
  isGenerating,
  isTerminal,
} from "@/lib/ebook-format";

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
  // The draft's scope: Scrivetta's length + credit estimate for the chosen depth.
  const [scope, setScope] = useState<BookScopeResponse | null>(null);
  const [savingDepth, setSavingDepth] = useState(false);
  // Bumped when the knowledge step hands over to the blueprint step.
  const [blueprintKey, setBlueprintKey] = useState(0);
  // Knowledge flow state: a book with materials is written from its blueprint, so
  // "Generate" waits until the blueprint is ready.
  const [hasMaterials, setHasMaterials] = useState(false);
  const [blueprintStatus, setBlueprintStatus] = useState<string>("NOT_STARTED");
  const [resuming, setResuming] = useState(false);

  // The draft's scope — re-estimated whenever what Scrivetta knows changes
  // (materials, blueprint) — drives the depth picker, the estimate and whether
  // the Generate button is enabled.
  const isDraft = ebook?.status === "DRAFT";
  useEffect(() => {
    if (!token || !id || !isDraft) return;
    let active = true;
    ebookApi
      .scope(token, id)
      .then((s) => {
        if (active) setScope(s);
      })
      .catch(() => {
        /* non-fatal */
      });
    return () => {
      active = false;
    };
  }, [token, id, isDraft, reloadKey, blueprintKey, blueprintStatus, hasMaterials]);

  const changeDepth = useCallback(
    async (depth: BookDepth) => {
      if (!token || !ebook || savingDepth || depth === scope?.depth) return;
      setSavingDepth(true);
      setError(null);
      try {
        setScope(await ebookApi.updateDepth(token, ebook.id, depth));
        setEbook({ ...ebook, depth, errorMessage: null });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't change the depth.");
      } finally {
        setSavingDepth(false);
      }
    },
    [token, ebook, savingDepth, scope?.depth],
  );

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
        const body = err.body as { required?: number; available?: number; message?: string } | undefined;
        setError(
          body?.message ??
            `This book needs up to ${body?.required ?? "more"} credits but you have ${body?.available ?? 0}. Buy more to generate.`,
        );
        credits?.refresh();
        setReloadKey((k) => k + 1); // refresh the scope
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't start generation.");
      }
    } finally {
      setStarting(false);
    }
  }, [token, ebook, credits]);

  const resumeGeneration = useCallback(async () => {
    if (!token || !ebook) return;
    setResuming(true);
    setError(null);
    try {
      setEbook(await ebookApi.resume(token, ebook.id));
      credits?.refresh();
      setReloadKey((k) => k + 1); // poll again
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        const body = err.body as { required?: number; available?: number; message?: string } | undefined;
        setError(
          body?.message ?? `You need ${body?.required ?? "more"} credits but have ${body?.available ?? 0}. Buy more to resume.`,
        );
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't resume generation.");
      }
    } finally {
      setResuming(false);
    }
  }, [token, ebook, credits]);

  const download = useCallback(async () => {
    if (!token || !ebook) return;
    setDownloading(true);
    setError(null);
    try {
      // The server answers with a signed link; the browser then downloads the
      // PDF natively (the filename comes from the response's Content-Disposition).
      await ebookApi.download(token, ebook.id);
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
  const balance = credits?.balance ?? scope?.balance ?? null;
  // Credits needed to start: the high end of the estimate (mirrors the backend
  // gate). Undecided until the scope loads, so we don't flash a "not enough" state.
  const required = scope?.requiredCredits ?? null;
  const insufficient = balance !== null && required !== null && balance < required;
  const estimate = scope?.estimate ?? null;
  const startEstimate =
    ebook.estimatedPagesLow && ebook.estimatedPagesHigh
      ? approxRange(ebook.estimatedPagesLow, ebook.estimatedPagesHigh)
      : null;
  const deferred = ebook.chapters.filter((c) => c.status === "DEFERRED");
  const knowledgeFlow = hasMaterials || blueprintStatus !== "NOT_STARTED";
  const blueprintReady = blueprintStatus === "BLUEPRINT_READY";
  const waitingForBlueprint = knowledgeFlow && !blueprintReady;
  const knowledgeBased = ebook.generationMode === "KNOWLEDGE";
  const stageMessage =
    knowledgeBased && ebook.status === "PLANNING"
      ? "Preparing the chapters from your blueprint…"
      : knowledgeBased && ebook.status === "WRITING"
        ? "Writing each chapter from your knowledge, blueprint and answers…"
        : STAGE_MESSAGE[ebook.status];

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
          {token && (
            <section className="rounded-xl border border-hairline bg-surface-2 p-4">
              <h2 className="text-[15px] font-semibold text-foreground">Tell Scrivetta what you know</h2>
              <p className="mt-1 text-xs text-muted">
                Upload your existing materials, notes, project files or other information. Scrivetta
                will use them to understand your knowledge before building your book.
              </p>
              <div className="mt-4">
                <KnowledgeStep
                  token={token}
                  ebookId={ebook.id}
                  onContinued={() => setBlueprintKey((k) => k + 1)}
                  onHasMaterials={setHasMaterials}
                />
              </div>
            </section>
          )}

          {token && (
            <BlueprintStep token={token} ebookId={ebook.id} refreshKey={blueprintKey} onStatus={setBlueprintStatus} />
          )}

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

          <section className="rounded-xl border border-hairline bg-surface-2 p-4">
            <h2 className="text-[15px] font-semibold text-foreground">Depth &amp; estimated length</h2>
            <p className="mt-1 text-xs text-muted">
              Choose how deep the book should go. Scrivetta works out the length from your topic,
              materials and depth.
            </p>
            <div className="mt-4">
              <DepthPicker
                options={scope?.options ?? null}
                value={scope?.depth ?? ebook.depth ?? "STANDARD"}
                onChange={changeDepth}
                disabled={savingDepth}
              />
            </div>

            {ebook.errorMessage && <div className="mt-4"><Alert>{ebook.errorMessage}</Alert></div>}

            <dl className="mt-4 grid gap-1 border-t border-hairline pt-3 text-sm">
              <ScopeRow
                label="Estimated length"
                value={estimate ? `${approxRange(estimate.pagesLow, estimate.pagesHigh)} pages` : "…"}
              />
              <ScopeRow
                label="Estimated chapters"
                value={estimate ? approxRange(estimate.chaptersLow, estimate.chaptersHigh) : "…"}
              />
              <ScopeRow
                label="Estimated credits"
                value={estimate ? `${approxRange(estimate.creditsLow, estimate.creditsHigh)} credits` : "…"}
              />
              {scope?.plannedPages ? (
                <ScopeRow label="Last plan" value={`~${scope.plannedPages} pages`} />
              ) : null}
              <ScopeRow label="Your balance" value={balance === null ? "…" : `${balance} credits`} />
            </dl>
            <p className="mt-3 border-t border-hairline pt-3 text-xs text-muted">
              {estimate && SCOPE_BASIS_LABEL[estimate.basis]}{" "}
              {insufficient
                ? `To generate, you need up to ${required} credits — the high end of the estimate, so the book is never cut short to fit your balance. Add credits or choose a lighter depth.`
                : "These are estimates, not limits: the finished book may be shorter or longer if its content needs it. You're only billed for the pages actually produced (1 credit = 1 page)."}
              {estimate?.capped && " Your materials suggest more than one book can hold — consider splitting them into several books."}
            </p>
          </section>

          {error && <Alert>{error}</Alert>}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={startGeneration}
              loading={starting}
              disabled={insufficient || waitingForBlueprint || savingDepth || scope === null}
            >
              {blueprintReady ? "Generate my book" : "Generate ebook"}
            </Button>
            <ButtonLink href="/billing" variant="secondary">
              Buy credits
            </ButtonLink>
            <span className="text-xs text-zinc-400">
              {insufficient
                ? `This book needs up to ${required} credits to generate.`
                : waitingForBlueprint
                  ? "Finish the steps above first — your book is written from your knowledge and blueprint."
                  : "This can take several minutes — you can watch progress here."}
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      {!draft && !failed && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">{stageMessage}</span>
            <span className="tabular-nums text-zinc-400">{ebook.progress}%</span>
          </div>
          <ProgressBar value={ebook.progress} />
          {(ebook.plannedPages || startEstimate) && (
            <p className="mt-2 text-xs text-muted">
              {ebook.plannedPages
                ? `Planned at ~${ebook.plannedPages} pages`
                : `Estimated ${startEstimate} pages`}{" "}
              · the final length follows the content.
            </p>
          )}
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
          {ebook.resumable && (
            <p className="text-xs text-muted">
              Your credits were refunded. The chapters already written are kept — resuming writes only the missing
              ones.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {ebook.resumable && (
              <Button onClick={resumeGeneration} loading={resuming}>
                Resume generation
              </Button>
            )}
            <ButtonLink href="/ebooks/new" variant={ebook.resumable ? "secondary" : "primary"}>
              Start a new ebook
            </ButtonLink>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {/* Completed */}
      {completed && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">Your ebook is ready.</p>
          {ebook.actualPageCount > 0 && (
            <p className="mt-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">
              {ebook.actualPageCount} pages
              {startEstimate ? ` (estimated ${startEstimate})` : ""} · {ebook.creditsCharged} credits used
              {balance !== null && ` · ${balance} credits remaining`}
            </p>
          )}
          {(ebook.creditLimited || deferred.length > 0) && (
            <p className="mt-2 text-xs text-emerald-900/80 dark:text-emerald-200/80">
              This book ran longer than your credits covered, so it was brought to a complete ending
              early
              {deferred.length > 0
                ? ` and ${deferred.length === 1 ? "1 planned chapter was" : `${deferred.length} planned chapters were`} left out. They're listed below as “saved for later”.`
                : "."}
            </p>
          )}
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
            {[...inBook(ebook.chapters), ...deferred].map((c) => {
              const done = c.status === "WRITTEN" || c.status === "EDITED";
              const chapterFailed = c.status === "FAILED";
              const isDeferred = c.status === "DEFERRED";
              return (
                <li
                  key={c.chapterNumber}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
                    isDeferred
                      ? "border-dashed border-zinc-200 bg-transparent opacity-70 dark:border-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
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
                    {done ? "✓" : isDeferred ? "–" : c.chapterNumber}
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

function ScopeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
