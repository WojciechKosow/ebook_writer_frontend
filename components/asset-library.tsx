"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError, libraryApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AssetLibrary, LibraryAsset } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";

/**
 * The user's asset library as a picker: every image they've uploaded anywhere,
 * so it can be added again without another upload. `accepts` greys out images
 * that don't fit the target (e.g. the store takes PNG/JPG/WebP up to 3 MB).
 */
export function LibraryPicker({
  title = "Your library",
  onPick,
  onClose,
  accepts,
}: {
  title?: string;
  onPick: (asset: LibraryAsset) => Promise<unknown>;
  onClose: () => void;
  accepts?: (asset: LibraryAsset) => string | null;
}) {
  const { token } = useAuth();
  const [library, setLibrary] = useState<AssetLibrary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const created: string[] = [];
    (async () => {
      try {
        const lib = await libraryApi.list(token);
        if (cancelled) return;
        setLibrary(lib);
        const entries = await Promise.all(
          lib.assets.map(async (a) => {
            try {
              return [a.id, URL.createObjectURL(await libraryApi.fetchBlob(token, a.id))] as const;
            } catch {
              return null;
            }
          }),
        );
        for (const e of entries) if (e) created.push(e[1]);
        if (!cancelled) setUrls(Object.fromEntries(entries.filter((e) => e !== null)));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load your library.");
      }
    })();
    return () => {
      cancelled = true;
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, [token]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = useCallback(
    async (asset: LibraryAsset) => {
      setBusyId(asset.id);
      setError(null);
      try {
        await onPick(asset);
        onClose();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't add that image.");
      } finally {
        setBusyId(null);
      }
    },
    [onPick, onClose],
  );

  const remove = useCallback(
    async (asset: LibraryAsset) => {
      if (!token) return;
      if (!window.confirm(`Delete "${asset.originalFilename || "this image"}" from your library? Books and your store keep their copy.`)) return;
      try {
        await libraryApi.remove(token, asset.id);
        setLibrary((lib) => lib && { ...lib, assets: lib.assets.filter((a) => a.id !== asset.id) });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't delete that image.");
      }
    },
    [token],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,24,20,.45)] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft"
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted">
              Everything you&apos;ve uploaded, ready to reuse — no need to upload it again.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-2">
            ✕
          </button>
        </div>

        {library && !library.kept && (
          <p className="border-b border-hairline bg-accent-soft px-5 py-2 text-xs text-foreground-2">
            Without Pro, images stay here for {library.retentionHours} hours.{" "}
            <Link href="/billing" className="font-semibold text-accent underline-offset-2 hover:underline">
              Upgrade to Pro
            </Link>{" "}
            to keep your library.
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
          {!library ? (
            !error && (
              <div className="flex justify-center py-10 text-muted">
                <Spinner />
              </div>
            )
          ) : library.assets.length === 0 ? (
            <p className="py-6 text-center text-sm text-faint">
              Your library is empty. Images you upload to a book or your store show up here.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {library.assets.map((asset) => {
                const reason = accepts?.(asset) ?? null;
                const url = urls[asset.id];
                return (
                  <li key={asset.id} className="flex flex-col gap-1.5 rounded-xl border border-hairline bg-surface p-2">
                    <button
                      type="button"
                      disabled={!!reason || busyId !== null}
                      onClick={() => pick(asset)}
                      title={reason ?? `Add "${asset.originalFilename || "image"}"`}
                      className="relative block aspect-square overflow-hidden rounded-lg bg-surface-3 transition-opacity enabled:hover:ring-2 enabled:hover:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={asset.originalFilename || "image"} className="h-full w-full object-contain" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-faint">…</span>
                      )}
                      {busyId === asset.id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-surface/60">
                          <Spinner />
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="min-w-0 flex-1 truncate text-[11px] text-foreground-2" title={asset.originalFilename || ""}>
                        {reason ?? asset.originalFilename ?? "image"}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(asset)}
                        aria-label="Delete from library"
                        className="rounded px-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        ✕
                      </button>
                    </div>
                    {asset.expiresAt && <span className="text-[10px] text-faint">{expiresIn(asset.expiresAt)}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function expiresIn(iso: string): string {
  const hours = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3_600_000));
  return hours < 1 ? "Deleted within the hour" : `Deleted in ${hours} h`;
}

const NOTICE_KEY = "scrivetta.library-notice-seen";

/**
 * Shown once, after the first upload of a user without Pro: their uploads are
 * only kept in the library for a while. Call `afterUpload()` after each
 * successful upload and render `notice`.
 */
export function useLibraryNotice() {
  const { token } = useAuth();
  const [hours, setHours] = useState<number | null>(null);

  const afterUpload = useCallback(async () => {
    if (!token) return;
    try {
      if (localStorage.getItem(NOTICE_KEY)) return;
    } catch {
      return;
    }
    try {
      const lib = await libraryApi.list(token);
      if (lib.kept) return;
      try {
        localStorage.setItem(NOTICE_KEY, "1");
      } catch {
        // can't remember it — still show it this once
      }
      setHours(lib.retentionHours);
    } catch {
      // the notice is a nicety; never get in the way of the upload
    }
  }, [token]);

  const notice =
    hours === null ? null : <LibraryNotice hours={hours} onClose={() => setHours(null)} />;
  return { notice, afterUpload };
}

function LibraryNotice({ hours, onClose }: { hours: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,24,20,.45)] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-notice-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-6 shadow-soft"
      >
        <h2 id="library-notice-title" className="text-lg font-semibold text-foreground">
          Hold on — you&apos;re not on Pro yet!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Your image is in place, but your library only keeps uploads for {hours} hours. Upgrade
          to Pro and every image you upload stays in your library, ready to reuse in any book or
          your store — no uploading the same file again.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-soft hover:opacity-90"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
