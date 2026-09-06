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

/** A chapter as the editor holds it: title + HTML body (converted from Markdown). */
interface EditableChapter {
  chapterNumber: number;
  title: string;
  html: string;
}

export default function EbookEditPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const { token } = useAuth();

  const [meta, setMeta] = useState<EbookContentResponse | null>(null);
  const [chapters, setChapters] = useState<EditableChapter[]>([]);
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
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
        const editable = data.chapters.map((c) => ({
          chapterNumber: c.chapterNumber,
          title: c.title ?? "",
          html: markdownToHtml(c.content),
        }));
        setChapters(editable);
        setActiveNumber(editable[0]?.chapterNumber ?? null);
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

  const active = useMemo(
    () => chapters.find((c) => c.chapterNumber === activeNumber) ?? null,
    [chapters, activeNumber],
  );

  const updateActiveHtml = useCallback(
    (html: string) => {
      setChapters((prev) =>
        prev.map((c) => (c.chapterNumber === activeNumber ? { ...c, html } : c)),
      );
      setDirty(true);
      setSaved(false);
    },
    [activeNumber],
  );

  const updateActiveTitle = useCallback(
    (title: string) => {
      setChapters((prev) =>
        prev.map((c) => (c.chapterNumber === activeNumber ? { ...c, title } : c)),
      );
      setDirty(true);
      setSaved(false);
    },
    [activeNumber],
  );

  const save = useCallback(async () => {
    if (!token || !id) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await ebookApi.saveContent(token, id, {
        chapters: chapters.map((c) => ({
          chapterNumber: c.chapterNumber,
          title: c.title,
          content: htmlToMarkdown(c.html),
        })),
      });
      setMeta(updated);
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [token, id, chapters]);

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

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/ebooks/${id}`}
            className="text-sm text-muted hover:underline"
          >
            ← Back to this ebook
          </Link>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
            {meta?.title || "Edit your ebook"}
          </h1>
          {meta?.subtitle && <p className="mt-1 text-muted">{meta.subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {saved && !dirty && (
            <span className="text-sm text-good">Saved ✓</span>
          )}
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
        Saving updates your book and re-renders the downloadable PDF. Editing is free.
      </p>

      {/* Editor + chapter navigation */}
      <div className="mt-6 grid gap-6 md:grid-cols-[15rem_1fr]">
        {/* Chapter list */}
        <aside className="md:sticky md:top-6 md:self-start">
          <h2 className="mb-2 text-sm font-semibold text-foreground-2">Chapters</h2>
          <ul className="flex flex-col gap-1">
            {chapters.map((c) => {
              const isActive = c.chapterNumber === activeNumber;
              return (
                <li key={c.chapterNumber}>
                  <button
                    type="button"
                    onClick={() => setActiveNumber(c.chapterNumber)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-accent-soft text-accent-ink"
                        : "text-foreground-2 hover:bg-surface-2"
                    }`}
                  >
                    <span className="shrink-0 tabular-nums text-xs text-faint">
                      {c.chapterNumber}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {c.title || `Chapter ${c.chapterNumber}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Active chapter editor */}
        <section className="min-w-0">
          {active ? (
            <>
              <input
                value={active.title}
                onChange={(e) => updateActiveTitle(e.target.value)}
                placeholder={`Chapter ${active.chapterNumber} title`}
                aria-label="Chapter title"
                className="mb-3 w-full rounded-xl border border-hairline-2 bg-surface px-3.5 py-2.5 text-lg font-semibold text-foreground placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              <RichTextEditor
                key={active.chapterNumber}
                html={active.html}
                onChange={updateActiveHtml}
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
