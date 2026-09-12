"use client";

import { useCallback, useRef, useState } from "react";
import type { AssetsState } from "@/lib/use-assets";
import type { AssetRole, EbookImage } from "@/lib/types";
import { ApiError } from "@/lib/api";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 10 * 1024 * 1024;

const ROLE_OPTIONS: AssetRole[] = ["GENERAL", "LOGO", "AUTHOR", "PRODUCT", "COVER", "ILLUSTRATION"];

interface UploadState {
  key: string;
  name: string;
  pct: number;
  error?: string;
}

/**
 * The project's asset library: drag-and-drop / pick to upload, with per-file
 * progress and errors, plus a grid of uploaded assets. Each asset shows a
 * preview, filename, type, dimensions and how Scrivetta is using it, with
 * controls to set the cover, resize, change role, remove — and, in the editor,
 * insert it into the current chapter. Presentational: all data + mutations come
 * from {@link AssetsState} (the useAssets hook).
 */
export function AssetManager({
  state,
  mode = "draft",
  onInsert,
}: {
  state: AssetsState;
  mode?: "draft" | "editor";
  onInsert?: (asset: EbookImage) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      for (const file of list) {
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
            // Drop the row shortly after it completes.
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

  return (
    <div className="flex flex-col gap-4">
      {/* Dropzone */}
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
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-hairline-2 bg-surface-2 hover:border-accent"
        }`}
      >
        <span className="text-sm font-medium text-foreground-2">Upload your assets</span>
        <span className="text-xs text-faint">
          Drag &amp; drop images here, or click to choose. PNG, JPEG, WebP, GIF, SVG · up to 10 MB.
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

      {/* In-flight uploads */}
      {uploads.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {uploads.map((u) => (
            <li
              key={u.key}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs"
            >
              <span className="min-w-0 flex-1 truncate text-foreground-2">{u.name}</span>
              {u.error ? (
                <span className="shrink-0 text-red-600 dark:text-red-400">{u.error}</span>
              ) : (
                <span className="flex w-28 shrink-0 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <span
                      className="block h-full rounded-full bg-accent transition-all"
                      style={{ width: `${u.pct}%` }}
                    />
                  </span>
                  <span className="tabular-nums text-faint">{u.pct}%</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}

      {/* Asset grid */}
      {state.assets.length === 0 ? (
        <p className="text-xs text-faint">
          No assets yet. Anything you add here, Scrivetta can use in your book where it fits — a
          logo on the cover, a product shot in the right chapter — and you stay in control.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {state.assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              url={state.urlFor(asset.id)}
              mode={mode}
              onInsert={onInsert}
              onSetCover={() => state.setCover(asset.id)}
              onRemove={() => state.remove(asset.id)}
              onRole={(role) => state.update(asset.id, { role })}
              onWidth={(w) => state.update(asset.id, { displayWidthPercent: w })}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const PLACEMENT_LABEL: Record<string, string> = {
  UNUSED: "Not used",
  COVER: "Cover",
  CHAPTER: "In a chapter",
};

function AssetCard({
  asset,
  url,
  mode,
  onInsert,
  onSetCover,
  onRemove,
  onRole,
  onWidth,
}: {
  asset: EbookImage;
  url: string | undefined;
  mode: "draft" | "editor";
  onInsert?: (asset: EbookImage) => void;
  onSetCover: () => void;
  onRemove: () => void;
  onRole: (role: AssetRole) => void;
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

  const placedBy =
    asset.placement !== "UNUSED" && asset.placedBy
      ? asset.placedBy === "AI"
        ? " · by Scrivetta"
        : " · by you"
      : "";

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface p-2.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={asset.originalFilename || "asset"} className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-faint">…</span>
        )}
        {isCover && (
          <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Cover
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground-2" title={asset.originalFilename || ""}>
          {asset.originalFilename || "image"}
        </p>
        <p className="truncate text-[10px] text-faint">
          {shortType(asset.contentType)}
          {asset.width > 0 ? ` · ${asset.width}×${asset.height}` : ""}
        </p>
        <p className="truncate text-[10px] text-faint">
          {PLACEMENT_LABEL[asset.placement] ?? asset.placement}
          {placedBy}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1">
        {mode === "editor" && onInsert && (
          <MiniButton onClick={() => onInsert(asset)}>Insert</MiniButton>
        )}
        <MiniButton onClick={run(onSetCover)} disabled={busy || isCover}>
          {isCover ? "Cover ✓" : "Cover"}
        </MiniButton>
        <MiniButton
          onClick={() => {
            if (window.confirm(`Remove "${asset.originalFilename || "this image"}"?`)) run(onRemove)();
          }}
          disabled={busy}
          danger
        >
          Remove
        </MiniButton>
      </div>

      {mode === "editor" && (
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Asset role"
            value={asset.role}
            onChange={(e) => onRole(e.target.value as AssetRole)}
            className="min-w-0 flex-1 rounded-md border border-hairline-2 bg-surface px-1.5 py-1 text-[10px] text-foreground-2"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {asset.placement === "CHAPTER" && (
            <label className="flex items-center gap-1 text-[10px] text-faint" title="Display width (%)">
              <input
                type="number"
                min={10}
                max={100}
                defaultValue={asset.displayWidthPercent ?? 100}
                onBlur={(e) => {
                  const w = Number(e.target.value);
                  if (w >= 10 && w <= 100 && w !== (asset.displayWidthPercent ?? 100)) onWidth(w);
                }}
                className="w-12 rounded-md border border-hairline-2 bg-surface px-1 py-1 text-[10px]"
              />
              %
            </label>
          )}
        </div>
      )}
    </li>
  );
}

function MiniButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-accent hover:bg-accent-soft"
      }`}
    >
      {children}
    </button>
  );
}

function shortType(mime: string): string {
  const m = mime.split("/")[1] || mime;
  return m.replace("+xml", "").toUpperCase();
}
