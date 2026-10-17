"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StoreDesignView } from "@/components/store-design/store-design-view";
import type { PreviewMessage, PreviewPick } from "@/lib/store-design/core";

type Box = { id: string; top: number; left: number; width: number; height: number };

/**
 * Renders a store design sent by the design editor (same origin only) inside
 * its preview frame, so phone and desktop widths use the real breakpoints.
 * Links don't navigate. In click-to-edit mode every section is outlined on
 * hover and a click tells the editor which section to open.
 */
export default function StorePreviewPage() {
  const [msg, setMsg] = useState<PreviewMessage | null>(null);
  const [hover, setHover] = useState<Box | null>(null);
  const [selected, setSelected] = useState<Box | null>(null);
  const latest = useRef<PreviewMessage | null>(null);
  const hoverId = useRef<string | null>(null);

  const boxOf = useCallback((id: string | null): Box | null => {
    if (!id) return null;
    const el = document.querySelector(`[data-section="${CSS.escape(id)}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { id, top: r.top, left: r.left, width: r.width, height: r.height };
  }, []);

  const refresh = useCallback(() => {
    setHover(boxOf(hoverId.current));
    setSelected(boxOf(latest.current?.pick?.selected ?? null));
  }, [boxOf]);

  useEffect(() => {
    let lastFocus: string | null = null;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const m = e.data as PreviewMessage;
      if (m?.type !== "sd-preview") return;
      latest.current = m;
      setMsg(m);
      requestAnimationFrame(refresh);
      // Scroll only when the editor opens another section, not on every keystroke.
      if (m.focus === lastFocus) return;
      lastFocus = m.focus ?? null;
      if (m.focus) {
        requestAnimationFrame(() =>
          scrollToEl(document.querySelector(`[data-section="${CSS.escape(m.focus!)}"]`)),
        );
      }
    };
    const sectionAt = (t: EventTarget | null) => (t as Element | null)?.closest?.("[data-section]")?.getAttribute("data-section") ?? null;
    const onMove = (e: MouseEvent) => {
      if (!latest.current?.pick) return;
      const id = sectionAt(e.target);
      if (id !== hoverId.current) {
        hoverId.current = id;
        setHover(boxOf(id));
      }
    };
    const onLeave = () => {
      hoverId.current = null;
      setHover(null);
    };
    const onClick = (e: MouseEvent) => {
      const pick = latest.current?.pick;
      const id = pick ? sectionAt(e.target) : null;
      if (id) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: "sd-preview-pick", section: id } satisfies PreviewPick, window.location.origin);
        return;
      }
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#") && href.length > 1) scrollToEl(document.getElementById(href.slice(1)));
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    window.parent.postMessage({ type: "sd-preview-ready" }, window.location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [boxOf, refresh]);

  const labels = msg?.pick?.labels ?? {};
  return (
    <>
      {/* The editor's own page already handles cookie consent. */}
      <style>{`body > [role="dialog"]{display:none !important}${msg?.pick ? "[data-section]{cursor:pointer}" : ""}`}</style>
      {msg && <StoreDesignView doc={msg.doc} data={msg.data} styleId={msg.styleId} />}
      {msg?.pick && [selected, hover && hover.id !== selected?.id ? hover : null].map((b, i) =>
        b ? <Outline key={i} box={b} label={labels[b.id] ?? b.id} strong={i === 0} /> : null,
      )}
    </>
  );
}

/** Scroll only this frame's window (scrollIntoView would also scroll the editor around the frame). */
function scrollToEl(el: Element | null) {
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: "smooth" });
}

function Outline({ box, label, strong }: { box: Box; label: string; strong: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", top: box.top, left: box.left, width: box.width, height: box.height, zIndex: 2147483000,
        pointerEvents: "none", borderRadius: 4, boxShadow: `inset 0 0 0 2px ${strong ? "#8B7BFF" : "rgba(139,123,255,.85)"}`,
        transition: "top .12s ease, height .12s ease",
      }}
    >
      <span
        style={{
          position: "absolute", top: Math.max(10, -box.top + 10), left: 10, font: "500 12px/1 system-ui, sans-serif",
          background: "#6E5BEF", color: "#fff", padding: "7px 10px", borderRadius: 999, whiteSpace: "nowrap",
        }}
      >
        {label} · Edit
      </span>
    </div>
  );
}
