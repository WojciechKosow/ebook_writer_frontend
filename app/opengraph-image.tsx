import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { SHARE_TITLE } from "@/lib/site";

// The link-preview card shown when a Scrivetta URL is shared on social /
// messaging apps (Discord, Slack, iMessage, X…). Generated at build time
// (statically optimized). It mirrors the landing page's "ink & paper" look —
// warm paper, ink headline in Newsreader, brass accents, a finished cover —
// so the preview feels like the product rather than a generic banner.
// Previews are often shown at ~400px wide, so type is set large.
export const alt = SHARE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f3efe6";
const PAGE = "#fbf9f4";
const INK = "#1b1814";
const INK_2 = "#4b453c";
const MUTED = "#6b6357";
const HAIR = "#e4dccd";
const BRASS = "#8a5c1f";
const COVER = "#241e52";
const GOLD = "#d9ae68";
const CREAM = "#f3e7cf";

const asset = (name: string) => readFile(join(process.cwd(), "assets/og", name));

export default async function OpengraphImage() {
  const [serif, serifItalic, sans, sansBold, mono, logo] = await Promise.all([
    asset("Newsreader-Light.woff"),
    asset("Newsreader-LightItalic.woff"),
    asset("InstrumentSans-Medium.woff"),
    asset("InstrumentSans-SemiBold.woff"),
    asset("GeistMono-Medium.woff"),
    asset("logo.png"),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: PAPER,
          backgroundImage:
            "radial-gradient(90% 120% at 100% 0%, rgba(201,160,99,0.22) 0%, rgba(243,239,230,0) 60%)",
          fontFamily: "Instrument Sans",
          color: INK,
        }}
      >
        {/* Left: brand, headline, promise. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "720px",
            padding: "64px 0 60px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <img src={logoSrc} width={60} height={60} alt="" style={{ borderRadius: "15px" }} />
            <div style={{ fontSize: "36px", fontWeight: 600, letterSpacing: "-0.02em" }}>{BRAND}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Newsreader",
                fontWeight: 300,
                fontSize: "76px",
                lineHeight: 1.04,
                whiteSpace: "nowrap",
                letterSpacing: "-0.025em",
              }}
            >
              <div>Your knowledge in.</div>
              <div style={{ display: "flex" }}>
                A&nbsp;<span style={{ fontStyle: "italic", color: BRASS }}>finished book</span>&nbsp;out.
              </div>
            </div>
            <div style={{ fontSize: "30px", lineHeight: 1.35, color: INK_2, maxWidth: "580px" }}>
              Turn your notes into a typeset ebook, written in your voice.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Geist Mono",
              fontSize: "20px",
              letterSpacing: "0.14em",
              color: MUTED,
            }}
          >
            SCRIVETTA.COM
          </div>
        </div>

        {/* Right: a finished cover over a typeset page — what you get. */}
        <div style={{ display: "flex", position: "relative", flex: 1 }}>
          <div
            style={{
              position: "absolute",
              top: "92px",
              left: "168px",
              width: "290px",
              height: "420px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "44px 36px",
              background: PAGE,
              border: `1px solid ${HAIR}`,
              borderRadius: "4px",
              boxShadow: "0 30px 60px -30px rgba(60,44,20,0.35)",
              transform: "rotate(4deg)",
            }}
          >
            <div style={{ fontFamily: "Geist Mono", fontSize: "13px", letterSpacing: "0.16em", color: BRASS }}>
              CHAPTER THREE
            </div>
            <div style={{ fontFamily: "Newsreader", fontSize: "30px", lineHeight: 1.1 }}>Designing your morning</div>
            <div style={{ width: "40px", height: "1px", background: "#c9a063" }} />
            {[260, 236, 252, 220, 248, 140].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: "7px", borderRadius: "4px", background: HAIR }} />
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              top: "108px",
              left: "18px",
              width: "290px",
              height: "420px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "44px 28px 36px",
              background: COVER,
              borderRadius: "3px 8px 8px 3px",
              boxShadow: "0 40px 70px -24px rgba(20,14,40,0.55)",
              transform: "rotate(-3deg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                right: "14px",
                bottom: "14px",
                border: "1px solid rgba(217,174,104,0.45)",
                borderRadius: "2px",
              }}
            />
            <div style={{ fontFamily: "Geist Mono", fontSize: "12px", letterSpacing: "0.2em", color: GOLD }}>
              A PRACTICAL GUIDE
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "30px",
                fontFamily: "Newsreader",
                fontSize: "42px",
                lineHeight: 1.04,
                color: CREAM,
              }}
            >
              <div>The Quiet</div>
              <div style={{ fontStyle: "italic" }}>Productivity</div>
              <div>Method</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "26px" }}>
              <div style={{ width: "16px", height: "1px", background: GOLD }} />
              <div style={{ width: "9px", height: "9px", border: `1px solid ${GOLD}`, transform: "rotate(45deg)" }} />
              <div style={{ width: "16px", height: "1px", background: GOLD }} />
            </div>
            <div
              style={{
                marginTop: "auto",
                fontFamily: "Geist Mono",
                fontSize: "12px",
                letterSpacing: "0.18em",
                color: GOLD,
              }}
            >
              YOUR NAME
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, weight: 300, style: "normal" },
        { name: "Newsreader", data: serifItalic, weight: 300, style: "italic" },
        { name: "Instrument Sans", data: sans, weight: 500, style: "normal" },
        { name: "Instrument Sans", data: sansBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
