"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ApiError, publicStoreApi } from "@/lib/api";
import { formatPrice } from "@/lib/pricing";
import { formatSize } from "@/lib/files";
import type { DownloadInfo } from "@/lib/types";
import { MarketingShell } from "@/components/marketing-shell";
import { StoreLogo } from "@/components/store/store-shell";
import { StoreCover } from "@/components/store/store-cover";
import { BrandMark } from "@/components/brand-mark";
import { Alert, Spinner } from "@/components/ui";

// The token travels in the URL fragment (/download#<token>): browsers never send
// a fragment to any server, and analytics page views don't include it.
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * The page a buyer's email links to, in the seller's store frame. Viewing it does
 * not use up a download (so mail scanners that open links can't burn them); only
 * the button does.
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

  if (!info) {
    return (
      <MarketingShell ambient="none">
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          {error ? (
            <>
              <Alert>{error}</Alert>
              <p className="mt-4 text-sm text-muted">
                If you bought this ebook and the link no longer works, contact the seller — their address is in your
                receipt email.
              </p>
            </>
          ) : (
            <div className="flex justify-center py-10 text-muted"><Spinner /></div>
          )}
        </div>
      </MarketingShell>
    );
  }

  const who = info.authorName || info.storeName || "the author";
  const storeHref = info.storeSlug ? `/store/${info.storeSlug}` : null;

  return (
    <div className="ink-paper relative flex min-h-full flex-1 flex-col overflow-x-clip">
      <header className="border-b border-ip-hair">
        <div className="mx-auto flex w-full max-w-[920px] items-center px-4 py-3 sm:px-6">
          {info.storeName &&
            (storeHref ? (
              <Link href={storeHref} className="flex items-center gap-3">
                <StoreLogo profile={{ name: info.storeName, logoUrl: info.logoUrl }} size={36} />
                <span className="font-display text-[20px] text-foreground">{info.storeName}</span>
              </Link>
            ) : (
              <span className="font-display text-[20px] text-foreground">{info.storeName}</span>
            ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] flex-1 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-10 rounded-3xl border border-hairline bg-surface p-7 sm:p-10">
          <div className="w-[150px] shrink-0">
            <StoreCover coverUrl={info.coverUrl} title={info.productTitle} />
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent">Your download is ready</p>
            <h1 className="font-display text-[34px] font-light leading-tight text-foreground">{info.productTitle}</h1>
            <p className="text-[15px] leading-relaxed text-foreground-2">Thank you for buying directly from {who}.</p>
            {info.files.length === 0 ? (
              <Alert variant="info">
                The files aren&apos;t available right now. Please contact {who}.
              </Alert>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {info.files.map((f, i) => (
                  <li key={f.id} className="flex flex-wrap items-center gap-3">
                    <a
                      href={publicStoreApi.downloadFileUrl(token, f.id)}
                      onClick={() => setTimeout(load, 3000)}
                      rel="noreferrer"
                      className={`inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-soft hover:opacity-90 ${
                        i === 0 ? "bg-foreground text-background" : "border border-hairline-2 bg-surface text-foreground"
                      }`}
                    >
                      Download {f.format}
                    </a>
                    <span className="min-w-0 text-sm text-muted">
                      <span className="break-words text-foreground-2">{f.filename}</span>
                      {formatSize(f.sizeBytes) ? ` · ${formatSize(f.sizeBytes)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-faint">
              {info.downloadsRemaining} download{info.downloadsRemaining === 1 ? "" : "s"} left · link valid until{" "}
              {new Date(info.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm text-muted">
              Want to keep it for good?{" "}
              <Link href="/register" className="font-medium text-accent hover:underline">Create a free Scrivetta account</Link>{" "}
              with the email you bought with — your purchase appears in My Purchases, with unlimited downloads.
            </p>
            <p className="text-sm text-muted">
              Tip: on a phone, tap Download and choose “Save to Files” or open it in Books so it&apos;s always with you.
            </p>
          </div>
        </div>

        {info.more.length > 0 && storeHref && (
          <section className="mt-12">
            <h2 className="font-display text-[24px] font-normal text-foreground">More from {who}</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {info.more.slice(0, 4).map((m) => (
                <Link key={m.id} href={`${storeHref}/${m.id}`} className="flex flex-[1_1_260px] items-center gap-4 rounded-2xl border border-hairline bg-surface p-3.5 hover:border-muted">
                  <div className="w-14 shrink-0"><StoreCover coverUrl={m.coverUrl} title={m.title} className="shadow-none" /></div>
                  <span className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold text-foreground">{m.title}</span>
                    {m.subtitle && <span className="text-sm text-muted line-clamp-1">{m.subtitle}</span>}
                    <span className="text-sm font-semibold text-foreground">{formatPrice(m.priceCents)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-sm text-muted">
          Problem with your download?{" "}
          {info.contactEmail ? (
            <>Write to <a href={`mailto:${info.contactEmail}`} className="font-medium text-accent hover:underline">{info.contactEmail}</a>.</>
          ) : (
            <>Reply to your receipt email to reach {who}.</>
          )}
        </p>
      </main>

      <footer className="border-t border-ip-hair">
        <div className="mx-auto flex w-full max-w-[920px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted sm:px-6">
          <span>© {new Date().getFullYear()} {info.storeName}</span>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-ip-hair py-1 pl-1 pr-3 text-xs font-semibold text-foreground-2 hover:border-muted">
            <BrandMark className="h-5 w-5" />
            Made with Scrivetta
          </Link>
        </div>
      </footer>
    </div>
  );
}
