import type { Metadata } from "next";
import { Instrument_Sans, Newsreader, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, themeScript } from "@/lib/theme-context";
import { sessionBootScript } from "@/lib/session-boot";
import { BRAND } from "@/lib/brand";
import {
  SITE_URL,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_KEYWORDS,
} from "@/lib/site";

// Clean, slightly characterful grotesque for all UI + body copy.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

// Literary display serif — used with restraint for editorial moments.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves every relative URL below (OG image, canonical) to an absolute one.
  metadataBase: new URL(SITE_URL),
  title: {
    // Home/default title, plus a template child pages fill in (e.g. "Pricing").
    default: `${BRAND} — ${SITE_TAGLINE}`,
    template: `%s · ${BRAND}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: BRAND,
  keywords: SITE_KEYWORDS,
  authors: [{ name: BRAND }],
  creator: BRAND,
  publisher: BRAND,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: `${BRAND} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
    // og image is supplied by app/opengraph-image.tsx (auto-detected).
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    // twitter image falls back to the generated OG image.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Send an already-logged-in visitor off the public-only pages before
            they paint, so the landing never flashes before the client redirect. */}
        <script dangerouslySetInnerHTML={{ __html: sessionBootScript }} />
        {/* Apply the stored/system theme before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
