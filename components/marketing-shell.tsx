import { AmbientLayer } from "@/components/landing/ambient";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/**
 * Frame for every public page: the Ink & Paper palette, header and footer.
 * `ambient` sets the drifting background pages — the full set on the landing,
 * a few at the edges on content pages, none behind long reading (blog posts, legal).
 */
export function MarketingShell({
  ambient = "sparse",
  children,
}: {
  ambient?: "full" | "sparse" | "none";
  children: React.ReactNode;
}) {
  return (
    <div className="ink-paper relative flex min-h-full flex-1 flex-col overflow-x-clip">
      {ambient !== "none" && <AmbientLayer sparse={ambient === "sparse"} />}
      <SiteHeader />
      <main className="relative z-[1] flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
