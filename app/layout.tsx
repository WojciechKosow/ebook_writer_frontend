import type { Metadata } from "next";
import { Instrument_Sans, Newsreader, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, themeScript } from "@/lib/theme-context";
import { sessionBootScript } from "@/lib/session-boot";
import { BRAND, TAGLINE } from "@/lib/brand";

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
  title: `${BRAND} — ${TAGLINE}`,
  description: TAGLINE,
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
      </body>
    </html>
  );
}
