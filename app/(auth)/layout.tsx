import type { Metadata } from "next";

// Auth pages are thin and per-visitor — keep them out of the index so they
// don't dilute the site's ranking or compete with the marketing landing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-surface-2/60 px-6 py-12">
      {children}
    </main>
  );
}
