import type { Metadata } from "next";
import { Showcase } from "@/components/landing/showcase";

export const metadata: Metadata = {
  title: "Scrivetta — product film",
  robots: { index: false, follow: false },
};

/**
 * A clean, chrome-free stage for the three-beat product film — sized for
 * screen-recording. The animation loops on its own; use the controls to pause
 * or replay for a clean take.
 */
export default function ShowcasePage() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-12">
      <div className="w-full max-w-4xl">
        <Showcase captions controls />
      </div>
    </main>
  );
}
