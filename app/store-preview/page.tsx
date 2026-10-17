"use client";

import { useEffect, useState } from "react";
import { StoreDesignView } from "@/components/store-design/store-design-view";
import type { PreviewMessage } from "@/lib/store-design/core";

/**
 * Renders a store design sent by the design editor (same origin only) inside
 * its preview frame, so phone and desktop widths use the real breakpoints.
 * Links don't navigate; in-page anchors scroll.
 */
export default function StorePreviewPage() {
  const [msg, setMsg] = useState<PreviewMessage | null>(null);

  useEffect(() => {
    let lastFocus: string | null = null;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const m = e.data as PreviewMessage;
      if (m?.type !== "sd-preview") return;
      setMsg(m);
      // Scroll only when the editor opens another section, not on every keystroke.
      if (m.focus !== lastFocus) lastFocus = m.focus ?? null;
      else return;
      if (m.focus) {
        requestAnimationFrame(() =>
          document.querySelector(`[data-section="${CSS.escape(m.focus!)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#") && href.length > 1) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    window.parent.postMessage({ type: "sd-preview-ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <>
      {/* The editor's own page already handles cookie consent. */}
      <style>{`body > [role="dialog"]{display:none !important}`}</style>
      {msg && <StoreDesignView doc={msg.doc} data={msg.data} styleId={msg.styleId} />}
    </>
  );
}
