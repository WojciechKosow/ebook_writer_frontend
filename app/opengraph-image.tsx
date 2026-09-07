import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { SITE_TAGLINE } from "@/lib/site";

// The link-preview card shown when a Scrivetta URL is shared on social /
// messaging apps. Generated at build time (statically optimized).
export const alt = `${BRAND} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 140% at 50% 0%, #6d5ef0 0%, #3f32b0 55%, #241d5e 100%)",
          padding: "80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            {BRAND.charAt(0)}
          </div>
          <div style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            {BRAND}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            One idea in. A finished book out.
          </div>
          <div style={{ fontSize: "34px", color: "rgba(255,255,255,0.82)", maxWidth: "820px" }}>
            {`${SITE_TAGLINE} — outline, chapters, editing, and a print-ready PDF.`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "26px",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>No blank page</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "rgba(255,255,255,0.5)" }} />
          <span>Chapter-by-chapter</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "rgba(255,255,255,0.5)" }} />
          <span>Export-ready PDF</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
