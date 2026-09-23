/**
 * Mirrors the backend CoverImageFitter: a cover whose shape differs from its
 * region is cropped (never stretched) to the region's ratio, with the crop window
 * centred on the focal point and clamped to the image. Returns the CSS
 * `object-position` that reproduces exactly that window under `object-fit: cover`,
 * so the editor shows the same framing as the PDF.
 */
export function coverObjectPosition(
  width: number,
  height: number,
  regionRatio: number,
  focalX: number | null | undefined,
  focalY: number | null | undefined,
): string {
  const fx = clampPct(focalX) / 100;
  const fy = clampPct(focalY) / 100;
  if (!width || !height) return `${fx * 100}% ${fy * 100}%`;

  const actual = width / height;
  let cw = width;
  let ch = height;
  if (actual > regionRatio) cw = height * regionRatio;
  else ch = width / regionRatio;

  const x = Math.max(0, Math.min(width - cw, fx * width - cw / 2));
  const y = Math.max(0, Math.min(height - ch, fy * height - ch / 2));
  // object-position p% offsets the image by p * (overflow); invert that.
  const px = width - cw > 0.5 ? (x / (width - cw)) * 100 : 50;
  const py = height - ch > 0.5 ? (y / (height - ch)) * 100 : 50;
  return `${round(px)}% ${round(py)}%`;
}

function clampPct(v: number | null | undefined): number {
  if (v === null || v === undefined || Number.isNaN(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
