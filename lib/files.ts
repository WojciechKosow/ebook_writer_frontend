import type { ProductFile } from "./types";

/** What the store's file pickers accept. The backend checks the real bytes. */
export const PRODUCT_FILE_ACCEPT = ".pdf,.epub,.zip,application/pdf,application/epub+zip,application/zip";

/** "1.4 MB" / "320 KB"; null for an unknown (0) size. */
export function formatSize(bytes: number) {
  if (bytes <= 0) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "PDF · 1.4 MB" */
export function fileMeta(file: ProductFile) {
  return [file.format, formatSize(file.sizeBytes)].filter(Boolean).join(" · ");
}
