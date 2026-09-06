"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookContentResponse } from "@/lib/types";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";

/**
 * A chapter as the editor holds it. `key` is a stable client-side id used for
 * React keys and selection; `id` is the server id (null for a chapter the user
 * just added, which the backend will create on save). The body is kept as HTML
 * for TipTap and converted to/from Markdown at load and save.
 */
interface EditableChapter {
  key: string;
  id: string | null;
  title: string;
  html: string;
}

function newKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `k_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function toEditable(data: EbookContentResponse): EditableChapter[] {
  return data.chapters.map((c) => ({
    key: newKey(),
    id: c.id,
    title: c.title ?? "",
    html: markdownToHtml(c.content),
  }));
}

export default function EbookEditPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const { token } = useAuth();

  const [meta, setMeta] = useState<EbookContentResponse | null>(null);
  const [chapters, setChapters] = useState<EditableChapter[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load the manuscript once.
  useEffect(() => {
    if (!token || !id) return;
    let active = true;
    (async () => {
      try {
        const data = await ebookApi.getContent(token, id);
        if (!active) return;
        setMeta(data);
        const editable = toEditable(data);
        setChapters(editable);
        setActiveKey(editable[0]?.key ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : "Couldn't load this ebook.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token, id]);

  // Warn before leaving with unsaved edits (browser navigation / refresh).
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const activeIndex = useMemo(
    () => chapters.findIndex((c) => c.key === activeKey),
    [chapters, activeKey],
  );
  const active = activeIndex >= 0 ? chapters[activeIndex] : null;

  const touch = useCallback(() => {
    setDirty(true);
    setSaved(false);
  }, []);

  const patchActive = useCallback(
    (patch: Partial<EditableChapter>) => {
      setChapters((prev) =>
        prev.map((c) => (c.key === activeKey ? { ...c, ...patch } : c)),
      );
      touch();
    },
    [activeKey, touch],
  );

  const addChapter = useCallback(() => {
    const chapter: EditableChapter = { key: newKey(), id: null, title: "", html: "" };
    setChapters((prev) => [...prev, chapter]);
    setActiveKey(chapter.key);
    touch();
  }, [touch]);

  const removeChapter = useCallback(
    (key: string) => {
      setChapters((prev) => {
        if (prev.length <= 1) return prev; // a book must keep at least one chapter
        const idx = prev.findIndex((c) => c.key === key);
        const next = prev.filter((c) => c.key !== key);
        // Keep a sensible chapter selected after removal.
        if (key === activeKey) {
          const fallback = next[Math.min(idx, next.length - 1)];
          setActiveKey(fallback?.key ?? null);
        }
        return next;
      });
      touch();
    },
    [activeKey, touch],
  );

  const move = useCallback(
    (key: string, delta: -1 | 1) => {
      setChapters((prev) => {
        const idx = prev.findIndex((c) => c.key === key);
        const target = idx + delta;
        if (idx < 0 || target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        [next[idx], next[target]] = [next[target], next[idx]];
        return next;
      });
      touch();
    },
    [touch],
  );

  const save = useCallback(async () => {
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const prevActiveIndex = activeIndex;
    try {
      const updated = await ebookApi.saveContent(token, id, {
        chapters: chapters.map((c) => ({
          id: c.id,
          title: c.title,
          content: htmlToMarkdown(c.html),
        })),
      });
      setMeta(updated);
      // Rebuild from the authoritative response (fresh ids + order), keeping the
      // same chapter selected by position.
      const rebuilt = toEditable(updated);
      setChapters(rebuilt);
      const keep = rebuilt[Math.min(Math.max(prevActiveIndex, 0), rebuilt.length - 1)];
      setActiveKey(keep?.key ?? null);
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [token, id, chapters, activeIndex]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner /> Loading your manuscript…
      </div>
    );
  }

  if (error && !meta) {
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

  if (meta && !meta.editable) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert variant="info">
          This ebook isn&apos;t ready to edit yet — it&apos;s still being generated.
        </Alert>
        <div className="mt-4">
          <ButtonLink href={`/ebooks/${id}`} variant="secondary">
            Back to this ebook
          </ButtonLink>
        </div>
      </div>
    );
  }

  const canRemove = chapters.length > 1;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/ebooks/${id}`} className="text-sm text-muted hover:underline">
            ← Back to this ebook
          </Link>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
            {meta?.title || "Edit your ebook"}
          </h1>
          {meta?.subtitle && <p className="mt-1 text-muted">{meta.subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && <span className="text-sm text-good">Saved ✓</span>}
          {dirty && <span className="text-sm text-muted">Unsaved changes</span>}
          <Button onClick={save} loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <p className="mt-2 text-xs text-faint">
        Add, remove or reorder chapters and edit their text. Saving re-renders the
        downloadable PDF. Editing is free.
      </p>

      {/* Editor + chapter navigation */}
      <div className="mt-6 grid gap-6 md:grid-cols-[16rem_1fr]">
        {/* Chapter list */}
        <aside className="md:sticky md:top-6 md:self-start">
          <h2 className="mb-2 text-sm font-semibold text-foreground-2">Chapters</h2>
          <ul className="flex flex-col gap-1">
            {chapters.map((c, i) => {
              const isActive = c.key === activeKey;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => setActiveKey(c.key)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-accent-soft text-accent-ink"
                        : "text-foreground-2 hover:bg-surface-2"
                    }`}
                  >
                    <span className="shrink-0 tabular-nums text-xs text-faint">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {c.title || `Chapter ${i + 1}`}
                    </span>
                    {!c.id && (
                      <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                        new
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={addChapter}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-hairline-2 px-3 py-2 text-sm text-foreground-2 transition-colors hover:border-accent hover:text-accent-ink"
          >
            + Add chapter
          </button>
        </aside>

        {/* Active chapter editor */}
        <section className="min-w-0">
          {active ? (
            <>
              {/* Per-chapter controls: reorder + delete */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-muted">
                  Chapter {activeIndex + 1} of {chapters.length}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => move(active.key, -1)}
                    disabled={activeIndex === 0}
                    aria-label="Move chapter up"
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => move(active.key, 1)}
                    disabled={activeIndex === chapters.length - 1}
                    aria-label="Move chapter down"
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${active.title || `Chapter ${activeIndex + 1}`}"? This can't be undone once you save.`,
                        )
                      ) {
                        removeChapter(active.key);
                      }
                    }}
                    disabled={!canRemove}
                    title={canRemove ? "Delete chapter" : "A book needs at least one chapter"}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <input
                value={active.title}
                onChange={(e) => patchActive({ title: e.target.value })}
                placeholder={`Chapter ${activeIndex + 1} title`}
                aria-label="Chapter title"
                className="mb-3 w-full rounded-xl border border-hairline-2 bg-surface px-3.5 py-2.5 text-lg font-semibold text-foreground placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              <RichTextEditor
                key={active.key}
                html={active.html}
                onChange={(html) => patchActive({ html })}
              />
            </>
          ) : (
            <p className="text-sm text-muted">This ebook has no chapters to edit.</p>
          )}
        </section>
      </div>
    </div>
  );
}
