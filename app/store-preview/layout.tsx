import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store preview",
  robots: { index: false, follow: false },
};

export default function StorePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
