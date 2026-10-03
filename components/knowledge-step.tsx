"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blueprintApi, knowledgeApi, ApiError } from "@/lib/api";
import type { KnowledgeOverview, KnowledgeSource, KnowledgeStatus } from "@/lib/types";
import { Alert, Button, Spinner, controlBase } from "@/components/ui";

const ACCEPT = ".zip,.rar,.pdf,.docx,.txt,.md,.markdown";
const ACCEPTED_EXT = ["zip", "rar", "pdf", "docx", "txt", "md", "markdown"];
/** Archives are unpacked on the server and each file inside is read with its path. */
const ARCHIVE_TYPES = ["ZIP", "RAR"];
const POLL_MS = 2000;

const RUNNING: KnowledgeStatus[] = ["PROCESSING", "ANALYZING"];

const STAGE_LABEL: Partial<Record<KnowledgeStatus, string>> = {
  PROCESSING: "Reading and organising your materials…",
  ANALYZING: "Scrivetta is learning from your materials…",
};

const SOURCE_LABEL: Record<string, string> = {
  ZIP: "ZIP",
  RAR: "RAR",
  PDF: "PDF",
  DOCX: "Word",
  TXT: "Text",
  MD: "Markdown",
  NOTES: "Your notes",
};

interface UploadState {
  key: string;
  name: string;
  pct: number;
  error?: string;
}

/**
 * "Tell Scrivetta what you know": the author uploads existing materials
 * (ZIP / RAR / PDF / DOCX / TXT / MD) and/or pastes notes, then Scrivetta processes
 * them into structured book knowledge. Shows the result ("Scrivetta has learned
 * from your materials") and a Continue button that marks the book ready for the
 * Book Blueprint step.
 */
export function KnowledgeStep({
  token,
  ebookId,
  onContinued,
  onHasMaterials,
}: {
  token: string;
  ebookId: string;
  /** Called once the author continues and the blueprint build has been started. */
  onContinued?: () => void;
  /** Reports whether the book has any materials (then it is written from them, not the brief). */
  onHasMaterials?: (has: boolean) => void;
}) {
  const [overview, setOverview] = useState<KnowledgeOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [starting, setStarting] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notesLoaded = useRef(false);
  const reportMaterials = useRef(onHasMaterials);
  useEffect(() => {
    reportMaterials.current = onHasMaterials;
  }, [onHasMaterials]);

  const apply = useCallback((data: KnowledgeOverview) => {
    setOverview(data);
    reportMaterials.current?.(data.sources.length > 0);
    // Show the saved notes once; after that the textarea is the author's.
    if (!notesLoaded.current) {
      notesLoaded.current = true;
      setNotes(data.notes ?? "");
      setNotesSaved(data.notes ?? "");
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await knowledgeApi.overview(token, ebookId);
      apply(data);
      return data;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your materials.");
      return null;
    }
  }, [token, ebookId, apply]);

  useEffect(() => {
    let active = true;
    knowledgeApi
      .overview(token, ebookId)
      .then((data) => {
        if (active) apply(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Couldn't load your materials.");
      });
    return () => {
      active = false;
    };
  }, [token, ebookId, apply]);

  // Poll while a processing run is in flight.
  const status = overview?.status;
  const running = status ? RUNNING.includes(status) : false;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(load, POLL_MS);
    return () => clearTimeout(t);
  }, [running, overview, load]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        const max = overview?.limits.maxUploadBytes ?? 25 * 1024 * 1024;
        if (!ACCEPTED_EXT.includes(ext)) {
          setUploads((u) => [...u, { key, name: file.name, pct: 0, error: "Unsupported file type — use ZIP, RAR, PDF, DOCX, TXT or MD" }]);
          continue;
        }
        if (file.size > max) {
          setUploads((u) => [
            ...u,
            { key, name: file.name, pct: 0, error: `Larger than ${Math.round(max / 1024 / 1024)} MB` },
          ]);
          continue;
        }
        setUploads((u) => [...u, { key, name: file.name, pct: 0 }]);
        knowledgeApi
          .upload(token, ebookId, file, (pct) =>
            setUploads((u) => u.map((it) => (it.key === key ? { ...it, pct } : it))),
          )
          .then(() => {
            setUploads((u) => u.filter((it) => it.key !== key));
            load();
          })
          .catch((err) => {
            const msg = err instanceof ApiError ? err.message : "Upload failed";
            setUploads((u) => u.map((it) => (it.key === key ? { ...it, error: msg } : it)));
          });
      }
    },
    [token, ebookId, overview, load],
  );

  async function saveNotes(): Promise<boolean> {
    if (notes === notesSaved) return true;
    setSavingNotes(true);
    setError(null);
    try {
      await knowledgeApi.setNotes(token, ebookId, notes);
      setNotesSaved(notes);
      await load();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your notes.");
      return false;
    } finally {
      setSavingNotes(false);
    }
  }

  async function removeSource(source: KnowledgeSource) {
    setError(null);
    try {
      await knowledgeApi.removeSource(token, ebookId, source.id);
      if (source.sourceType === "NOTES") {
        setNotes("");
        setNotesSaved("");
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove that source.");
    }
  }

  async function startProcessing() {
    setError(null);
    setStarting(true);
    try {
      if (!(await saveNotes())) return;
      const data = await knowledgeApi.process(token, ebookId);
      setOverview(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start processing.");
    } finally {
      setStarting(false);
    }
  }

  async function continueToBlueprint() {
    setError(null);
    setContinuing(true);
    try {
      setOverview(await knowledgeApi.continue(token, ebookId));
      try {
        await blueprintApi.build(token, ebookId);
      } catch (err) {
        // 409 = already building / already built: the blueprint step shows its state.
        if (!(err instanceof ApiError && err.status === 409)) throw err;
      }
      onContinued?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't continue.");
    } finally {
      setContinuing(false);
    }
  }

  if (!overview) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Loading…
      </div>
    );
  }

  const files = overview.sources.filter((s) => s.sourceType !== "NOTES");
  const hasMaterial = overview.sources.length > 0 || notes.trim().length > 0;
  const notesDirty = notes !== notesSaved;
  const summary = overview.summary;
  const processedBefore = (overview.usage?.processingRuns ?? 0) > 0;

  // ---- Result: knowledge learned -------------------------------------------
  if (overview.hasKnowledge && summary && !notesDirty) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[color-mix(in_oklab,var(--good)_35%,transparent)] bg-good-soft p-5">
          <p className="text-[15px] font-semibold text-foreground">Scrivetta has learned from your materials.</p>
          {summary.overallSummary && (
            <p className="mt-1.5 text-sm leading-relaxed text-foreground-2">{summary.overallSummary}</p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Project" value={summary.projectName || "—"} wide />
            <Stat label="Topics found" value={summary.topicsFound} />
            <Stat label="Processes found" value={summary.processesFound} />
            <Stat label="Sources analysed" value={summary.documentsAnalyzed} />
            <Stat label="Potential knowledge gaps" value={summary.knowledgeGaps} />
          </dl>
          {summary.topTopics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {summary.topTopics.map((t) => (
                <span key={t} className="rounded-full border border-hairline-2 bg-surface px-2.5 py-1 text-xs text-foreground-2">
                  {t}
                </span>
              ))}
            </div>
          )}
          {summary.gapQuestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted">Things your materials don&apos;t explain yet</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-foreground-2">
                {summary.gapQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          {overview.warnings.length > 0 && (
            <ul className="mt-3 text-xs text-muted">
              {overview.warnings.map((w) => (
                <li key={w}>· {w}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <Alert>{error}</Alert>}

        {overview.readyForBlueprint ? (
          <p className="text-xs text-muted">
            Your knowledge is saved. Scrivetta uses it for your book blueprint below.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={continueToBlueprint} loading={continuing}>
              Continue
            </Button>
            <span className="text-xs text-muted">You can still add materials below and process again.</span>
          </div>
        )}

        <details className="rounded-xl border border-hairline bg-surface-2 p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground-2">Add or change materials</summary>
          <div className="mt-4">{renderInputs()}</div>
        </details>
      </div>
    );
  }

  // ---- Input + processing --------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {renderInputs()}

      {error && <Alert>{error}</Alert>}
      {overview.status === "FAILED" && overview.errorMessage && <Alert>{overview.errorMessage}</Alert>}
      {!overview.processingAvailable && (
        <Alert variant="info">Knowledge processing isn&apos;t available on this server yet.</Alert>
      )}

      {running ? (
        <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface p-4 text-sm text-foreground-2">
          <Spinner /> {STAGE_LABEL[overview.status] ?? "Working…"}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={startProcessing}
            loading={starting}
            disabled={!hasMaterial || !overview.processingAvailable || uploads.some((u) => !u.error)}
          >
            {processedBefore ? "Process again" : "Let Scrivetta learn"}
          </Button>
          <span className="text-xs text-muted">
            {hasMaterial
              ? "Scrivetta reads your materials and organises what you know. This usually takes a minute or two."
              : "Add at least one file or some notes."}
          </span>
        </div>
      )}
    </div>
  );

  function renderInputs() {
    return (
      <div className="flex flex-col gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !running && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-disabled={running}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !running) inputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-7 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft" : "border-hairline-2 bg-surface hover:border-accent"
          } ${running ? "pointer-events-none opacity-60" : ""}`}
        >
          <span className="text-sm font-medium text-foreground-2">Upload your materials</span>
          <span className="text-xs text-faint">
            ZIP or RAR (e.g. a whole project), PDF, DOCX, TXT or MD · up to{" "}
            {Math.round(overview!.limits.maxUploadBytes / 1024 / 1024)} MB each
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {uploads.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {uploads.map((u) => (
              <li key={u.key} className="flex items-center gap-3 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate text-foreground-2">{u.name}</span>
                {u.error ? (
                  <span className="shrink-0 text-red-600 dark:text-red-400">{u.error}</span>
                ) : u.pct >= 100 ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-faint">
                    <Spinner className="h-3 w-3" /> Reading…
                  </span>
                ) : (
                  <span className="flex w-28 shrink-0 items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <span className="block h-full rounded-full bg-accent transition-all" style={{ width: `${u.pct}%` }} />
                    </span>
                    <span className="tabular-nums text-faint">{u.pct}%</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {files.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {files.map((s) => (
              <SourceRow key={s.id} source={s} disabled={running} onRemove={() => removeSource(s)} />
            ))}
          </ul>
        )}

        <div>
          <label htmlFor="knowledge-notes" className="mb-1.5 block text-xs font-medium text-muted">
            Your notes <span className="font-normal text-faint">· anything you know, in any order</span>
          </label>
          <textarea
            id="knowledge-notes"
            value={notes}
            disabled={running}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notesDirty) saveNotes();
            }}
            maxLength={overview!.limits.maxNotesChars}
            placeholder={"First create the project.\nThen dependencies.\nI had problems with JWT — need to explain why we use it."}
            className={`min-h-32 w-full resize-y text-base leading-relaxed sm:text-sm ${controlBase}`}
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-faint">
            {savingNotes ? (
              <>
                <Spinner className="h-3 w-3" /> Saving…
              </>
            ) : notesDirty ? (
              "Not saved yet — saved when you leave the field or start processing."
            ) : notesSaved.trim() ? (
              "Saved. Rough notes are fine — Scrivetta will work out what you mean."
            ) : (
              "Rough notes are fine — Scrivetta will work out what you mean."
            )}
          </p>
        </div>
      </div>
    );
  }
}

function SourceRow({
  source,
  disabled,
  onRemove,
}: {
  source: KnowledgeSource;
  disabled: boolean;
  onRemove: () => void;
}) {
  const failed = source.status === "FAILED";
  const detail = failed
    ? source.errorMessage || "Could not be read"
    : ARCHIVE_TYPES.includes(source.sourceType)
      ? `${source.documentCount} file${source.documentCount === 1 ? "" : "s"} read${
          source.skippedCount ? ` · ${source.skippedCount} skipped` : ""
        }`
      : `${source.extractedChars.toLocaleString("en")} characters`;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs">
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
          failed ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "bg-surface-3 text-muted"
        }`}
      >
        {SOURCE_LABEL[source.sourceType] ?? source.sourceType}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground-2">{source.filename}</span>
        <span className={`block ${failed ? "break-words text-red-600 dark:text-red-400" : "truncate text-faint"}`}>{detail}</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="shrink-0 rounded-md px-2 py-1 text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-50"
      >
        Remove
      </button>
    </li>
  );
}

function Stat({ label, value, wide = false }: { label: string; value: string | number; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-hairline bg-surface px-3 py-2 ${wide ? "col-span-2 sm:col-span-4" : ""}`}>
      <dt className="text-[10px] uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
