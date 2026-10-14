"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ApiError, publicStoreApi } from "@/lib/api";
import type { DownloadInfo } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { Alert, Spinner } from "@/components/ui";

// The token travels in the URL fragment (/download#<token>): browsers never send
// a fragment to any server, and analytics page views don't include it.
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * The page a buyer's email links to. Viewing it does not use up a download (so
 * mail scanners that open links can't burn them); only the button does.
 */
export default function DownloadPage() {
  const token = useSyncExternalStore(subscribeHash, readHash, () => "");
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    publicStoreApi
      .download(token)
      .then((i) => {
        setInfo(i);
        setError(null);
      })
      .catch((e) => {
        setInfo(null);
        setError(e instanceof ApiError ? e.message : "Could not check this download link.");
      });
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MarketingShell ambient="none">
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        {!info && !error && (
          <div className="flex justify-center py-10 text-muted">
            <Spinner />
          </div>
        )}
        {error && <Alert>{error}</Alert>}
        {info && (
          <div className="rounded-2xl border border-hairline bg-surface p-8">
            <p className="text-sm text-muted">{info.storeName ?? "Your purchase"}</p>
            <h1 className="mt-1 font-display text-[26px] font-normal leading-tight text-foreground">
              {info.productTitle}
            </h1>
            <a
              href={publicStoreApi.downloadFileUrl(token)}
              onClick={() => setTimeout(load, 3000)}
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-soft hover:opacity-90"
            >
              Download PDF
            </a>
            <p className="mt-4 text-xs text-faint">
              {info.downloadsRemaining} download{info.downloadsRemaining === 1 ? "" : "s"} left · link valid until{" "}
              {new Date(info.expiresAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
