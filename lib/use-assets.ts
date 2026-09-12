"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { imageApi, ApiError } from "./api";
import type { EbookImage, EbookImageUpdateInput } from "./types";

export interface AssetsState {
  assets: EbookImage[];
  loading: boolean;
  error: string | null;
  /** Blob URL for an asset's bytes (private bucket), or undefined until loaded. */
  urlFor: (id: string) => string | undefined;
  refresh: () => Promise<void>;
  upload: (file: File, onProgress?: (pct: number) => void) => Promise<EbookImage>;
  update: (id: string, input: EbookImageUpdateInput) => Promise<EbookImage>;
  setCover: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Loads an ebook's assets and their (authenticated) preview blob URLs, and
 * exposes the mutations. One instance owns the blob-URL cache and revokes it on
 * unmount, so both the asset panel and the editor can share a single source of
 * truth without leaking object URLs.
 */
export function useAssets(token: string | null, ebookId: string | null): AssetsState {
  const [assets, setAssets] = useState<EbookImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<Record<string, string>>({});

  const refresh = useCallback(async () => {
    if (!token || !ebookId) return;
    try {
      const list = await imageApi.list(token, ebookId);
      setAssets(list);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load assets.");
    } finally {
      setLoading(false);
    }
  }, [token, ebookId]);

  // Initial load — inline (not via refresh()) so all setState happens inside the
  // async callback rather than synchronously in the effect body.
  useEffect(() => {
    if (!token || !ebookId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await imageApi.list(token, ebookId);
        if (!cancelled) {
          setAssets(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load assets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, ebookId]);

  // Fetch a preview blob for any asset we don't have a URL for yet, and revoke
  // URLs for assets that have gone away. All state updates happen inside the
  // async callback (never synchronously in the effect body).
  useEffect(() => {
    if (!token || !ebookId) return;
    let cancelled = false;
    (async () => {
      const have = urlsRef.current;
      const liveIds = new Set(assets.map((a) => a.id));

      for (const id of Object.keys(have)) {
        if (!liveIds.has(id)) {
          URL.revokeObjectURL(have[id]);
          delete have[id];
        }
      }
      for (const asset of assets) {
        if (have[asset.id]) continue;
        try {
          const blob = await imageApi.fetchBlob(token, ebookId, asset.id);
          if (cancelled) return;
          have[asset.id] = URL.createObjectURL(blob);
        } catch {
          /* leave it unresolved; the card shows a fallback */
        }
      }
      if (!cancelled) setUrls({ ...have });
    })();

    return () => {
      cancelled = true;
    };
  }, [assets, token, ebookId]);

  // Revoke everything on unmount.
  useEffect(() => {
    const cache = urlsRef.current;
    return () => {
      for (const url of Object.values(cache)) URL.revokeObjectURL(url);
    };
  }, []);

  const urlFor = useCallback((id: string) => urls[id], [urls]);

  const upload = useCallback(
    async (file: File, onProgress?: (pct: number) => void) => {
      if (!token || !ebookId) throw new Error("Not ready");
      const created = await imageApi.upload(token, ebookId, file, { onProgress });
      await refresh();
      return created;
    },
    [token, ebookId, refresh],
  );

  const update = useCallback(
    async (id: string, input: EbookImageUpdateInput) => {
      if (!token || !ebookId) throw new Error("Not ready");
      const updated = await imageApi.update(token, ebookId, id, input);
      await refresh();
      return updated;
    },
    [token, ebookId, refresh],
  );

  const setCover = useCallback(
    async (id: string) => {
      if (!token || !ebookId) throw new Error("Not ready");
      await imageApi.setCover(token, ebookId, id);
      await refresh();
    },
    [token, ebookId, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token || !ebookId) throw new Error("Not ready");
      await imageApi.remove(token, ebookId, id);
      await refresh();
    },
    [token, ebookId, refresh],
  );

  return { assets, loading, error, urlFor, refresh, upload, update, setCover, remove };
}
