"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blueprintApi, ApiError } from "@/lib/api";
import type { Blueprint, BlueprintChapter, BlueprintOverview, BlueprintQuestion } from "@/lib/types";
import { Alert, Button, Spinner, controlBase } from "@/components/ui";

const POLL_MS = 2000;

interface DraftChapter {
  key: string;
  id: string | null;
  title: string;
  purpose: string;
}

interface DraftBook {
  workingTitle: string;
  audience: string;
  readerGoal: string;
  promise: string;
  chapters: DraftChapter[];
}

/**
 * The Book Blueprint: "Here's what Scrivetta understands" — the book, who it is
 * for, its goal and promise, and the proposed chapter structure (each chapter
 * showing which of the author's materials it draws on). Then "Before we write
 * your book, I need a few details": the few questions Scrivetta has. The author
 * can edit the structure, answer or skip questions, and approve; the blueprint
 * then becomes ready for writing.
 */

export function BlueprintStep({
  token,
  ebookId,
  refreshKey = 0,
  onStatus,
}: {
  token: string;
  ebookId: string;
  refreshKey?: number;
  /** Reports the blueprint status (the draft page gates "Generate" on it). */
  onStatus?: (status: BlueprintOverview["status"]) => void;
}) {
  const [overview, setOverviewState] = useState<BlueprintOverview | null>(null);
  const reportStatus = useRef(onStatus);
  useEffect(() => {
    reportStatus.current = onStatus;
  }, [onStatus]);
  const setOverview = useCallback((data: BlueprintOverview) => {
    setOverviewState(data);
    reportStatus.current?.(data.status);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftBook | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOverview(await blueprintApi.get(token, ebookId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load your blueprint.");
    }
  }, [token, ebookId, setOverview]);

  useEffect(() => {
    let active = true;
    blueprintApi
      .get(token, ebookId)
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Couldn't load your blueprint.");
      });
    return () => {
      active = false;
    };
  }, [token, ebookId, refreshKey, setOverview]);

  const building = overview?.status === "BUILDING_BLUEPRINT";
  useEffect(() => {
    if (!building) return;
    const t = setTimeout(load, POLL_MS);
    return () => clearTimeout(t);
  }, [building, overview, load]);

  async function run(label: string, action: () => Promise<BlueprintOverview>) {
    setError(null);
    setBusy(label);
    try {
      setOverview(await action());
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function build() {
    const force = !!overview?.userEdited && !!overview?.blueprint;
    if (
      force &&
      !window.confirm(
        "Rebuild the blueprint? Your edited and added chapters and your answers are kept, but Scrivetta proposes the rest of the structure again.",
      )
    ) {
      return;
    }
    await run("build", () => blueprintApi.build(token, ebookId, force));
  }

  function startEditing(bp: Blueprint) {
    setDraft({
      workingTitle: bp.workingTitle ?? "",
      audience: bp.audience ?? "",
      readerGoal: bp.readerGoal ?? "",
      promise: bp.promise ?? "",
      chapters: bp.chapters.map((c) => ({ key: c.id, id: c.id, title: c.title, purpose: c.purpose ?? "" })),
    });
  }

  async function saveEdits() {
    if (!draft) return;
    setSaving(true);
    const ok = await run("save", () =>
      blueprintApi.update(token, ebookId, {
        workingTitle: draft.workingTitle,
        audience: draft.audience,
        readerGoal: draft.readerGoal,
        promise: draft.promise,
        chapters: draft.chapters.map((c) => ({ id: c.id, title: c.title, purpose: c.purpose || null })),
      }),
    );
    setSaving(false);
    if (ok) setDraft(null);
  }

  // Nothing to show until the blueprint state is known.
  if (!overview) return null;

  const bp = overview.blueprint;
  const hasBlueprint = !!bp && ["BLUEPRINT_REVIEW", "QUESTIONS_REQUIRED", "BLUEPRINT_READY"].includes(overview.status);

  // ---- Nothing yet ----------------------------------------------------------
  if (!hasBlueprint && !building) {
    if (!overview.knowledgeReady && overview.status === "NOT_STARTED") return null;
    return (
      <Frame>
        <div className="flex flex-col gap-3">
          {overview.status === "FAILED" && <Alert>{overview.errorMessage || "Building the blueprint failed."}</Alert>}
          {error && <Alert>{error}</Alert>}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={build}
              loading={busy === "build"}
              disabled={!overview.knowledgeReady || !overview.buildAvailable}
            >
              {overview.status === "FAILED" ? "Try again" : "Build my blueprint"}
            </Button>
            <span className="text-xs text-muted">
              Scrivetta plans your book from what it learned: structure, chapters, and what&apos;s still missing.
            </span>
          </div>
        </div>
      </Frame>
    );
  }

  if (building) {
    return (
      <Frame>
        <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface p-4 text-sm text-foreground-2">
          <Spinner /> Scrivetta is planning your book from your knowledge…
        </div>
      </Frame>
    );
  }

  const chapterTitle = (id: string | null) => bp!.chapters.find((c) => c.id === id)?.title;
  const ready = overview.status === "BLUEPRINT_READY";
  const openQuestions = overview.questions.filter((q) => q.status === "OPEN").length;

  return (
    <Frame>
      <div className="flex flex-col gap-5">
        {overview.knowledgeOutdated && (
          <Alert variant="info">Your materials changed since this blueprint was built. Rebuild it to use them.</Alert>
        )}
        {error && <Alert>{error}</Alert>}

        {/* ---- Here's what Scrivetta understands ---- */}
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-semibold text-foreground">Here&apos;s what Scrivetta understands.</p>
            {!draft && (
              <button
                type="button"
                onClick={() => startEditing(bp!)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
              >
                Edit blueprint
              </button>
            )}
          </div>
          {bp!.concept && !draft && <p className="mt-1.5 text-sm leading-relaxed text-foreground-2">{bp!.concept}</p>}

          {draft ? (
            <EditForm
              draft={draft}
              setDraft={setDraft}
              onSave={saveEdits}
              onCancel={() => setDraft(null)}
              saving={saving}
            />
          ) : (
            <>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Fact label="Book" value={bp!.workingTitle} />
                <Fact label="For" value={bp!.audience} />
                <Fact label="Goal" value={bp!.readerGoal} />
                <Fact label="Promise" value={bp!.promise} />
              </dl>
              <h3 className="mt-5 text-xs font-medium uppercase tracking-[0.06em] text-muted">Structure</h3>
              {bp!.structureRationale && <p className="mt-1 text-xs text-faint">{bp!.structureRationale}</p>}
              <ol className="mt-2 flex flex-col gap-1.5">
                {bp!.chapters.map((c) => (
                  <ChapterRow
                    key={c.id}
                    chapter={c}
                    gaps={bp!.knowledgeGaps.filter((g) => c.gapIds.includes(g.id)).length}
                  />
                ))}
              </ol>
            </>
          )}
        </div>

        {/* ---- Questions ---- */}
        {overview.questions.length > 0 && (
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <p className="text-[15px] font-semibold text-foreground">
              Before we write your book, I need a few details.
            </p>
            <p className="mt-1 text-xs text-muted">
              Short answers are fine. Skip anything you don&apos;t want to answer — Scrivetta won&apos;t make it up.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {overview.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  index={i + 1}
                  question={q}
                  chapter={q.chapterTitle ?? chapterTitle(q.chapterId) ?? null}
                  busy={busy === q.id}
                  onAnswer={(answer) => run(q.id, () => blueprintApi.answer(token, ebookId, q.id, { answer }))}
                  onSkip={() => run(q.id, () => blueprintApi.answer(token, ebookId, q.id, { skip: true }))}
                />
              ))}
            </ul>
          </div>
        )}

        {overview.warnings.length > 0 && (
          <ul className="text-xs text-muted">
            {overview.warnings.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        )}

        {/* ---- Status / actions ---- */}
        {ready ? (
          <Alert variant="success">
            Your blueprint is ready. Writing your book from it is the next step — coming soon. Until then you can still
            generate a book the classic way below.
          </Alert>
        ) : overview.status === "BLUEPRINT_REVIEW" ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => run("approve", () => blueprintApi.approve(token, ebookId))}
              loading={busy === "approve"}
            >
              Approve blueprint
            </Button>
            <span className="text-xs text-muted">
              Your materials cover what the book needs — no questions this time.
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted">
            {openQuestions === 1 ? "1 question left." : `${openQuestions} questions left.`} Your blueprint is ready once
            each is answered or skipped.
          </p>
        )}

        {!draft && (
          <div>
            <button
              type="button"
              onClick={build}
              disabled={busy === "build" || !overview.buildAvailable}
              className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
            >
              Rebuild blueprint
            </button>
          </div>
        )}
      </div>
    </Frame>
  );
}

// ---- Pieces ----------------------------------------------------------------

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-hairline bg-surface-2 p-4">
      <h2 className="text-[15px] font-semibold text-foreground">Your book blueprint</h2>
      <p className="mb-4 mt-1 text-xs text-muted">
        The plan of your book, built from your knowledge: its structure, what each chapter draws on, and what Scrivetta
        still needs to know.
      </p>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function shortSource(ref: string) {
  if (ref === "user-notes") return "your notes";
  const path = ref.includes("!/") ? ref.split("!/")[1] : ref;
  return path.split("/").pop() || path;
}

function ChapterRow({ chapter, gaps }: { chapter: BlueprintChapter; gaps: number }) {
  const sources = chapter.sourceReferences;
  return (
    <li className="rounded-lg border border-hairline bg-surface-2 px-3.5 py-2.5">
      <div className="flex items-baseline gap-2.5">
        <span className="shrink-0 font-mono text-[11px] text-faint">{String(chapter.order).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {chapter.title}
            {chapter.origin === "AUTHOR" && (
              <span className="ml-2 text-[10px] font-normal text-faint">added by you</span>
            )}
          </p>
          {chapter.purpose && <p className="mt-0.5 text-xs text-muted">{chapter.purpose}</p>}
          {(sources.length > 0 || gaps > 0) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {sources.slice(0, 4).map((s) => (
                <span
                  key={s}
                  title={s}
                  className="rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted"
                >
                  {shortSource(s)}
                </span>
              ))}
              {sources.length > 4 && <span className="text-[10px] text-faint">+{sources.length - 4}</span>}
              {gaps > 0 && (
                <span className="rounded-md bg-warn-soft px-1.5 py-0.5 text-[10px] text-foreground-2">
                  {gaps === 1 ? "1 open point" : `${gaps} open points`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function QuestionCard({
  index,
  question,
  chapter,
  busy,
  onAnswer,
  onSkip,
}: {
  index: number;
  question: BlueprintQuestion;
  chapter: string | null;
  busy: boolean;
  onAnswer: (answer: string) => Promise<boolean>;
  onSkip: () => Promise<boolean>;
}) {
  const [text, setText] = useState(question.answer ?? "");
  const [editing, setEditing] = useState(question.status === "OPEN");

  return (
    <li className="rounded-lg border border-hairline bg-surface-2 p-3.5">
      <p className="text-[11px] text-faint">
        Question {index}
        {chapter && <> · {chapter}</>}
        {question.status === "ANSWERED" && <span className="ml-1 text-good">· answered</span>}
        {question.status === "SKIPPED" && <span className="ml-1">· skipped</span>}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{question.question}</p>
      {question.reason && <p className="mt-0.5 text-xs text-muted">{question.reason}</p>}
      {editing ? (
        <div className="mt-2.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
            placeholder="Your answer…"
            className={`min-h-20 w-full resize-y text-base leading-relaxed sm:text-sm ${controlBase}`}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              onClick={async () => {
                if (await onAnswer(text)) setEditing(false);
              }}
              loading={busy}
              disabled={!text.trim()}
              className="px-3 py-1.5 text-xs"
            >
              Save answer
            </Button>
            {question.status !== "SKIPPED" && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (await onSkip()) setEditing(false);
                }}
                className="rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-foreground"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-start gap-2">
          {question.status === "ANSWERED" && (
            <p className="min-w-0 flex-1 whitespace-pre-line text-sm text-foreground-2">{question.answer}</p>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-auto shrink-0 rounded-md px-2 py-1 text-xs text-accent hover:bg-accent-soft"
          >
            {question.status === "ANSWERED" ? "Edit" : "Answer"}
          </button>
        </div>
      )}
    </li>
  );
}

function EditForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
}: {
  draft: DraftBook;
  setDraft: (d: DraftBook) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const set = (patch: Partial<DraftBook>) => setDraft({ ...draft, ...patch });
  const setChapter = (i: number, patch: Partial<DraftChapter>) =>
    set({ chapters: draft.chapters.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.chapters.length) return;
    const next = [...draft.chapters];
    [next[i], next[j]] = [next[j], next[i]];
    set({ chapters: next });
  };
  const invalid =
    !draft.workingTitle.trim() || draft.chapters.length === 0 || draft.chapters.some((c) => !c.title.trim());

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Labeled label="Book title">
          <input
            value={draft.workingTitle}
            onChange={(e) => set({ workingTitle: e.target.value })}
            className={`w-full ${controlBase}`}
          />
        </Labeled>
        <Labeled label="For">
          <input
            value={draft.audience}
            onChange={(e) => set({ audience: e.target.value })}
            className={`w-full ${controlBase}`}
          />
        </Labeled>
        <Labeled label="Goal">
          <input
            value={draft.readerGoal}
            onChange={(e) => set({ readerGoal: e.target.value })}
            className={`w-full ${controlBase}`}
          />
        </Labeled>
        <Labeled label="Promise">
          <input
            value={draft.promise}
            onChange={(e) => set({ promise: e.target.value })}
            className={`w-full ${controlBase}`}
          />
        </Labeled>
      </div>

      <h3 className="mt-2 text-xs font-medium uppercase tracking-[0.06em] text-muted">Chapters</h3>
      <ol className="flex flex-col gap-2">
        {draft.chapters.map((c, i) => (
          <li key={c.key} className="rounded-lg border border-hairline bg-surface-2 p-3">
            <div className="flex items-center gap-2">
              <span className="w-6 shrink-0 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <input
                aria-label={`Chapter ${i + 1} title`}
                value={c.title}
                onChange={(e) => setChapter(i, { title: e.target.value })}
                className={`min-w-0 flex-1 ${controlBase}`}
              />
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === draft.chapters.length - 1}>
                ↓
              </IconButton>
              <IconButton
                label="Remove chapter"
                onClick={() => set({ chapters: draft.chapters.filter((_, j) => j !== i) })}
                disabled={draft.chapters.length === 1}
              >
                ✕
              </IconButton>
            </div>
            <textarea
              aria-label={`Chapter ${i + 1} purpose`}
              value={c.purpose}
              onChange={(e) => setChapter(i, { purpose: e.target.value })}
              placeholder="What is this chapter for?"
              className={`mt-2 min-h-14 w-full resize-y text-sm ${controlBase}`}
            />
          </li>
        ))}
      </ol>
      <div>
        <button
          type="button"
          onClick={() =>
            set({
              chapters: [...draft.chapters, { key: `new-${Date.now()}`, id: null, title: "", purpose: "" }],
            })
          }
          className="rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
        >
          + Add chapter
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onSave} loading={saving} disabled={invalid}>
          Save changes
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm text-muted hover:bg-surface-3 hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}
