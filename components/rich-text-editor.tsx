"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { forwardRef, useImperativeHandle, useState, type ReactNode } from "react";
import { EbookImage } from "./ebook-image-extension";

/**
 * The `dataTransfer` type used when an asset is dragged from the Images panel
 * onto the editor. Shared with the image library panel so both sides agree on
 * the payload (the asset id). A private, app-specific MIME type keeps the drop
 * handler from reacting to arbitrary files/text dragged in.
 */
export const ASSET_DND_TYPE = "application/x-ebook-image";

/** The resolved image an asset id maps to when dropped (see resolveDropImage). */
export interface DropImage {
  id: string;
  url: string;
  alt?: string;
  widthPercent?: number | null;
}

/** What the page can drive on the editor imperatively (e.g. insert an asset). */
export interface RichTextEditorHandle {
  /**
   * Insert an image at the cursor, or replace the currently-selected image.
   * `id` is the asset id (persisted as the `ebook-image:<id>` token on save);
   * `url` is the blob URL used only for on-screen preview.
   */
  insertImage(image: { id: string; url: string; alt?: string; widthPercent?: number | null }): void;
  /** The asset id of the selected image, or null if no image is selected. */
  getSelectedImageId(): string | null;
}

/**
 * A lightweight Word-like rich-text editor. Edits HTML internally (via TipTap);
 * the page converts to/from Markdown at load and save time. Remount with a
 * `key` to load a different chapter. Exposes an imperative handle so the asset
 * panel can insert/replace images in the active chapter.
 */
export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  {
    html: string;
    editable?: boolean;
    onChange: (html: string) => void;
    /**
     * Resolve an asset id (dragged from the Images panel) to a displayable
     * image. When provided, the author can drag a thumbnail onto the page and it
     * is inserted at the drop point. Returning undefined cancels the drop.
     */
    resolveDropImage?: (assetId: string) => DropImage | undefined;
    /**
     * Persist a new display width (percent of the column) for an asset — the
     * width isn't stored in the chapter Markdown but on the asset itself, so the
     * image options menu delegates the save here. When omitted, the width control
     * is hidden.
     */
    onImageSetWidth?: (assetId: string, widthPercent: number) => void;
  }
>(function RichTextEditor(
  { html, editable = true, onChange, resolveDropImage, onImageSetWidth },
  ref,
) {
  const [dropActive, setDropActive] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // The drop indicator shown while dragging an image between blocks:
        // a thick accent line at the block boundary it'll land on. Colored via
        // CSS (.ebook-dropcursor) so it follows the light/dark accent token.
        dropcursor: { width: 3, color: false, class: "ebook-dropcursor" },
      }),
      EbookImage,
    ],
    content: html,
    editable,
    // Required for SSR (Next.js) to avoid a hydration mismatch.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rte-content focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useImperativeHandle(
    ref,
    () => ({
      insertImage({ id, url, alt = "", widthPercent }) {
        if (!editor) return;
        const attrs: Record<string, unknown> = {
          src: url,
          alt,
          "data-ebook-image-id": id,
          style: widthPercent ? `width:${widthPercent}%` : null,
        };
        if (editor.isActive("image")) {
          editor.chain().focus().updateAttributes("image", attrs).run();
        } else {
          editor.chain().focus().insertContent({ type: "image", attrs }).run();
        }
      },
      getSelectedImageId() {
        if (!editor || !editor.isActive("image")) return null;
        return (editor.getAttributes("image")["data-ebook-image-id"] as string) ?? null;
      },
    }),
    [editor],
  );

  const isAssetDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes(ASSET_DND_TYPE);

  const handleDragOver = (e: React.DragEvent) => {
    if (!editable || !resolveDropImage || !isAssetDrag(e)) return;
    // Required so the browser fires a `drop`; only for our own asset drags, so
    // ProseMirror's native image drag-between-blocks is left untouched.
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!dropActive) setDropActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAssetDrag(e)) return;
    // Ignore moves between children — only clear when leaving the drop area.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDropActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!editable || !resolveDropImage || !isAssetDrag(e) || !editor) return;
    e.preventDefault();
    setDropActive(false);
    const assetId = e.dataTransfer.getData(ASSET_DND_TYPE);
    if (!assetId) return;
    const img = resolveDropImage(assetId);
    if (!img) return;
    const attrs: Record<string, unknown> = {
      src: img.url,
      alt: img.alt ?? "",
      "data-ebook-image-id": img.id,
      style: img.widthPercent ? `width:${img.widthPercent}%` : null,
    };
    // Insert at the drop point (the block boundary the pointer is over), so the
    // image lands where the author released it — like dragging within the page.
    const at = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
    const chain = editor.chain().focus();
    if (at) chain.insertContentAt(at.pos, { type: "image", attrs });
    else chain.insertContent({ type: "image", attrs });
    chain.run();
  };

  if (!editor) {
    return (
      <div className="min-h-[24rem] rounded-xl border border-hairline-2 bg-surface" />
    );
  }

  const selectedImageId =
    editable && editor.isActive("image")
      ? ((editor.getAttributes("image")["data-ebook-image-id"] as string) ?? "img")
      : null;

  return (
    <div className="rounded-xl border border-hairline-2 bg-surface">
      {editable && <Toolbar editor={editor} />}
      <div
        className={`relative rounded-b-xl transition-shadow ${
          dropActive ? "ring-2 ring-inset ring-accent" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <EditorContent editor={editor} />
        {dropActive && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-accent-soft/20">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-soft">
              Drop to place image
            </span>
          </div>
        )}
      </div>

      {editable && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive("image")}
          appendTo={() => document.body}
          options={{ placement: "top-end", offset: 10, strategy: "fixed", flip: true, shift: { padding: 8 } }}
          className="imgmenu"
        >
          {/* Remount per selected image so the menu opens fresh (collapsed). */}
          <ImageOptionsMenu key={selectedImageId ?? "none"} editor={editor} onSetWidth={onImageSetWidth} />
        </BubbleMenu>
      )}
    </div>
  );
});

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-hairline-2 px-2 py-1.5">
      <ToolButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolButton>

      <Divider />

      {([1, 2, 3] as const).map((level) => (
        <ToolButton
          key={level}
          label={`Heading ${level}`}
          active={editor.isActive("heading", { level })}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
        >
          H{level}
        </ToolButton>
      ))}

      <Divider />

      <ToolButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolButton>
      <ToolButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolButton>

      <Divider />

      <ImageAlignButtons editor={editor} />

      <Divider />

      <ToolButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        ↶
      </ToolButton>
      <ToolButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        ↷
      </ToolButton>
    </div>
  );
}

/**
 * Left / centre / right alignment for the selected image. The buttons are only
 * enabled when an image is selected; each sets the image node's `data-align`,
 * which drives both the in-editor placement and the alignment saved into the
 * Markdown (so the preview and PDF match).
 */
function ImageAlignButtons({ editor }: { editor: Editor }) {
  const imageActive = editor.isActive("image");
  const current = imageActive
    ? ((editor.getAttributes("image")["data-align"] as string) || "center")
    : null;

  const options: { value: "left" | "center" | "right"; label: string }[] = [
    { value: "left", label: "Align image left" },
    { value: "center", label: "Center image" },
    { value: "right", label: "Align image right" },
  ];

  return (
    <>
      {options.map(({ value, label }) => (
        <ToolButton
          key={value}
          label={label}
          active={current === value}
          disabled={!imageActive}
          onClick={() =>
            editor.chain().focus().updateAttributes("image", { "data-align": value }).run()
          }
        >
          <AlignIcon align={value} />
        </ToolButton>
      ))}
    </>
  );
}

/** Small alignment glyph: a framed picture pushed to one side of the column. */
function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  const x = align === "left" ? 2 : align === "right" ? 8 : 5;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none">
      <line x1="1" y1="2.5" x2="15" y2="2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x={x} y="5" width="6" height="6" rx="1" fill="currentColor" />
      <line x1="1" y1="13.5" x2="15" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The floating "•••" options menu for the selected image (Canva-style). Opens a
 * card over the image with quick alignment, width presets and "Remove from page"
 * — which deletes the image from this chapter but leaves the asset in the project
 * library (so it can be reused), rather than deleting it outright.
 */
function ImageOptionsMenu({
  editor,
  onSetWidth,
}: {
  editor: Editor;
  onSetWidth?: (assetId: string, widthPercent: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const attrs = editor.getAttributes("image");
  const assetId = (attrs["data-ebook-image-id"] as string) ?? null;
  const align = ((attrs["data-align"] as string) || "center") as "left" | "center" | "right";
  const widthMatch = ((attrs["style"] as string) || "").match(/width:\s*(\d+)/);
  const width = widthMatch ? Number(widthMatch[1]) : 100;

  const setAlign = (v: "left" | "center" | "right") =>
    editor.chain().focus().updateAttributes("image", { "data-align": v }).run();

  const setWidth = (pct: number) => {
    // Reflect the new size in the editor immediately, then persist it on the
    // asset (width lives on the asset, not the chapter Markdown).
    editor.chain().focus().updateAttributes("image", { style: `width:${pct}%` }).run();
    if (assetId && onSetWidth) onSetWidth(assetId, pct);
    setOpen(false);
  };

  const removeFromPage = () => {
    editor.chain().focus().deleteSelection().run();
    setOpen(false);
  };

  const widths: { label: string; pct: number }[] = [
    { label: "S", pct: 50 },
    { label: "M", pct: 75 },
    { label: "Full", pct: 100 },
  ];

  return (
    <div className="imgmenu-trigger relative">
      <button
        type="button"
        aria-label="Image options"
        aria-expanded={open}
        title="Image options"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded-full border border-hairline-2 bg-surface/95 px-2.5 text-foreground-2 shadow-lg backdrop-blur transition-all hover:bg-surface-2 hover:text-foreground active:scale-95 ${
          open ? "bg-surface-2 text-foreground ring-2 ring-accent/30" : ""
        }`}
      >
        <IconDots />
        <span className="text-xs font-medium">Edit</span>
      </button>

      {open && (
        <>
          {/* Click-away catcher */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="imgmenu-pop absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-hairline-2 bg-surface p-2 shadow-xl">
            <p className="px-1 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
              Align
            </p>
            <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
              {(["left", "center", "right"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAlign(v)}
                  aria-label={`Align ${v}`}
                  aria-pressed={align === v}
                  className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-colors ${
                    align === v
                      ? "bg-surface text-accent-ink shadow-soft"
                      : "text-foreground-2 hover:text-foreground"
                  }`}
                >
                  <AlignIcon align={v} />
                </button>
              ))}
            </div>

            {onSetWidth && (
              <>
                <p className="px-1 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Width
                </p>
                <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
                  {widths.map(({ label, pct }) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWidth(pct)}
                      aria-pressed={width === pct}
                      className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-colors ${
                        width === pct
                          ? "bg-surface text-accent-ink shadow-soft"
                          : "text-foreground-2 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="my-2 h-px bg-hairline-2" />
            <button
              type="button"
              onClick={removeFromPage}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <IconTrash /> Remove from page
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6" />
    </svg>
  );
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`min-w-8 rounded-lg px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-accent-soft text-accent-ink"
          : "text-foreground-2 hover:bg-surface-2"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-hairline-2" aria-hidden />;
}
