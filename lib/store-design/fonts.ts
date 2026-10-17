import { Archivo, Bricolage_Grotesque, DM_Mono, DM_Sans, Geist, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import type { StyleId } from "./core";

// Self-hosted by next/font: store pages never call Google from the buyer's browser.
// Newsreader, Instrument Sans and Geist Mono come from the root layout.
const plexMono = IBM_Plex_Mono({ variable: "--sd-plex-mono", subsets: ["latin"], weight: ["400", "500"] });
const geist = Geist({ variable: "--sd-geist", subsets: ["latin"] });
const hanken = Hanken_Grotesk({ variable: "--sd-hanken", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--sd-dm-mono", subsets: ["latin"], weight: ["400", "500"] });
const bricolage = Bricolage_Grotesque({ variable: "--sd-bricolage", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--sd-dm-sans", subsets: ["latin"] });
const archivo = Archivo({ variable: "--sd-archivo", subsets: ["latin"] });

/** Font variables a style needs on its root element. */
export const STYLE_FONTS: Record<StyleId, string> = {
  literary: plexMono.variable,
  code: geist.variable,
  minimal: `${hanken.variable} ${dmMono.variable}`,
  modern: `${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`,
  bold: archivo.variable,
};

/** Every style's fonts at once — for the style picker's swatches. */
export const ALL_STYLE_FONTS = Object.values(STYLE_FONTS).join(" ");
