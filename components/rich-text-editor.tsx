"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { forwardRef, useImperativeHandle, type ReactNode } from "react";
import { EbookImage } from "./ebook-image-extension";

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
  }
>(function RichTextEditor({ html, editable = true, onChange }, ref) {
  const editor = useEditor({
    extensions: [StarterKit, EbookImage],
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

  if (!editor) {
    return (
      <div className="min-h-[24rem] rounded-xl border border-hairline-2 bg-surface" />
    );
  }

  return (
    <div className="rounded-xl border border-hairline-2 bg-surface">
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
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
