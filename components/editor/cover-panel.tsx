"use client";

import { useCallback, useRef, useState } from "react";
import type { AssetsState } from "@/lib/use-assets";
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
            <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
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
