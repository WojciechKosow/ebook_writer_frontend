import type { CSSProperties } from "react";
import { isColor, safeCss, type DesignDoc, type StyleId } from "./core";
import { STYLES } from "./schemas";

/**
 * How each store style dresses the pages beyond the store's home page — a
 * product's page and the after-purchase page. Those pages share one layout;
 * these tokens give it the style's paper, ink, type and buttons, so the whole
 * store reads as one design. The accent comes from the author's design.
 */
export interface PageTheme {
  dark: boolean;
  /** Accent used as text color: "accent", or a fixed color where the accent is a fill only (Bold's yellows). */
  accentText: string;
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  body: string;
  muted: string;
  line: string;
  display: string;
  text: string;
  mono: string;
  displayWeight: number;
  displayCase: "none" | "uppercase";
  displayTracking: string;
  /** Button: background ("accent" = the accent color), text color, shape. */
  btnBg: string;
  btnFg: string;
  btnRadius: string;
  btnBorder: string;
  btnShadow: string;
  cardRadius: string;
  cardBorder: string;
  cardShadow: string;
}

export const PAGE_THEMES: Record<StyleId, PageTheme> = {
  literary: {
    accentText: "accent", dark: false, bg: "#F4EFE6", surface: "#FBF8F2", surface2: "#EBE3D5", ink: "#1C1A16", body: "#3A352E", muted: "#57514A",
    line: "#DCD3C4", display: "var(--font-newsreader), Georgia, serif", text: "var(--sd-hanken), system-ui, sans-serif",
    mono: "var(--sd-hanken), system-ui, sans-serif", displayWeight: 300, displayCase: "none", displayTracking: "-0.02em",
    btnBg: "#1C1A16", btnFg: "#F4EFE6", btnRadius: "4px", btnBorder: "none", btnShadow: "none",
    cardRadius: "6px", cardBorder: "1px solid #DCD3C4", cardShadow: "none",
  },
  code: {
    accentText: "accent", dark: true, bg: "#090B0E", surface: "#0D1014", surface2: "#101318", ink: "#E8EAED", body: "#C5CBD3", muted: "#8A939E",
    line: "rgba(255,255,255,.08)", display: "var(--sd-geist), system-ui, sans-serif", text: "var(--sd-geist), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace", displayWeight: 600, displayCase: "none", displayTracking: "-0.038em",
    btnBg: "#EDEFF2", btnFg: "#090B0E", btnRadius: "12px", btnBorder: "none", btnShadow: "inset 0 -1px 0 rgba(0,0,0,.18), 0 10px 30px -10px rgba(237,239,242,.25)",
    cardRadius: "16px", cardBorder: "1px solid rgba(255,255,255,.08)", cardShadow: "none",
  },
  minimal: {
    accentText: "accent", dark: false, bg: "#F5F4F0", surface: "#FFFFFF", surface2: "#ECEAE4", ink: "#111111", body: "#3F3D39", muted: "#6E6B65",
    line: "#E2DFD8", display: "var(--sd-hanken), system-ui, sans-serif", text: "var(--sd-hanken), system-ui, sans-serif",
    mono: "var(--sd-dm-mono), ui-monospace, monospace", displayWeight: 400, displayCase: "none", displayTracking: "-0.045em",
    btnBg: "accent", btnFg: "#FFFFFF", btnRadius: "999px", btnBorder: "none", btnShadow: "none",
    cardRadius: "16px", cardBorder: "1px solid #E2DFD8", cardShadow: "none",
  },
  modern: {
    accentText: "accent", dark: true, bg: "#0B0B0E", surface: "#131318", surface2: "#1A1A21", ink: "#FFFFFF", body: "#C8C8D2", muted: "#9E9EAA",
    line: "rgba(255,255,255,.10)", display: "var(--sd-bricolage), system-ui, sans-serif", text: "var(--sd-dm-sans), system-ui, sans-serif",
    mono: "var(--sd-dm-mono), ui-monospace, monospace", displayWeight: 800, displayCase: "none", displayTracking: "-0.045em",
    btnBg: "accent", btnFg: "#0B0B0E", btnRadius: "999px", btnBorder: "none", btnShadow: "0 0 40px -8px color-mix(in srgb, var(--pp-accent) 55%, transparent)",
    cardRadius: "22px", cardBorder: "1px solid rgba(255,255,255,.10)", cardShadow: "none",
  },
  bold: {
    accentText: "#141414", dark: false, bg: "#FFF3DF", surface: "#FFFFFF", surface2: "#FFE7C2", ink: "#141414", body: "#2A2A2A", muted: "#555555",
    line: "#141414", display: "var(--sd-archivo), system-ui, sans-serif", text: "var(--sd-archivo), system-ui, sans-serif",
    mono: "ui-monospace, monospace", displayWeight: 900, displayCase: "uppercase", displayTracking: "-0.04em",
    btnBg: "accent", btnFg: "#141414", btnRadius: "14px", btnBorder: "3px solid #141414", btnShadow: "6px 6px 0 #141414",
    cardRadius: "18px", cardBorder: "3px solid #141414", cardShadow: "6px 6px 0 #141414",
  },
};

/** The CSS variables the shared page layout reads. */
export function pageThemeVars(t: PageTheme, accent: string): CSSProperties {
  return {
    "--pp-bg": t.bg, "--pp-surface": t.surface, "--pp-surface2": t.surface2, "--pp-ink": t.ink, "--pp-body": t.body,
    "--pp-muted": t.muted, "--pp-line": t.line, "--pp-accent": accent,
    "--pp-accent-text": t.accentText === "accent" ? accent : t.accentText, "--pp-display": t.display, "--pp-text": t.text,
    "--pp-mono": t.mono, "--pp-display-weight": t.displayWeight, "--pp-display-case": t.displayCase,
    "--pp-display-tracking": t.displayTracking, "--pp-btn-bg": t.btnBg === "accent" ? accent : t.btnBg,
    "--pp-btn-fg": t.btnFg, "--pp-btn-radius": t.btnRadius, "--pp-btn-border": t.btnBorder, "--pp-btn-shadow": t.btnShadow,
    "--pp-card-radius": t.cardRadius, "--pp-card-border": t.cardBorder, "--pp-card-shadow": t.cardShadow,
    colorScheme: t.dark ? "dark" : "light",
  } as CSSProperties;
}

/** The store's look for a product or after-purchase page: style, accent and the author's CSS. */
export function pageLook(design: DesignDoc, styleId?: StyleId) {
  const id = styleId ?? design.active;
  const settings = design.themes[id];
  const accent = isColor(settings?.accent) ? settings!.accent! : STYLES[id].accents[0];
  return { id, accent, css: safeCss(settings?.customCss) ?? "" };
}
