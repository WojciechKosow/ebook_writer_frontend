import Image from "@tiptap/extension-image";

/**
 * The TipTap image node, extended to carry `data-ebook-image-id` and a `style`
 * attribute. The data id is what lets an inserted image round-trip back to its
 * `ebook-image:<id>` Markdown token on save (see lib/markdown.ts), instead of
 * persisting the transient blob URL that is only used for on-screen preview.
 */
export const EbookImage = Image.extend({
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
      style: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("style"),
        renderHTML: (attrs: Record<string, unknown>) =>
          attrs.style ? { style: attrs.style as string } : {},
      },
    };
  },
});
