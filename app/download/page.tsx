"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ApiError, publicStoreApi } from "@/lib/api";
import type { DownloadInfo } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { PurchasePageView } from "@/components/store-design/product-page-view";
import { parseDesign } from "@/lib/store-design/core";
import { pageDataFromDownload, parsePageDoc } from "@/lib/store-design/product-page";
import { Alert, Spinner } from "@/components/ui";

// The token travels in the URL fragment (/download#<token>): browsers never send
// a fragment to any server, and analytics page views don't include it.
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * The page a buyer's email links to: the after-purchase page the author
 * designed, in the store's style. Viewing it does not use up a download (so
 * mail scanners that open links can't burn them); only the buttons do.
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

  const design = useMemo(() => parseDesign(info?.themeSettings), [info]);
  const doc = useMemo(() => parsePageDoc(info?.pageSettings), [info]);
  const data = useMemo(() => (info ? pageDataFromDownload(info) : null), [info]);

  if (!info || !data) {
    return (
      <MarketingShell ambient="none">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          {error ? (
            <>
              <Alert>{error}</Alert>
              <p className="mt-4 text-sm text-muted">
                If you bought this and the link no longer works, contact the seller — their address is in your receipt
                email. With a Scrivetta account under the same email, your purchase is also in My purchases.
              </p>
            </>
          ) : (
            <div className="flex justify-center py-10 text-muted"><Spinner /></div>
          )}
        </div>
      </MarketingShell>
    );
  }

  return (
    <PurchasePageView design={design} data={data} doc={doc} files={info.files}
      fileHref={(f) => publicStoreApi.downloadFileUrl(token, f.id)}
      onFileClick={() => setTimeout(load, 3000)}
      footnote={
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--pp-muted)" }}>
          {info.downloadsRemaining} download{info.downloadsRemaining === 1 ? "" : "s"} left · link valid until{" "}
          {new Date(info.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      } />
  );
}
