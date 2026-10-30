import { StoreComingSoon } from "@/components/store/coming-soon";
import { STOREFRONTS_ENABLED } from "@/lib/store/availability";

/** Your store shows a "later version" note while storefronts are switched off. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return STOREFRONTS_ENABLED ? children : <StoreComingSoon />;
}
