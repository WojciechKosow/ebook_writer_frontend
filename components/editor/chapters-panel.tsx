"use client";

/**
 * The "Chapters" panel of the editor's left rail: the ordered chapter list with
 * select / add / reorder / delete. Purely presentational — all state and the
 * mutations live in the editor page; this renders them in the Canva-style panel.
 */
export interface ChapterListItem {
  key: string;
  id: string | null;
  title: string;
}

export function ChaptersPanel({
  chapters,
  activeKey,
  onSelect,
  onAdd,
  onMove,
  onRemove,
  canRemove,
}: {
  chapters: ChapterListItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
  onAdd: () => void;
  onMove: (key: string, delta: -1 | 1) => void;
  onRemove: (key: string) => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h2 className="text-sm font-semibold text-foreground">Chapters</h2>
        <span className="text-xs text-faint tabular-nums">{chapters.length}</span>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto px-2">
        {chapters.map((c, i) => {
          const isActive = c.key === activeKey;
          return (
            <li key={c.key}>
              <div
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent-ink"
                    : "text-foreground-2 hover:bg-surface-2"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(c.key)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="shrink-0 tabular-nums text-xs text-faint">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{c.title || `Chapter ${i + 1}`}</span>
                  {!c.id && (
                    <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                      new
                    </span>
                  )}
                </button>

                {/* Per-chapter controls, revealed for the active/hovered row */}
                <div
                  className={`flex shrink-0 items-center gap-0.5 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <IconBtn
                    label="Move chapter up"
                    disabled={i === 0}
                    onClick={() => onMove(c.key, -1)}
                  >
                    ↑
                  </IconBtn>
                  <IconBtn
                    label="Move chapter down"
                    disabled={i === chapters.length - 1}
                    onClick={() => onMove(c.key, 1)}
                  >
                    ↓
                  </IconBtn>
                  <IconBtn
                    label="Delete chapter"
                    disabled={!canRemove}
                    danger
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${c.title || `Chapter ${i + 1}`}"? This can't be undone once you save.`,
                        )
                      ) {
                        onRemove(c.key);
                      }
                    }}
                  >
                    ✕
                  </IconBtn>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="p-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-hairline-2 px-3 py-2 text-sm text-foreground-2 transition-colors hover:border-accent hover:text-accent-ink"
        >
          + Add chapter
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-6 w-6 place-items-center rounded text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-foreground-2 hover:bg-surface-3"
      }`}
    >
      {children}
    </button>
  );
}
