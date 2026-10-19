"use client";

import { useState } from "react";
import { ApiError, storeApi } from "@/lib/api";
import type { StoreDashboard } from "@/lib/types";
import { describeChanges, publishBlocker, storeAddress } from "@/lib/store/changes";
import { Alert, Button } from "@/components/ui";
import { Dialog, DialogHeader, useCopy } from "./kit";

/**
 * "Publish changes (n)" — the one way anything reaches buyers, the same in Your
 * store, the product editor and the store designer. It opens a review of what
 * will change; after the store's first publish it hands over the link for the
 * author's bio.
 */
export function PublishChanges({ token, store, onChange, flush, className = "" }: {
  token: string;
  store: StoreDashboard;
  onChange: (s: StoreDashboard) => void;
  /** Editors save their last keystrokes first; resolves false when that failed. */
  flush?: () => Promise<boolean>;
  className?: string;
}) {
  const [review, setReview] = useState(false);
  const [live, setLive] = useState(false);
  const lines = describeChanges(store);
  const n = lines.length;
  const first = !store.published;

  async function open() {
    if (flush && !(await flush())) return;
    setReview(true);
  }

  return (
    <>
      <button type="button" onClick={open} disabled={!first && n === 0}
        title={!first && n === 0 ? "Everything is live" : undefined}
        className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-[11px] bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-default disabled:opacity-40 ${className}`}>
        {first ? "Publish store" : "Publish changes"}
        {n > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs text-foreground">{n}</span>
        )}
      </button>
      <PublishReview open={review} token={token} store={store} onClose={() => setReview(false)}
        onPublished={(s) => {
          onChange(s);
          setReview(false);
          if (first) setLive(true);
        }}
        onDiscarded={(s) => {
          onChange(s);
          setReview(false);
        }} />
      <LiveDialog open={live} store={store} onClose={() => setLive(false)} />
    </>
  );
}

function PublishReview({ open, token, store, onClose, onPublished, onDiscarded }: {
  open: boolean;
  token: string;
  store: StoreDashboard;
  onClose: () => void;
  onPublished: (s: StoreDashboard) => void;
  onDiscarded: (s: StoreDashboard) => void;
}) {
  const [busy, setBusy] = useState<"publish" | "discard" | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lines = describeChanges(store);
  const first = !store.published;
  const blocker = publishBlocker(store);
  const waiting = store.products.filter((p) => p.active && !p.deliverable);

  async function run(kind: "publish" | "discard") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "publish") onPublished(await storeApi.publish(token));
      else onDiscarded(await storeApi.discardDraft(token));
      setConfirmDiscard(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const title = first
    ? "Open your store?"
    : `Publish ${lines.length} change${lines.length === 1 ? "" : "s"} to your live store?`;

  return (
    <Dialog open={open} onClose={onClose} labelledBy="publish-review-title">
      <DialogHeader id="publish-review-title" title={title} onClose={onClose} />
      <div className="flex flex-col gap-4 px-6 pb-6">
        {first && (
          <p className="text-sm leading-relaxed text-muted">
            Your store goes public at <b className="text-foreground">{storeAddress(store.slug).shown}</b>. You can
            unpublish it again anytime.
          </p>
        )}
        {lines.length > 0 ? (
          <ul className="flex flex-col gap-2 rounded-xl border border-hairline bg-background p-3.5 text-sm">
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4892B]" />
                <span><b className="font-semibold">{l.subject}</b> · {l.text}</span>
              </li>
            ))}
          </ul>
        ) : !first ? (
          <p className="text-sm text-muted">Everything is already live.</p>
        ) : null}
        {waiting.map((p) => (
          <div key={p.id} className="flex gap-2.5 rounded-xl bg-warn-soft px-3.5 py-3 text-[13px] leading-snug text-warn">
            <span aria-hidden>▲</span>
            <span><b>{p.title}</b> has no file yet, so it stays hidden. Add a file in Files &amp; price, then publish again.</span>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-faint">
          Images and files you upload are used right away. Everything else waits for this button.
        </p>
        {blocker && <Alert variant="info">{blocker}</Alert>}
        {error && <Alert>{error}</Alert>}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {lines.length > 0 && !confirmDiscard ? (
            <button type="button" onClick={() => setConfirmDiscard(true)}
              className="text-sm text-muted underline decoration-hairline-2 underline-offset-4 hover:text-foreground">
              Discard changes…
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Not yet</Button>
            <Button loading={busy === "publish"} disabled={!!blocker || busy !== null || (!first && !lines.length)} onClick={() => run("publish")}>
              {first ? "Publish store" : "Publish"}
            </Button>
          </div>
        </div>
        {confirmDiscard && (
          <div className="flex flex-col gap-3 rounded-xl border border-hairline p-3.5">
            <p className="text-sm">Throw away all {lines.length} unpublished change{lines.length === 1 ? "" : "s"}? Your store goes back to what buyers see now.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Keep them</Button>
              <Button loading={busy === "discard"} disabled={busy !== null} onClick={() => run("discard")}
                className="!bg-red-700 !text-white">Discard changes</Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** Right after the first publish: the link for the author's bio. */
export function LiveDialog({ open, store, onClose }: { open: boolean; store: StoreDashboard; onClose: () => void }) {
  const { copied, copy } = useCopy();
  const { path, shown } = storeAddress(store.slug);
  return (
    <Dialog open={open} onClose={onClose} labelledBy="store-live-title">
      <DialogHeader id="store-live-title" title="Your store is live" onClose={onClose} />
      <div className="flex flex-col gap-4 px-6 pb-6">
        <p className="text-sm leading-relaxed text-muted">Put this link in your bio, newsletter or posts — buyers pay you directly through Stripe.</p>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-background p-2 pl-3.5">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{shown}</span>
          <Button onClick={() => copy(`${window.location.origin}${path}`)}>{copied ? "Copied" : "Copy for your bio"}</Button>
        </div>
        <a href={path} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-medium underline decoration-hairline-2 underline-offset-4">
          Open your store ↗
        </a>
      </div>
    </Dialog>
  );
}
