import { ButtonLink } from "@/components/ui";
import { BRAND } from "@/lib/brand";

/**
 * Shown in place of every storefront screen while {@link STOREFRONTS_ENABLED}
 * is off. `audience` picks the wording: the author's own store, or a buyer
 * landing on a public store link.
 */
export function StoreComingSoon({ audience = "author" }: { audience?: "author" | "buyer" }) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5 px-4 py-16 text-center sm:py-24">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Coming soon</span>
      <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
        {audience === "author" ? "Your store is on its way" : "Stores are on their way"}
      </h1>
      <p className="text-[15px] leading-relaxed text-muted">
        {audience === "author"
          ? `Selling your ebooks from your own storefront will arrive in a later version of ${BRAND}. Until then, keep writing — your finished books stay in your library, ready to export as PDF.`
          : `Author storefronts will open in a later version of ${BRAND}. Check back soon.`}
      </p>
      <div className="flex justify-center">
        <ButtonLink href={audience === "author" ? "/dashboard" : "/"} variant="secondary">
          {audience === "author" ? "Go to Your library" : `Back to ${BRAND}`}
        </ButtonLink>
      </div>
    </div>
  );
}
