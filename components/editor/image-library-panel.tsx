"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AssetsState } from "@/lib/use-assets";
import type { EbookImage } from "@/lib/types";
import { ApiError } from "@/lib/api";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 10 * 1024 * 1024;

type Filter = "all" | "used" | "unused";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "used", label: "Used" },
  { key: "unused", label: "Unused" },
];

/** An asset counts as "used" once it's placed anywhere in the book (cover or a chapter). */
function isUsed(asset: EbookImage): boolean {
  return asset.placement !== "UNUSED";
}

interface UploadRow {
  key: string;
  name: string;
  pct: number;
  error?: string;
}

/**
 * The editor's "Images" panel — a Canva-style upload + gallery that replaces the
 * default rail while it's open. Upload images, filter by All / Used / Unused,
 * search by name, then click a thumbnail to drop it into the chapter you're
 * editing. All data and mutations come from {@link AssetsState} (useAssets), so
 * this stays presentational and shares the editor's single blob-URL cache.
 */
export function ImageLibraryPanel({
  state,
  onInsert,
}: {
  state: AssetsState;
  onInsert: (assetId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
        if (!ALLOWED.has(file.type)) {
          setUploads((u) => [...u, { key, name: file.name, pct: 0, error: "Unsupported type" }]);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setUploads((u) => [...u, { key, name: file.name, pct: 0, error: "Larger than 10 MB" }]);
          continue;
        }
        setUploads((u) => [...u, { key, name: file.name, pct: 0 }]);
        state
          .upload(file, (pct) =>
            setUploads((u) => u.map((it) => (it.key === key ? { ...it, pct } : it))),
          )
          .then(() => {
            setUploads((u) => u.map((it) => (it.key === key ? { ...it, pct: 100 } : it)));
            setTimeout(() => setUploads((u) => u.filter((it) => it.key !== key)), 1200);
          })
          .catch((err) => {
            const msg = err instanceof ApiError ? err.message : "Upload failed";
            setUploads((u) => u.map((it) => (it.key === key ? { ...it, error: msg } : it)));
          });
      }
    },
    [state],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const counts = useMemo(
    () => ({
      all: state.assets.length,
      used: state.assets.filter(isUsed).length,
      unused: state.assets.filter((a) => !isUsed(a)).length,
    }),
    [state.assets],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.assets.filter((a) => {
      if (filter === "used" && !isUsed(a)) return false;
      if (filter === "unused" && isUsed(a)) return false;
      if (!q) return true;
      const haystack = [a.originalFilename, a.aiDescription, ...(a.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [state.assets, filter, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-foreground">Images</h2>
        <p className="mt-0.5 text-xs text-muted">Click an image to drop it into the current chapter.</p>
      </div>

      {/* Upload dropzone */}
      <div className="px-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft" : "border-hairline-2 bg-surface-2 hover:border-accent"
          }`}
        >
          <span className="text-xs font-medium text-foreground-2">Upload an image</span>
          <span className="text-[11px] text-faint">Drag &amp; drop or click · PNG, JPEG, WebP, GIF, SVG · 10 MB</span>
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
      </div>

      {/* In-flight uploads */}
      {uploads.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 px-3">
          {uploads.map((u) => (
            <li
              key={u.key}
              className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-[11px]"
            >
              <span className="min-w-0 flex-1 truncate text-foreground-2">{u.name}</span>
              {u.error ? (
                <span className="shrink-0 text-red-600 dark:text-red-400">{u.error}</span>
              ) : (
                <span className="flex w-20 shrink-0 items-center gap-1.5">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <span className="block h-full rounded-full bg-accent transition-all" style={{ width: `${u.pct}%` }} />
                  </span>
                  <span className="tabular-nums text-faint">{u.pct}%</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Filters + search */}
      <div className="mt-3 flex flex-col gap-2 px-3">
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-surface text-foreground shadow-soft"
                  : "text-muted hover:text-foreground-2"
              }`}
            >
              {f.label}
              <span className="tabular-nums text-faint">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images…"
          aria-label="Search images"
          className="w-full rounded-lg border border-hairline-2 bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      {state.error && <p className="px-3 pt-2 text-xs text-red-600 dark:text-red-400">{state.error}</p>}

      {/* Gallery */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {visible.length === 0 ? (
          <p className="px-1 pt-2 text-xs text-faint">
            {state.assets.length === 0
              ? "No images yet. Upload one above to get started."
              : "No images match this filter."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {visible.map((asset) => (
              <ImageCard
                key={asset.id}
                asset={asset}
                url={state.urlFor(asset.id)}
                onInsert={() => onInsert(asset.id)}
                onSetCover={() => state.setCover(asset.id)}
                onRemove={() => state.remove(asset.id)}
                onWidth={(w) => state.update(asset.id, { displayWidthPercent: w })}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ImageCard({
  asset,
  url,
  onInsert,
  onSetCover,
  onRemove,
  onWidth,
}: {
  asset: EbookImage;
  url: string | undefined;
  onInsert: () => void;
  onSetCover: () => void;
  onRemove: () => void;
  onWidth: (w: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isCover = asset.placement === "COVER";

  const run = (fn: () => Promise<void> | void) => async () => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="group relative overflow-hidden rounded-lg border border-hairline bg-surface">
      {/* Clickable thumbnail → insert */}
      <button
        type="button"
        onClick={onInsert}
        title={`Insert ${asset.originalFilename || "image"}`}
        className="block aspect-square w-full bg-surface-3"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={asset.originalFilename || "asset"} className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-faint">…</span>
        )}
      </button>

      {isCover && (
        <span className="pointer-events-none absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Cover
        </span>
      )}

      {/* Hover overlay: primary Insert */}
      <button
        type="button"
        onClick={onInsert}
        className="absolute inset-x-0 top-0 flex h-[calc(100%-1.75rem)] items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100"
        aria-hidden
        tabIndex={-1}
      >
        <span className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-900 shadow-soft">
          Insert
        </span>
      </button>

      {/* Footer actions */}
      <div className="flex items-center gap-1 px-1.5 py-1">
        {asset.placement === "CHAPTER" ? (
          <label className="flex items-center gap-0.5 text-[10px] text-faint" title="Display width (%)">
            <input
              type="number"
              min={10}
              max={100}
              defaultValue={asset.displayWidthPercent ?? 100}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const w = Number(e.target.value);
                if (w >= 10 && w <= 100 && w !== (asset.displayWidthPercent ?? 100)) onWidth(w);
              }}
              className="w-9 rounded border border-hairline-2 bg-surface px-1 py-0.5 text-[10px]"
            />
            %
          </label>
        ) : (
          <MiniAction onClick={run(onSetCover)} disabled={busy || isCover}>
            {isCover ? "Cover ✓" : "Cover"}
          </MiniAction>
        )}
        <MiniAction
          onClick={() => {
            if (window.confirm(`Remove "${asset.originalFilename || "this image"}"?`)) run(onRemove)();
          }}
          disabled={busy}
          danger
          className="ml-auto"
        >
          ✕
        </MiniAction>
      </div>
    </li>
  );
}

function MiniAction({
  children,
  onClick,
  disabled,
  danger,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-accent hover:bg-accent-soft"
      } ${className}`}
    >
      {children}
    </button>
  );
}
