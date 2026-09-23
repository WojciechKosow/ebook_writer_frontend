"use client";

import { useCallback, useRef, useState } from "react";
import type { AssetsState } from "@/lib/use-assets";
import { ApiError } from "@/lib/api";
import { coverObjectPosition } from "@/lib/cover-crop";

/** The panel previews the full-page (2:3) cover composition. */
const COVER_RATIO = 2 / 3;

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

/**
 * The "Cover" panel — the book's first page. Shows a true-to-PDF preview of the
 * cover (a full-bleed background image with the title/subtitle overlaid) and lets
 * the author set it from an uploaded or existing image, or clear it. The image is
 * the asset whose placement is COVER; the backend renders it full-bleed on page 1.
 */
export function CoverPanel({
  state,
  title,
  subtitle,
}: {
  state: AssetsState;
  title: string | null | undefined;
  subtitle: string | null | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cover = state.assets.find((a) => a.placement === "COVER");
  const coverUrl = cover ? state.urlFor(cover.id) : undefined;
  // Optimistic focal point while a save is in flight (keyed to the cover id so it
  // resets when the cover changes).
  const [pending, setPending] = useState<{ id: string; x: number; y: number } | null>(null);
  const focal =
    cover && pending?.id === cover.id
      ? { x: pending.x, y: pending.y }
      : { x: cover?.focalX ?? 50, y: cover?.focalY ?? 50 };
  const objectPosition = cover
    ? coverObjectPosition(cover.width, cover.height, COVER_RATIO, focal.x, focal.y)
    : undefined;
  // Framing only matters when the image isn't already the cover's shape.
  const needsFraming =
    !!cover && cover.width > 0 && cover.height > 0 &&
    Math.abs(cover.width / cover.height - COVER_RATIO) / COVER_RATIO > 0.01;


  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, []);

  function setFocal(e: React.MouseEvent<HTMLButtonElement>) {
    if (!cover) return;
    const img = e.currentTarget.querySelector("img");
    const box = (img ?? e.currentTarget).getBoundingClientRect();
    const x = Math.round(((e.clientX - box.left) / box.width) * 100);
    const y = Math.round(((e.clientY - box.top) / box.height) * 100);
    const fx = Math.max(0, Math.min(100, x));
    const fy = Math.max(0, Math.min(100, y));
    setPending({ id: cover.id, x: fx, y: fy });
    run(async () => {
      await state.update(cover.id, { focalX: fx, focalY: fy });
    });
  }

  const onFile = useCallback(
    (file: File) => {
      if (!ALLOWED.has(file.type)) {
        setError("Unsupported image type.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("Image is larger than 10 MB.");
        return;
      }
      run(async () => {
        const created = await state.upload(file);
        await state.setCover(created.id);
      });
    },
    [run, state],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2 pt-4">
        <h2 className="text-sm font-semibold text-foreground">Cover</h2>
        <p className="mt-0.5 text-xs text-muted">
          Page 1 of your book. Pick an image to fill the whole cover.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {/* Cover preview (2:3, mirrors the PDF cover) */}
        <div className="relative mx-auto aspect-[2/3] w-full overflow-hidden rounded-lg border border-hairline-2 bg-[#f4f2ee] shadow-soft">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Cover"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition }}
            />
          ) : null}
          {/* Title/subtitle overlay */}
          <div
            className={`absolute inset-x-0 px-4 text-center ${
              coverUrl ? "bottom-0 bg-[rgba(20,18,16,0.55)] py-4" : "top-[22%]"
            }`}
          >
            <div
              className={`text-lg font-bold leading-tight ${
                coverUrl ? "text-white" : "text-[#111]"
              }`}
            >
              {title?.trim() || "Your book title"}
            </div>
            {subtitle?.trim() && (
              <div className={`mt-1 text-xs ${coverUrl ? "text-white/90" : "text-[#555]"}`}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {cover ? "Replace cover image" : "Upload cover image"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          {cover && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => state.clearCover())}
              className="rounded-lg border border-hairline-2 px-3 py-2 text-sm font-medium text-foreground-2 transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              Remove cover
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

        {/* Framing — the image is cropped (never stretched) to the cover's shape,
            centred on the point chosen here. Same crop in the preview and PDF. */}
        {cover && coverUrl && needsFraming && (
          <div className="mt-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">
              Framing
            </p>
            <p className="mb-2 text-xs text-muted">
              This image is a different shape from the cover, so part of it is cropped. Click the
              part that must stay in view.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={setFocal}
              aria-label="Set the cover's focal point"
              className="relative block w-full cursor-crosshair overflow-hidden rounded-md border border-hairline bg-surface-3 disabled:cursor-wait"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="" className="block h-auto w-full" draggable={false} />
              <span
                aria-hidden
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
              />
            </button>
            {(cover.focalX !== null || cover.focalY !== null) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setPending({ id: cover.id, x: 50, y: 50 });
                  run(() => state.update(cover.id, { focalX: 50, focalY: 50 }).then(() => undefined));
                }}
                className="mt-2 text-xs font-medium text-accent hover:underline disabled:opacity-60"
              >
                Reset to centre
              </button>
            )}
          </div>
        )}

        {/* Choose from existing project images */}
        {state.assets.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-faint">
              Or use one of your images
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {state.assets.map((asset) => {
                const url = state.urlFor(asset.id);
                const isCover = asset.placement === "COVER";
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      disabled={busy || isCover}
                      onClick={() => run(() => state.setCover(asset.id))}
                      title={isCover ? "Current cover" : `Use ${asset.originalFilename || "image"} as cover`}
                      className={`relative block aspect-square w-full overflow-hidden rounded-md border bg-surface-3 transition-colors disabled:cursor-default ${
                        isCover ? "border-accent ring-2 ring-accent/40" : "border-hairline hover:border-accent"
                      }`}
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={asset.originalFilename || "asset"} className="h-full w-full object-contain" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-faint">…</span>
                      )}
                      {isCover && (
                        <span className="absolute right-0.5 top-0.5 rounded bg-accent px-1 text-[9px] font-semibold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
