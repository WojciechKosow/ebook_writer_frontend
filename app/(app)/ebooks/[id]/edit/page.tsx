"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ebookApi, ApiError } from "@/lib/api";
import { useAssets } from "@/lib/use-assets";
import type { EbookContentResponse } from "@/lib/types";
import { markdownToHtml, htmlToMarkdown, resolveEbookImages } from "@/lib/markdown";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/rich-text-editor";
import { AssetManager } from "@/components/asset-manager";
import { Alert, Button, ButtonLink, Spinner } from "@/components/ui";

/**
 * A chapter as the editor holds it. `key` is a stable client-side id used for
 * React keys and selection; `id` is the server id (null for a chapter the user
 * just added, which the backend will create on save). The body is kept as HTML
 * for TipTap and converted to/from Markdown at load and save. Image tokens
 * (`ebook-image:<id>`) are resolved to preview blob URLs for display and
 * converted back to tokens on save.
 */
interface EditableChapter {
  key: string;
  id: string | null;
  title: string;
  html: string;
}

/** Raw chapter as loaded from the server, before image resolution. */
interface RawChapter {
  id: string;
  title: string;
  content: string;
}

function newKey(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `k_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

const IMG_TOKEN = /ebook-image:([A-Za-z0-9-]+)/g;

export default function EbookEditPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const { token } = useAuth();
  const assets = useAssets(token, id);

  const [meta, setMeta] = useState<EbookContentResponse | null>(null);
  const [rawChapters, setRawChapters] = useState<RawChapter[] | null>(null);
  const [chapters, setChapters] = useState<EditableChapter[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [forceBuild, setForceBuild] = useState(false);

  const builtRef = useRef(false);
  const editorRef = useRef<RichTextEditorHandle>(null);

  /** Resolve an image token to its preview URL + stored width. */
  const resolve = useCallback(
    (imgId: string) => {
      const url = assets.urlFor(imgId);
      if (!url) return undefined;
      const asset = assets.assets.find((a) => a.id === imgId);
      return { url, widthPercent: asset?.displayWidthPercent ?? null };
    },
    [assets],
  );

  // Load the manuscript once.
  useEffect(() => {
    if (!token || !id) return;
    let active = true;
    (async () => {
      try {
        const data = await ebookApi.getContent(token, id);
        if (!active) return;
        setMeta(data);
        setRawChapters(
          data.chapters.map((c) => ({ id: c.id, title: c.title ?? "", content: c.content ?? "" })),
        );
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

  // Don't wait forever on image blobs — build the editor after a short grace
  // period even if a preview failed to load.
  useEffect(() => {
    const t = setTimeout(() => setForceBuild(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Build the editable chapters once, when the manuscript is loaded and the
  // referenced image previews are ready (or the grace period elapsed). Building
  // once avoids clobbering edits when new blob URLs arrive later.
  useEffect(() => {
    if (builtRef.current || !rawChapters || assets.loading) return;

    const referenced = new Set<string>();
    for (const c of rawChapters) {
      for (const m of c.content.matchAll(IMG_TOKEN)) referenced.add(m[1]);
    }
    const allResolved = [...referenced].every((rid) => assets.urlFor(rid));
    if (referenced.size > 0 && !allResolved && !forceBuild) return;

    const editable = rawChapters.map((c) => ({
      key: newKey(),
      id: c.id,
      title: c.title,
      html: resolveEbookImages(markdownToHtml(c.content), resolve),
    }));
    // One-time build of editor state once the manuscript and image previews are
    // ready; guarded by builtRef so it runs exactly once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChapters(editable);
    setActiveKey(editable[0]?.key ?? null);
    builtRef.current = true;
  }, [rawChapters, assets, resolve, forceBuild]);

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
      setChapters((prev) => prev.map((c) => (c.key === activeKey ? { ...c, ...patch } : c)));
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

  // Insert (or replace the selected) image in the active chapter.
  const insertAsset = useCallback(
    (assetId: string) => {
      const url = assets.urlFor(assetId);
      if (!url || !editorRef.current) return;
      const asset = assets.assets.find((a) => a.id === assetId);
      editorRef.current.insertImage({
        id: assetId,
        url,
        alt: asset?.aiDescription || asset?.originalFilename || "",
        widthPercent: asset?.displayWidthPercent ?? null,
      });
      touch();
    },
    [assets, touch],
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
      // Rebuild from the authoritative response (fresh ids + order), re-resolving
      // image tokens to previews, keeping the same chapter selected by position.
      const rebuilt: EditableChapter[] = updated.chapters.map((c) => ({
        key: newKey(),
        id: c.id,
        title: c.title ?? "",
        html: resolveEbookImages(markdownToHtml(c.content), resolve),
      }));
      setChapters(rebuilt);
      const keep = rebuilt[Math.min(Math.max(prevActiveIndex, 0), rebuilt.length - 1)];
      setActiveKey(keep?.key ?? null);
      setDirty(false);
      setSaved(true);
      // Placement/usage may have changed; refresh the asset panel.
      assets.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [token, id, chapters, activeIndex, resolve, assets]);

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
    <div className="mx-auto max-w-6xl">
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
        Add, remove or reorder chapters and edit their text and images. Use the Assets panel to
        insert an image into the chapter you&apos;re editing. Saving re-renders the downloadable
        PDF. Editing is free.
      </p>

      {/* Editor + chapter navigation */}
      <div className="mt-6 grid gap-6 md:grid-cols-[14rem_1fr]">
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
                ref={editorRef}
                html={active.html}
                onChange={(html) => patchActive({ html })}
              />

              {/* Assets */}
              <div className="mt-8 rounded-xl border border-hairline bg-surface-2 p-4">
                <h2 className="text-sm font-semibold text-foreground-2">Assets</h2>
                <p className="mt-1 text-xs text-muted">
                  Upload images or reuse ones from this project. <strong>Insert</strong> places an
                  image in the chapter you&apos;re editing (or replaces the selected image). Set a
                  cover, adjust an image&apos;s width, or remove it. Changes save with the book.
                </p>
                <div className="mt-4">
                  <AssetManager state={assets} mode="editor" onInsert={(a) => insertAsset(a.id)} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">This ebook has no chapters to edit.</p>
          )}
        </section>
      </div>
    </div>
  );
}
