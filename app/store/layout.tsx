import { MarketingShell } from "@/components/marketing-shell";
import { StoreComingSoon } from "@/components/store/coming-soon";
import { STOREFRONTS_ENABLED } from "@/lib/store/availability";

/** Public store pages stay hidden behind a note while storefronts are switched off. */
export default function PublicStoreLayout({ children }: { children: React.ReactNode }) {
  if (STOREFRONTS_ENABLED) return children;
  return (
    <MarketingShell ambient="none">
      <StoreComingSoon audience="buyer" />
    </MarketingShell>
  );
}
