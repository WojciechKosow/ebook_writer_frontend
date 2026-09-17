"use client";

import { useState, type ReactNode } from "react";

export interface EditorPanel {
  key: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

/**
 * The Canva-style editor frame: a top bar, a slim icon rail on the left whose
 * buttons open a purpose-built panel (Chapters, Images, …), the editing canvas in
 * the middle, and the live preview on the right. This is the "unique sidebar"
 * that replaces the app's generic nav while editing a book. Presentational: the
 * page supplies the header, the panels' content, the canvas and the preview; this
 * owns only which panel is open.
 */
export function EditorShell({
  header,
  panels,
  children,
  preview,
  showPreview,
}: {
  header: ReactNode;
  panels: EditorPanel[];
  /** The editing canvas. */
  children: ReactNode;
  preview: ReactNode;
  showPreview: boolean;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(panels[0]?.key ?? null);
  const active = panels.find((p) => p.key === activeKey) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-surface px-3">
        {header}
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
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

        {/* Canvas */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface-3">
          <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
        </main>

        {/* Preview */}
        {showPreview && (
          <aside className="hidden w-[26rem] shrink-0 border-l border-hairline bg-surface p-3 xl:block 2xl:w-[30rem]">
            <div className="h-full">{preview}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
