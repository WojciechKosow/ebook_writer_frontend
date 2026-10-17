"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PreviewMessage } from "@/lib/store-design/core";

export type Device = "desktop" | "phone";

const SIZES: Record<Device, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 },
  phone: { w: 390, h: 844 },
};

/**
 * The live preview: the real store page rendered in a frame at true phone or
 * desktop width (so its breakpoints apply), scaled down to fit. The design is
 * posted into the frame on every change.
 */
export function DevicePreview({ message, device }: { message: Omit<PreviewMessage, "type">; device: Device }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [space, setSpace] = useState({ w: 0, h: 0 });
  const latest = useRef(message);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSpace({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "sd-preview-ready") {
        setReady(true);
        post(frame.current, { ...latest.current, focus: null });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    latest.current = message;
    if (!ready) return;
    const id = setTimeout(() => post(frame.current, message), 80);
    return () => clearTimeout(id);
  }, [message, ready]);

  const size = SIZES[device];
  // Desktop fills the width; the phone fits the height (with its bezel).
  const bezel = device === "phone" ? 14 : 0;
  const scale = space.w
    ? device === "desktop"
      ? Math.min(1, space.w / size.w)
      : Math.min(1, (space.h - 2 * bezel - 8) / size.h, (space.w - 2 * bezel) / size.w)
    : 0.4;
  const frameH = device === "desktop" ? Math.max(size.h, space.h / scale) : size.h;

  return (
    <div ref={box} className="relative h-full w-full overflow-hidden">
      <div
        className={device === "phone" ? "absolute left-1/2 top-1 -translate-x-1/2 rounded-[46px] bg-[#111] shadow-float" : "absolute left-0 top-0"}
        style={{ padding: bezel, width: size.w * scale + 2 * bezel, height: frameH * scale + 2 * bezel }}
      >
        <div
          className={device === "phone" ? "overflow-hidden rounded-[34px]" : "overflow-hidden rounded-xl border border-hairline"}
          style={{ width: size.w * scale, height: frameH * scale }}
        >
          <iframe
            ref={frame}
            src="/store-preview"
            title={`Store preview — ${device}`}
            style={{ width: size.w, height: frameH, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block" }}
          />
        </div>
      </div>
      {!ready && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Loading preview…</div>}
    </div>
  );
}

function post(frame: HTMLIFrameElement | null, message: Omit<PreviewMessage, "type">) {
  frame?.contentWindow?.postMessage({ type: "sd-preview", ...message } satisfies PreviewMessage, window.location.origin);
}
