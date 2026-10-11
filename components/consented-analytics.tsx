"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { onConsentChange, readConsent } from "@/lib/consent";

/**
 * Google Analytics, loaded only after the visitor accepts analytics cookies.
 * Until then no gtag.js is requested and no GA cookie is set. Withdrawing
 * consent switches tracking off for the rest of the page view via GA's
 * documented `ga-disable-<id>` flag (the cookies are cleared in saveConsent).
 */
export function ConsentedAnalytics({ gaId }: { gaId: string }) {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const apply = (analytics: boolean) => {
      (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = !analytics;
      if (analytics) setGranted(true);
    };
    apply(readConsent()?.analytics ?? false);
    return onConsentChange((c) => apply(c.analytics));
  }, [gaId]);

  return granted ? <GoogleAnalytics gaId={gaId} /> : null;
}
