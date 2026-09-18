"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ebookApi, ApiError } from "@/lib/api";
import type { EbookContentUpdateInput } from "@/lib/types";
import { Spinner } from "@/components/ui";

/**
 * Faithful book preview. Fetches self-contained HTML (same layout + CSS as the
 * downloadable PDF, images inlined as data URIs) and renders it in a sandboxed
 * iframe, paginated into real 6×9-inch pages by the vendored Paged.js polyfill.
 * This is the "second world": what the reader sees on screen matches the PDF.
 *
 * <p>In <b>live</b> mode it POSTs the editor's current (unsaved) content on a
 * debounce, so the preview tracks edits as they happen; otherwise it GETs the
 * saved manuscript. Either way it can be reloaded on demand (`refreshKey`).
 */
export function EbookPreview({
  token,
  ebookId,
  refreshKey,
  dirty,
  onSave,
  live = false,
  revision = 0,
  buildContent,
}: {
  token: string | null;
  ebookId: string;
  /** Bump to force a reload (e.g. after a save, or an asset change). */
  refreshKey: number;
  /** Whether the editor has unsaved changes. */
  dirty: boolean;
  /** Trigger a save from the hint banner. */
  onSave?: () => void;
  /** Render the editor's current content (POST) rather than the saved book (GET). */
  live?: boolean;
  /** Bumps on every edit; drives the debounced live refresh. */
  revision?: number;
  /** Produces the current editor content to preview. Required for live mode. */
  buildContent?: () => EbookContentUpdateInput;
}) {
  // Two iframes are kept in sync as a double buffer: a live update renders into
  // the hidden one and, once Paged.js finishes, we cross-fade to it. The reader
  // never sees a blank/re-paginating frame, so edits no longer make the preview
  // flash or jump — just a smooth swap under a slim loading bar.
  const iframeA = useRef<HTMLIFrameElement>(null);
  const iframeB = useRef<HTMLIFrameElement>(null);
  const iframes = useMemo(() => [iframeA, iframeB] as const, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bufs, setBufs] = useState<[string, string]>(["", ""]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [pages, setPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  // Refs mirror the state so `load` and the message handler stay stable (a
  // keystroke shouldn't recreate the effects; the debounce owns the cadence).
  const activeRef = useRef(0);
  const pendingRef = useRef<number | null>(null);
  const hasContentRef = useRef(false);
  const scrollRef = useRef(0);
  const viewRef = useRef<{ scale: number; manual: boolean }>({ scale: 1, manual: false });
  const promoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildRef = useRef(buildContent);
  useEffect(() => {
    buildRef.current = buildContent;
  }, [buildContent]);

  // Cross-fade the hidden buffer in: carry the reader's scroll + manual zoom
  // over, then reveal it. Used both when the iframe reports it's painted and by
  // a safety timer, so a live edit is never left invisible if the frame is slow
  // to report back.
  const promote = useCallback(
    (slot: number) => {
      if (promoteTimerRef.current) {
        clearTimeout(promoteTimerRef.current);
        promoteTimerRef.current = null;
      }
      const win = iframes[slot].current?.contentWindow;
      if (viewRef.current.manual) {
        win?.postMessage({ type: "preview:zoom", scale: viewRef.current.scale }, "*");
      }
      win?.postMessage({ type: "preview:scrollTo", y: scrollRef.current }, "*");
      pendingRef.current = null;
      activeRef.current = slot;
      setActive(slot);
      setReady(true);
      setLoading(false);
    },
    [iframes],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const payload = live && buildRef.current ? buildRef.current() : null;
      const html = payload
        ? await ebookApi.previewHtmlLive(token, ebookId, payload)
        : await ebookApi.previewHtml(token, ebookId);
      // First render goes into the visible buffer; later ones into the hidden
      // buffer, to be promoted once it reports Paged.js is done.
      const target = hasContentRef.current ? (1 - activeRef.current) : activeRef.current;
      pendingRef.current = target;
      hasContentRef.current = true;
      setBufs((prev) => {
        const next: [string, string] = [prev[0], prev[1]];
        next[target] = injectPreviewRuntime(html);
        return next;
      });
      // Normally the target iframe promotes itself via preview:info. This is a
      // safety net so a live edit still appears even if Paged.js is slow or
      // doesn't report back — the preview never gets stuck on a stale frame.
      if (promoteTimerRef.current) clearTimeout(promoteTimerRef.current);
      promoteTimerRef.current = setTimeout(() => {
        if (pendingRef.current === target) promote(target);
      }, 2000);
    } catch (err) {
      pendingRef.current = null;
      setError(err instanceof ApiError ? err.message : "Couldn't load the preview.");
      setLoading(false);
    }
  }, [token, ebookId, live, promote]);

  // Immediate load on mount and on an explicit refresh.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  // Live mode: debounce a reload after edits so the preview tracks typing
  // closely (the double buffer makes frequent updates cheap and flicker-free)
  // without firing a request on every keystroke.
  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => {
      load();
    }, 200);
    return () => clearTimeout(t);
  }, [revision, live, load]);

  // Clear any pending promote timer on unmount.
  useEffect(() => {
    return () => {
      if (promoteTimerRef.current) clearTimeout(promoteTimerRef.current);
    };
  }, []);

  // Messages from either iframe: page count, applied scale, and scroll position.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const slot = iframes.findIndex((r) => r.current?.contentWindow === e.source);
      if (slot < 0) return;
      const data = e.data as { type?: string; pages?: number; scale?: number; y?: number };

      if (data?.type === "preview:info") {
        if (typeof data.pages === "number") setPages(data.pages);
        if (typeof data.scale === "number") {
          setScale(data.scale);
          if (!viewRef.current.manual) viewRef.current.scale = data.scale;
        }
        if (slot === pendingRef.current) {
          // The freshly rendered (hidden) buffer is painted — cross-fade it in.
          promote(slot);
        }
      } else if (data?.type === "preview:scroll" && typeof data.y === "number") {
        if (slot === activeRef.current) scrollRef.current = data.y;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframes, promote]);

  const postZoom = useCallback(
    (msg: Record<string, unknown>) => {
      iframes[activeRef.current].current?.contentWindow?.postMessage(
        { type: "preview:zoom", ...msg },
        "*",
      );
    },
    [iframes],
  );

  const zoomIn = () => {
    const next = Math.min(1.5, scale + 0.1);
    viewRef.current = { scale: next, manual: true };
    setScale(next);
    postZoom({ scale: next });
  };
  const zoomOut = () => {
    const next = Math.max(0.3, scale - 0.1);
    viewRef.current = { scale: next, manual: true };
    setScale(next);
    postZoom({ scale: next });
  };
  const zoomFit = () => {
    viewRef.current = { ...viewRef.current, manual: false };
    postZoom({ fit: true });
  };

  const showOverlay = loading && !ready;
  const showUpdating = loading && ready;

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-xl border border-hairline-2 bg-surface-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline-2 bg-surface/70 px-3 py-2 backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Preview</span>
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-good/15 px-2 py-0.5 text-[11px] font-semibold text-good">
            <span className="h-1.5 w-1.5 rounded-full bg-good" /> Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-ink">
            Matches your PDF
          </span>
        )}
        {showUpdating && <span className="text-[11px] text-faint">updating…</span>}
        {pages != null && (
          <span className="text-xs text-muted">
            <b className="tabular-nums text-foreground-2">{pages}</b> pages
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <ZoomButton label="Zoom out" onClick={zoomOut}>
            −
          </ZoomButton>
          <button
            type="button"
            onClick={zoomFit}
            className="rounded-lg px-2 py-1 text-xs font-medium text-foreground-2 transition-colors hover:bg-surface-2"
            title="Fit to width"
          >
            Fit
          </button>
          <ZoomButton label="Zoom in" onClick={zoomIn}>
            +
          </ZoomButton>
          <span className="mx-1 h-5 w-px bg-hairline-2" aria-hidden />
          <button
            type="button"
            onClick={load}
            className="rounded-lg px-2 py-1 text-xs font-medium text-foreground-2 transition-colors hover:bg-surface-2"
            title="Refresh preview"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center gap-2 border-b border-amber-300/60 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
          <span>
            {live
              ? "Showing your unsaved edits — save to keep them and re-render the PDF."
              : "Unsaved changes — the preview shows your last saved version."}
          </span>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="ml-auto rounded-md bg-amber-600 px-2 py-0.5 font-semibold text-white hover:bg-amber-700"
            >
              Save
            </button>
          )}
        </div>
      )}

      {/* Stage */}
      <div className="relative min-h-0 flex-1">
        {/* Slim, smooth loading bar for live updates (content stays visible). */}
        {showUpdating && (
          <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden">
            <div className="preview-loading-bar h-full w-1/3 rounded-full bg-accent" />
          </div>
        )}
        {showOverlay && (
          <div className="absolute inset-0 z-20 flex items-center gap-2 bg-surface-3/70 p-4 text-sm text-muted">
            <Spinner /> Rendering your book…
          </div>
        )}
        {error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : (
          <>
            {([0, 1] as const).map((slot) => (
              <iframe
                key={slot}
                ref={iframes[slot]}
                title={slot === 0 ? "Book preview" : "Book preview (buffer)"}
                aria-hidden={active !== slot}
                // allow-scripts lets Paged.js paginate inside the frame; no
                // allow-same-origin, so the (user-uploaded) content stays isolated.
                sandbox="allow-scripts"
                srcDoc={bufs[slot]}
                className={`absolute inset-0 h-full w-full border-0 bg-transparent transition-opacity duration-150 ${
                  active === slot ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="h-7 w-7 rounded-lg text-base leading-none text-foreground-2 transition-colors hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

/**
 * Inject the preview runtime into the backend HTML: page chrome (a neutral
 * ground and paper shadows), a fit/zoom + scroll controller, and the Paged.js
 * polyfill. Paged.js reads the document's `@page` rules and paginates <body>
 * into `.pagedjs_page` boxes; `window.PagedConfig.after` runs our fit once it's
 * done. The page box is exactly 6in = 576 CSS px, so fitting is deterministic.
 */
function injectPreviewRuntime(html: string): string {
  const block = `
<style id="__preview_chrome">
  html { background:#e9ebef; }
  body { margin:0; }
  .pagedjs_pages { margin:0 auto; }
  .pagedjs_page { background:#fff; margin:16px auto;
    box-shadow:0 2px 4px rgba(0,0,0,.12), 0 14px 40px rgba(0,0,0,.20); }
  @media (prefers-color-scheme: dark){ html { background:#14161a; } }
</style>
<script>
(function(){
  var NATURAL = 576;            /* 6in at 96 CSS dpi */
  var scale = 1, manual = false, tick = 0;
  function report(){
    try {
      parent.postMessage({
        type:'preview:info',
        pages: document.querySelectorAll('.pagedjs_page').length,
        scale: scale
      }, '*');
    } catch(e){}
  }
  function fit(){
    var pages = document.querySelector('.pagedjs_pages');
    if(!pages) return;
    if(!manual){ scale = Math.min(1, (window.innerWidth - 32) / NATURAL); }
    pages.style.zoom = scale;
    report();
  }
  window.PagedConfig = { auto: true, after: function(){ fit(); } };
  window.addEventListener('resize', fit);
  window.addEventListener('scroll', function(){
    if(tick) return;
    tick = setTimeout(function(){ tick = 0;
      try { parent.postMessage({ type:'preview:scroll', y: window.scrollY }, '*'); } catch(e){}
    }, 120);
  });
  window.addEventListener('message', function(e){
    var d = e.data; if(!d) return;
    if(d.type === 'preview:zoom'){
      if(d.fit){ manual = false; } else { manual = true; scale = Math.max(0.3, Math.min(1.5, d.scale)); }
      fit();
    } else if(d.type === 'preview:scrollTo'){
      window.scrollTo(0, d.y || 0);
    }
  });
})();
</script>
<script src="/vendor/paged.polyfill.min.js"></script>
`;
  return html.includes("</body>") ? html.replace("</body>", block + "</body>") : html + block;
}
