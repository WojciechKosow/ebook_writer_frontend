"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCredits } from "@/lib/credits-context";
import { ebookApi, ApiError } from "@/lib/api";
import { useAssets } from "@/lib/use-assets";
import type { EbookContentResponse } from "@/lib/types";
import { markdownToHtml, htmlToMarkdown, resolveEbookImages } from "@/lib/markdown";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/rich-text-editor";
import { EbookPreview } from "@/components/ebook-preview";
import { EditorShell, type EditorPanel } from "@/components/editor/editor-shell";
import { ChaptersPanel } from "@/components/editor/chapters-panel";
import { ImageLibraryPanel } from "@/components/editor/image-library-panel";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const credits = useCredits();
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
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [revision, setRevision] = useState(0);

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

  // Asset changes (cover, resize, placement, add/remove) persist immediately and
  // re-render the book server-side, so refresh the preview when the assets change
  // — not only on a chapter save. Skips the first (initial load) signature.
  const assetSignature = useMemo(
    () =>
      assets.assets
        .map((a) => `${a.id}:${a.placement}:${a.displayWidthPercent ?? ""}`)
        .join("|"),
    [assets.assets],
  );
  const prevAssetSig = useRef<string | null>(null);
  useEffect(() => {
    if (prevAssetSig.current !== null && prevAssetSig.current !== assetSignature) {
      setPreviewKey((k) => k + 1);
    }
    prevAssetSig.current = assetSignature;
  }, [assetSignature]);

  const activeIndex = useMemo(
    () => chapters.findIndex((c) => c.key === activeKey),
    [chapters, activeKey],
  );
  const active = activeIndex >= 0 ? chapters[activeIndex] : null;

  const touch = useCallback(() => {
    setDirty(true);
    setSaved(false);
    // Drives the live preview's debounced refresh.
    setRevision((r) => r + 1);
  }, []);

  // The editor's current content as the preview endpoint expects it (Markdown).
  // Built on demand (once per debounce) rather than on every keystroke.
  const buildPreviewContent = useCallback(
    () => ({
      chapters: chapters.map((c) => ({
        id: c.id,
        title: c.title,
        content: htmlToMarkdown(c.html),
      })),
    }),
    [chapters],
  );

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

  // Insert (or replace the selected) image in the active chapter — the click
  // path from the Images panel.
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

  // Resolve a dragged asset id to a displayable image, so the editor can drop it
  // at the release point. Returns undefined (cancelling the drop) until the
  // asset's preview blob is ready.
  const resolveDropImage = useCallback(
    (assetId: string) => {
      const url = assets.urlFor(assetId);
      if (!url) return undefined;
      const asset = assets.assets.find((a) => a.id === assetId);
      return {
        id: assetId,
        url,
        alt: asset?.aiDescription || asset?.originalFilename || "",
        widthPercent: asset?.displayWidthPercent ?? null,
      };
    },
    [assets],
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
      // The saved manuscript is what the preview renders — reload it.
      setPreviewKey((k) => k + 1);
      // Placement/usage may have changed; refresh the asset panel.
      assets.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [token, id, chapters, activeIndex, resolve, assets]);

  // ---- Loading / gate states (rendered full-screen, no app chrome) ----------

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted">
        <Spinner /> Loading your manuscript…
      </div>
    );
  }

  if (error && !meta) {
    return (
      <CenteredCard>
        <Alert>{error}</Alert>
        <div className="mt-4">
          <ButtonLink href="/dashboard" variant="secondary">
            Back to your ebooks
          </ButtonLink>
        </div>
      </CenteredCard>
    );
  }

  if (meta && !meta.editable) {
    return (
      <CenteredCard>
        <Alert variant="info">
          This ebook isn&apos;t ready to edit yet — it&apos;s still being generated.
        </Alert>
        <div className="mt-4">
          <ButtonLink href={`/ebooks/${id}`} variant="secondary">
            Back to this ebook
          </ButtonLink>
        </div>
      </CenteredCard>
    );
  }

  const canRemove = chapters.length > 1;

  const panels: EditorPanel[] = [
    {
      key: "chapters",
      label: "Chapters",
      icon: <IconChapters />,
      content: (
        <ChaptersPanel
          chapters={chapters}
          activeKey={activeKey}
          onSelect={setActiveKey}
          onAdd={addChapter}
          onMove={move}
          onRemove={removeChapter}
          canRemove={canRemove}
        />
      ),
    },
    {
      key: "images",
      label: "Images",
      icon: <IconImages />,
      content: <ImageLibraryPanel state={assets} onInsert={insertAsset} />,
    },
  ];

  const header = (
    <>
      <Link
        href={`/ebooks/${id}`}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        title="Back to this ebook"
      >
        <span aria-hidden>←</span>
        <span className="hidden sm:inline">Back</span>
      </Link>
      <div className="mx-1 h-6 w-px bg-hairline" aria-hidden />
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {meta?.title || "Edit your ebook"}
        </h1>
        {meta?.subtitle && <p className="truncate text-xs text-muted">{meta.subtitle}</p>}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {saved && !dirty && <span className="hidden text-xs text-good sm:inline">Saved ✓</span>}
        {dirty && <span className="hidden text-xs text-muted sm:inline">Unsaved changes</span>}
        <span
          className="hidden items-center gap-1 rounded-full border border-hairline-2 bg-surface px-2.5 py-1 text-xs text-muted md:inline-flex"
          title="Editing is free; credits are only used to generate a book"
        >
          <b className="tabular-nums text-foreground-2">{credits?.balance ?? "…"}</b> credits
        </span>
        <Button
          variant="secondary"
          onClick={() => setShowPreview((v) => !v)}
          aria-pressed={showPreview}
          className="px-3 py-2"
        >
          {showPreview ? "Hide preview" : "Preview"}
        </Button>
        <Button onClick={save} loading={saving} disabled={!dirty} className="px-3 py-2">
          Save
        </Button>
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <EditorShell
      header={header}
      panels={panels}
      showPreview={showPreview}
      preview={
        <EbookPreview
          token={token}
          ebookId={id}
          refreshKey={previewKey}
          dirty={dirty}
          onSave={save}
          live
          revision={revision}
          buildContent={buildPreviewContent}
        />
      }
    >
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {active ? (
        <>
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
            resolveDropImage={resolveDropImage}
            onImageSetWidth={(assetId, pct) => {
              void assets.update(assetId, { displayWidthPercent: pct });
            }}
          />
          <p className="mt-3 text-xs text-faint">
            Chapter {activeIndex + 1} of {chapters.length}. Open the <strong>Images</strong> panel and
            drag a picture onto the page; select an image to align it. Saving re-renders the
            downloadable PDF.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">This ebook has no chapters to edit.</p>
      )}
    </EditorShell>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function IconChapters() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconImages() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L5 21" />
    </svg>
  );
}
