import { StoreComingSoon } from "@/components/store/coming-soon";
import { STOREFRONTS_ENABLED } from "@/lib/store/availability";

/** The store designers are closed, with the same note, while storefronts are switched off. */
export default function StoreEditorLayout({ children }: { children: React.ReactNode }) {
  if (STOREFRONTS_ENABLED) return children;
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <StoreComingSoon />
    </div>
  );
}
