"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");
  const [pages, setPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  // Latest content builder, read without changing `load`'s identity so a
  // keystroke doesn't recreate the effect (the debounce owns the cadence).
  const buildRef = useRef(buildContent);
  useEffect(() => {
    buildRef.current = buildContent;
  }, [buildContent]);

  // Scroll preservation across the srcDoc swap on a live update.
  const scrollRef = useRef(0);
  const restorePendingRef = useRef(false);
  const hasContentRef = useRef(false);

  const load = useCallback(async () => {
    if (!token) return;
    const isUpdate = hasContentRef.current;
    setLoading(true);
    setError(null);
    try {
      const payload = live && buildRef.current ? buildRef.current() : null;
      const html = payload
        ? await ebookApi.previewHtmlLive(token, ebookId, payload)
        : await ebookApi.previewHtml(token, ebookId);
      restorePendingRef.current = isUpdate; // keep scroll position on a refresh
      setSrcDoc(injectPreviewRuntime(html));
      hasContentRef.current = true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the preview.");
    } finally {
      setLoading(false);
    }
  }, [token, ebookId, live]);

  // Immediate load on mount and on an explicit refresh.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  // Live mode: debounce a reload after edits so the preview tracks typing
  // without a request per keystroke.
  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => {
      load();
    }, 900);
    return () => clearTimeout(t);
  }, [revision, live, load]);

  // Messages from the iframe: page count, applied scale, and scroll position.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data as { type?: string; pages?: number; scale?: number; y?: number };
      if (data?.type === "preview:info") {
        if (typeof data.pages === "number") setPages(data.pages);
        if (typeof data.scale === "number") setScale(data.scale);
        // After a live re-render, put the reader back where they were.
        if (restorePendingRef.current) {
          restorePendingRef.current = false;
          iframeRef.current?.contentWindow?.postMessage(
            { type: "preview:scrollTo", y: scrollRef.current },
            "*",
          );
        }
      } else if (data?.type === "preview:scroll" && typeof data.y === "number") {
        scrollRef.current = data.y;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const postZoom = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "preview:zoom", ...msg }, "*");
  }, []);

  const zoomIn = () => postZoom({ scale: Math.min(1.5, scale + 0.1) });
  const zoomOut = () => postZoom({ scale: Math.max(0.3, scale - 0.1) });
  const zoomFit = () => postZoom({ fit: true });

  const showOverlay = loading && !srcDoc;
  const showUpdating = loading && !!srcDoc;

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
        {showOverlay && (
          <div className="absolute inset-0 z-10 flex items-center gap-2 bg-surface-3/70 p-4 text-sm text-muted">
            <Spinner /> Rendering your book…
          </div>
        )}
        {error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : (
          <iframe
            ref={iframeRef}
            title="Book preview"
            // allow-scripts lets Paged.js paginate inside the frame; no
            // allow-same-origin, so the (user-uploaded) content stays isolated.
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className="h-full w-full border-0 bg-transparent"
          />
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
