# Vendored third-party assets

## paged.polyfill.min.js

[Paged.js](https://pagedjs.org/) — the CSS Paged Media polyfill, pinned at
**v0.4.3** (`npm pack pagedjs@0.4.3`, `dist/paged.polyfill.min.js`).

Served statically and loaded inside the book-preview iframe (see
`components/ebook-preview.tsx`). It reads the `@page` rules in the book CSS the
backend's `/api/ebooks/{id}/preview` endpoint returns and paginates the manuscript
into real 6×9-inch pages, so the preview matches the downloadable PDF.

Vendored (rather than loaded from a CDN) so the preview works offline and carries
no runtime third-party dependency. To update: re-run `npm pack pagedjs@<version>`
and replace this file.
