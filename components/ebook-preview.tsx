"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ebookApi, ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui";

/**
 * Faithful book preview. Fetches the self-contained HTML from
 * `GET /api/ebooks/{id}/preview` (same layout + CSS as the downloadable PDF,
 * images inlined as data URIs) and renders it in a sandboxed iframe, paginated
 * into real 6×9-inch pages by the vendored Paged.js polyfill. This is the
 * "second world": what the reader sees on screen matches what they download.
 *
 * <p>The preview reflects the <b>saved</b> manuscript — the backend renders from
 * the database — so it refreshes after each save (and on demand). While there
 * are unsaved edits it shows a hint to save.
 */
export function EbookPreview({
  token,
  ebookId,
  refreshKey,
  dirty,
  onSave,
}: {
  token: string | null;
  ebookId: string;
  /** Bump to force a reload (e.g. after a save). */
  refreshKey: number;
  /** Whether the editor has unsaved changes (the preview would be stale). */
  dirty: boolean;
  /** Trigger a save from the "save to refresh" hint. */
  onSave?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");
  const [pages, setPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setPages(null);
    try {
      const html = await ebookApi.previewHtml(token, ebookId);
      setSrcDoc(injectPreviewRuntime(html));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the preview.");
    } finally {
      setLoading(false);
    }
  }, [token, ebookId]);

  useEffect(() => {
    // Fetch-on-mount / on-refresh; load() manages its own loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  // The iframe reports its page count (and applied scale) after Paged.js runs.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data as { type?: string; pages?: number; scale?: number };
      if (data?.type === "preview:info") {
        if (typeof data.pages === "number") setPages(data.pages);
        if (typeof data.scale === "number") setScale(data.scale);
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

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-xl border border-hairline-2 bg-surface-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline-2 bg-surface/70 px-3 py-2 backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Preview
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-ink">
          Matches your PDF
        </span>
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
          <span>Unsaved changes — the preview shows your last saved version.</span>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="ml-auto rounded-md bg-amber-600 px-2 py-0.5 font-semibold text-white hover:bg-amber-700"
            >
              Save to update
            </button>
          )}
        </div>
      )}

      {/* Stage */}
      <div className="relative min-h-0 flex-1">
        {loading && (
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
 * ground and paper shadows), a fit/zoom controller, and the Paged.js polyfill.
 * Paged.js reads the document's `@page` rules and paginates <body> into
 * `.pagedjs_page` boxes; `window.PagedConfig.after` runs our fit once it's done.
 * The page box is exactly 6in = 576 CSS px, so fitting is deterministic.
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
  var scale = 1, manual = false;
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
  window.addEventListener('message', function(e){
    var d = e.data;
    if(!d || d.type !== 'preview:zoom') return;
    if(d.fit){ manual = false; } else { manual = true; scale = Math.max(0.3, Math.min(1.5, d.scale)); }
    fit();
  });
})();
</script>
<script src="/vendor/paged.polyfill.min.js"></script>
`;
  return html.includes("</body>")
    ? html.replace("</body>", block + "</body>")
    : html + block;
}
