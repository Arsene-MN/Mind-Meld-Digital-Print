"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Challenge, ImageMedia, Media } from "@/content/types";
import { LoopVideo } from "@/components/ui/LoopVideo";

export type PinboardHandle = {
  /** Fly every item past the camera, then resolve. */
  leave: () => Promise<void>;
};

type Placed = { media: Media; x: number; y: number; z: number; w: number; r: number; ry: number };

/** Small deterministic random so the layout is stable between renders. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/**
 * The first item (usually the chapter's film) sits in the middle; the rest
 * orbit it on a loose ellipse, at different depths, like a pinboard in space.
 */
function layout(items: Media[], vw: number, vh: number, seed: number) {
  const mobile = vw < 900;
  const ring = items.length - 1;
  // Big sets spread over two rings so nothing piles up.
  const twoRings = ring > 7;
  const W = vw * (mobile ? 2.4 : 1.8) * (twoRings ? 1.45 : 1);
  const H = vh * (mobile ? 2.2 : 1.75) * (twoRings ? 1.45 : 1);
  const rand = rng(seed + 7);
  const base = mobile ? vw * 0.6 : Math.min(vw * (twoRings ? 0.21 : 0.25), 460);
  const placed: Placed[] = items.map((media, i) => {
    const landscape = media.w >= media.h;
    const w = (landscape ? base : base * 0.68) * (i === 0 ? 1.35 : 1);
    if (i === 0) return { media, w, x: 0, y: 0, z: 60, r: 0, ry: 0 };
    const a = ((i - 1) / ring) * Math.PI * 2 - Math.PI / 2 + (rand() - 0.5) * 0.5;
    const reach = twoRings && i % 2 === 0 ? 1.75 : 1;
    const rx = (mobile ? vw * 0.75 : vw * 0.42) * (0.85 + rand() * 0.3) * reach;
    const ry = (mobile ? vh * 0.55 : vh * 0.4) * (0.85 + rand() * 0.3) * reach;
    return {
      media,
      w,
      x: Math.cos(a) * rx,
      y: Math.sin(a) * ry,
      z: Math.round(-380 + rand() * 360),
      r: (rand() - 0.5) * 8,
      ry: (rand() - 0.5) * 16,
    };
  });
  return { placed, W, H };
}

const subscribeSize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const getSize = () => `${window.innerWidth}x${window.innerHeight}`;

type Props = {
  challenge: Challenge;
  onOpen: (index: number, rect: DOMRect) => void;
  /** Something live to put at the centre instead of a photo (Challenge 06 shows the site itself). */
  feature?: React.ReactNode;
  onFeature?: () => void;
};

/** Stands in for the feature in the layout: a 16:10 slot at the centre. */
const FEATURE_SLOT: ImageMedia = { kind: "image", src: "", w: 16, h: 10, alt: "This is it. You are here." };

export const PinboardScene = forwardRef<PinboardHandle, Props>(function PinboardScene({ challenge, onOpen, feature, onFeature }, ref) {
  const scene = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const size = useSyncExternalStore(subscribeSize, getSize, () => "1440x900");
  const [vw, vh] = size.split("x").map(Number);
  const hasFeature = !!feature;
  const { placed, W, H } = useMemo(
    () => layout(hasFeature ? [FEATURE_SLOT, ...challenge.media] : challenge.media, vw, vh, challenge.n * 101),
    [challenge, vw, vh, hasFeature],
  );

  const { contextSafe } = useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = window.matchMedia("(pointer: fine)").matches;
      const el = world.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
      if (!reduce) {
        gsap.from("[data-item]", {
          z: -1600,
          autoAlpha: 0,
          duration: 1.6,
          ease: "expo.out",
          stagger: { each: 0.06, from: "center" },
        });
        gsap.from(el, { rotationX: 28, duration: 2, ease: "expo.out" });
      }

      const limX = Math.max(0, (W - vw) / 2 + 120);
      const limY = Math.max(0, (H - vh) / 2 + 120);
      const pan = { x: 0, y: 0 };
      const toX = gsap.quickTo(el, "x", { duration: reduce ? 0 : 1, ease: "power3" });
      const toY = gsap.quickTo(el, "y", { duration: reduce ? 0 : 1, ease: "power3" });
      const rotX = gsap.quickTo(el, "rotationX", { duration: 1.4, ease: "power3" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 1.4, ease: "power3" });
      const panTo = (x: number, y: number) => {
        pan.x = gsap.utils.clamp(-limX, limX, x);
        pan.y = gsap.utils.clamp(-limY, limY, y);
        toX(pan.x);
        toY(pan.y);
      };

      const node = scene.current!;
      let start: { x: number; y: number; px: number; py: number } | null = null;

      const down = (e: PointerEvent) => {
        if (e.button !== 0) return;
        start = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        dragged.current = false;
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      };
      const move = (e: PointerEvent) => {
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > 6) {
          dragged.current = true;
          node.dataset.dragging = "";
        }
        panTo(start.px + dx * 1.4, start.py + dy * 1.4);
      };
      const up = () => {
        start = null;
        delete node.dataset.dragging;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        panTo(pan.x - e.deltaX * 1.2, pan.y - e.deltaY * 1.2);
      };
      const tilt = (e: PointerEvent) => {
        if (reduce || !fine) return;
        rotY((e.clientX / window.innerWidth - 0.5) * 12);
        rotX(-(e.clientY / window.innerHeight - 0.5) * 9);
      };
      // Keyboard users: bring the focused item to the centre.
      const focus = (e: FocusEvent) => {
        const item = (e.target as HTMLElement).closest<HTMLElement>("[data-item]");
        if (!item) return;
        panTo(-Number(item.dataset.x), -Number(item.dataset.y));
      };

      node.addEventListener("pointerdown", down);
      node.addEventListener("wheel", wheel, { passive: false });
      window.addEventListener("pointermove", tilt);
      node.addEventListener("focusin", focus);
      return () => {
        node.removeEventListener("pointerdown", down);
        node.removeEventListener("wheel", wheel);
        window.removeEventListener("pointermove", tilt);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        node.removeEventListener("focusin", focus);
      };
    },
    { scope: scene, dependencies: [W, H, vw, vh], revertOnUpdate: true },
  );

  useImperativeHandle(ref, () => ({
    leave: contextSafe(
      () =>
        new Promise<void>((resolve) => {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduce) return resolve();
          gsap.to("[data-item]", {
            z: 1000,
            autoAlpha: 0,
            duration: 0.75,
            ease: "power3.in",
            stagger: { each: 0.03, from: "edges" },
            onComplete: resolve,
          });
        }),
    ) as () => Promise<void>,
  }));

  return (
    <div
      ref={scene}
      className="absolute inset-0 cursor-grab touch-none overflow-hidden [perspective:1400px] data-[dragging]:cursor-grabbing"
      data-cursor="Drag"
    >
      <div ref={world} className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]" style={{ width: W, height: H }}>
        {placed.map((p, i) => {
          const m = p.media;
          const isFeature = hasFeature && i === 0;
          const caption = m.caption ?? m.alt;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
              style={{
                width: p.w,
                transform: `translate(-50%, -50%) translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateZ(${p.r}deg) rotateY(${p.ry}deg)`,
              }}
            >
              <button
                type="button"
                data-item
                data-x={p.x}
                data-y={p.y}
                data-cursor={isFeature ? "Top" : m.kind === "video" ? "Play" : "Open"}
                onClick={(e) => {
                  if (dragged.current) return;
                  if (isFeature) return onFeature?.();
                  const media = e.currentTarget.querySelector("[data-frame]")!;
                  onOpen(hasFeature ? i - 1 : i, media.getBoundingClientRect());
                }}
                aria-label={isFeature ? "This is it: back to the top of the site" : `${m.kind === "video" ? "Play" : "Open"}: ${caption}`}
                className="group block w-full text-left"
              >
                <span
                  className="absolute -top-1.5 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                  aria-hidden
                />
                <span
                  data-frame
                  className="relative block overflow-hidden bg-cream/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-cream/10 transition-transform duration-700 ease-gallery group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                  style={{ aspectRatio: `${m.w}/${m.h}` }}
                >
                  {isFeature ? (
                    feature
                  ) : m.kind === "video" ? (
                    <>
                      <LoopVideo media={m} className="pointer-events-none h-full w-full object-cover" />
                      <span
                        className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-xs text-ink"
                        aria-hidden
                      >
                        ▶
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- free-floating 3D items; next/image wrappers fight the transforms
                    <img src={m.src} alt="" draggable={false} loading="lazy" className="pointer-events-none h-full w-full object-cover" />
                  )}
                </span>
                <span className="mt-2.5 flex items-baseline gap-2 kicker text-cream/70">
                  <span className="truncate font-sans normal-case tracking-normal">{caption}</span>
                  {m.kind === "video" && m.duration && <span className="ml-auto text-cream/40">{m.duration}</span>}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
