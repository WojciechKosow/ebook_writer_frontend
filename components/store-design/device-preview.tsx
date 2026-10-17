"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PreviewMessage } from "@/lib/store-design/core";

export type Device = "desktop" | "phone";

const DESKTOP_W = 1280;
const PHONE_W = 390;
const BAR = 34;

/**
 * The live preview: the real store page in a frame at true phone or desktop
 * width (so its breakpoints apply), under a small browser bar. Desktop is
 * scaled down to fit. The design is posted into the frame on every change and
 * clicks on sections come back through `onPick`.
 */
export function DevicePreview({ message, device, url, onPick }: {
  message: Omit<PreviewMessage, "type">;
  device: Device;
  url: string;
  onPick?: (section: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [space, setSpace] = useState({ w: 0, h: 0 });
  const latest = useRef(message);
  const pickRef = useRef(onPick);

  useLayoutEffect(() => {
    pickRef.current = onPick;
  });

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
      } else if (e.data?.type === "sd-preview-pick" && typeof e.data.section === "string") {
        pickRef.current?.(e.data.section);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    latest.current = message;
    if (!ready) return;
    const id = setTimeout(() => post(frame.current, message), 60);
    return () => clearTimeout(id);
  }, [message, ready]);

  const phone = device === "phone";
  const outerW = phone ? Math.min(PHONE_W, space.w || PHONE_W) : space.w;
  const vw = phone ? PHONE_W : DESKTOP_W;
  const scale = outerW ? Math.min(1, outerW / vw) : 0.5;
  const innerH = Math.max(200, space.h - BAR);

  return (
    <div ref={box} className="flex h-full w-full min-w-0 justify-center overflow-clip">
      <div
        className="flex h-full min-w-0 flex-col overflow-clip border border-hairline-2 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        style={{ width: outerW || "100%", borderRadius: phone ? 28 : 12 }}
      >
        <div className="flex shrink-0 items-center gap-1.5 border-b border-hairline bg-surface-2 px-3" style={{ height: BAR }}>
          <span className="h-[9px] w-[9px] rounded-full bg-hairline-2" />
          <span className="h-[9px] w-[9px] rounded-full bg-hairline-2" />
          <span className="h-[9px] w-[9px] rounded-full bg-hairline-2" />
          <span className="flex flex-1 justify-center">
            <span className="max-w-full truncate rounded-md bg-background px-3 py-1 font-mono text-[11.5px] text-muted">{url}</span>
          </span>
          <span className="w-[39px]" />
        </div>
        <div className="relative min-h-0 flex-1 overflow-clip bg-background">
          <iframe
            ref={frame}
            src="/store-preview"
            title={`Store preview — ${device}`}
            style={{ width: vw, height: innerH / scale, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0, display: "block" }}
          />
          {!ready && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Loading preview…</div>}
        </div>
      </div>
    </div>
  );
}

function post(frame: HTMLIFrameElement | null, message: Omit<PreviewMessage, "type">) {
  frame?.contentWindow?.postMessage({ type: "sd-preview", ...message } satisfies PreviewMessage, window.location.origin);
}
