"use client";

import { useEffect } from "react";

/** Size of the sampling canvas. Render it with these width/height attributes. */
export const GLOW_W = 32;
export const GLOW_H = 18;
const W = GLOW_W;
const H = GLOW_H;

/**
 * Paints a tiny, constantly-updating copy of a video (or image) onto a canvas.
 * Scaled up and heavily blurred behind the player, it makes the whole room
 * glow with whatever is on screen. Each frame is blended over the last, so
 * colour changes drift rather than flicker.
 */
export function useAmbientGlow(
  canvas: React.RefObject<HTMLCanvasElement | null>,
  source: React.RefObject<HTMLVideoElement | HTMLImageElement | null>,
  key: unknown,
) {
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d", { willReadFrequently: false });
    if (!c || !ctx) return;
    let raf = 0;
    let settle = 60;
    let last = 0;

    const ready = (el: HTMLVideoElement | HTMLImageElement) =>
      el instanceof HTMLVideoElement ? el.readyState >= 2 : el.complete && el.naturalWidth > 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || t - last < 33) return;
      last = t;
      const el = source.current;
      if (!el || !ready(el)) return;
      const playing = el instanceof HTMLVideoElement && !el.paused && !el.ended;
      if (!playing && settle-- <= 0) return;
      if (playing) settle = 60;
      ctx.globalAlpha = 0.14;
      try {
        ctx.drawImage(el, 0, 0, W, H);
      } catch {
        // Cross-origin media can't be sampled; the glow simply stays as it was.
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [canvas, source, key]);
}
