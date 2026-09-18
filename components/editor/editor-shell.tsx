"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface EditorPanel {
  key: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

/** Preview width limits + where side-by-side turns into overlap. */
const PREVIEW_MIN = 340;
const PREVIEW_DEFAULT = 460;
/** Up to this width the canvas reserves room (side-by-side); beyond it the
 *  preview overlaps the editor so you can widen it to read the whole book. */
const PREVIEW_RESERVE_CAP = 560;
const PREVIEW_WIDTH_KEY = "ebook.previewWidth";

/**
 * The Canva-style editor frame: a top bar, a slim icon rail on the left whose
 * buttons open a purpose-built panel (Chapters, Images, …), the editing canvas in
 * the middle, and the live preview on the right. This is the "unique sidebar"
 * that replaces the app's generic nav while editing a book.
 *
 * <p>The preview is a right-anchored, resizable overlay: drag its left edge to
 * widen it. While narrow it sits beside the editor (the canvas reserves room);
 * dragged wider it slides over the editor so you can preview the whole book.
 */
export function EditorShell({
  header,
  panels,
  children,
  preview,
  showPreview,
  defaultPanelKey,
}: {
  header: ReactNode;
  panels: EditorPanel[];
  /** The editing canvas. */
  children: ReactNode;
  preview: ReactNode;
  showPreview: boolean;
  /** Which panel is open on first render (defaults to the first one). */
  defaultPanelKey?: string;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(
    defaultPanelKey ?? panels[0]?.key ?? null,
  );
  const active = panels.find((p) => p.key === activeKey) ?? null;

  const bodyRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(PREVIEW_DEFAULT);
  const [dragging, setDragging] = useState(false);

  const clampWidth = useCallback((w: number) => {
    const container = bodyRef.current?.getBoundingClientRect().width ?? 1200;
    const max = Math.max(PREVIEW_MIN, container - 96); // keep the rail + a sliver visible
    return Math.round(Math.min(Math.max(PREVIEW_MIN, w), max));
  }, []);

  // Restore a saved width, then keep it within bounds on resize.
  useEffect(() => {
    let restored = PREVIEW_DEFAULT;
    try {
      const s = localStorage.getItem(PREVIEW_WIDTH_KEY);
      if (s) restored = Number(s) || PREVIEW_DEFAULT;
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewWidth(clampWidth(restored));
    const onResize = () => setPreviewWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_WIDTH_KEY, String(previewWidth));
    } catch {
      /* ignore */
    }
  }, [previewWidth]);

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      const onMove = (ev: PointerEvent) => {
        const rect = bodyRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPreviewWidth(clampWidth(rect.right - ev.clientX));
      };
      const onUp = () => {
        setDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [clampWidth],
  );

  const reserve = showPreview ? Math.min(previewWidth, PREVIEW_RESERVE_CAP) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-surface px-3">
        {header}
      </header>

      {/* Body */}
      <div ref={bodyRef} className="relative flex min-h-0 flex-1">
        {/* Icon rail */}
        <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-hairline bg-surface py-3">
          {panels.map((p) => {
            const isActive = p.key === activeKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setActiveKey(isActive ? null : p.key)}
                aria-label={p.label}
                aria-pressed={isActive}
                title={p.label}
                className={`flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent-ink"
                    : "text-muted hover:bg-surface-2 hover:text-foreground-2"
                }`}
              >
                <span className="grid h-5 w-5 place-items-center">{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </nav>

        {/* Expandable panel */}
        {active && (
          <aside className="w-72 shrink-0 overflow-hidden border-r border-hairline bg-surface">
            {active.content}
          </aside>
        )}

        {/* Canvas — reserves room for the preview while it's narrow. */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface-3" style={{ paddingRight: reserve }}>
          <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
        </main>

        {/* Preview — right-anchored resizable overlay. */}
        {showPreview && (
          <div
            className="absolute right-0 top-0 z-20 h-full bg-surface-3 shadow-[-10px_0_30px_-12px_rgba(0,0,0,0.35)]"
            style={{ width: previewWidth }}
          >
            {/* Drag handle on the left edge */}
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize preview"
              onPointerDown={startResize}
              className="group absolute left-0 top-0 z-10 flex h-full w-3 -translate-x-1/2 cursor-col-resize items-center justify-center"
            >
              <span
                className={`h-10 w-1 rounded-full transition-colors ${
                  dragging ? "bg-accent" : "bg-hairline-2 group-hover:bg-accent"
                }`}
              />
            </div>
            <div className="h-full py-3 pl-2 pr-3">{preview}</div>
          </div>
        )}
      </div>
    </div>
  );
}
