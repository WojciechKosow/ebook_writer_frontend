import Image from "@tiptap/extension-image";

/** Horizontal placements an inline image can take within the text column. */
export type ImageAlign = "left" | "center" | "right";

/**
 * The TipTap image node, extended to carry `data-ebook-image-id`, a horizontal
 * alignment (`data-align`) and a `style` attribute. The data id is what lets an
 * inserted image round-trip back to its `ebook-image:<id>` Markdown token on
 * save (see lib/markdown.ts), instead of persisting the transient blob URL that
 * is only used for on-screen preview. `data-align` lets the author move an image
 * left / centre / right; it round-trips through the stored Markdown so the PDF
 * matches the preview exactly (see lib/markdown.ts).
 */
export const EbookImage = Image.extend({
  // Block-level (its own "section" between paragraphs) and draggable, so the
  // author can drag an image to move it between text blocks — ProseMirror drops
  // it at a block boundary, never inside a sentence. This is the placement model
  // the backend stores: the image token's position between paragraphs.
  inline: false,
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      "data-ebook-image-id": {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-ebook-image-id"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs["data-ebook-image-id"]
            ? { "data-ebook-image-id": attrs["data-ebook-image-id"] as string }
            : {},
      },
      // Horizontal alignment within the column. Defaults to centre, which is how
      // images have always rendered; the editor CSS (.rte-content img[data-align])
      // and the saved Markdown both key off this value.
      "data-align": {
        default: "center",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs: Record<string, unknown>) => {
          const align = attrs["data-align"];
          return align ? { "data-align": align as string } : {};
        },
      },
      style: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("style"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.style ? { style: attrs.style as string } : {},
      },
    };
  },
});
