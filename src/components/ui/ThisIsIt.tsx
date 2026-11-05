"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const LEVELS = 6;
/** Each window is this fraction of the one around it. */
const RATIO = 0.62;

/**
 * Give it a size and a position through `className` (e.g. "absolute inset-0").
 *
 * Challenge 06 is the website itself, so it shows itself: an endless zoom
 * through browser windows of this site, each holding the next. Every step
 * the outermost window grows past the frame and a new one appears at the
 * centre, cycling through the screenshots, so the loop never visibly repeats.
 */
export function ThisIsIt({ shots, className = "relative", title = true }: { shots: string[]; className?: string; title?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || shots.length === 0) return;
      const levels = root.current!.querySelectorAll<HTMLImageElement>("[data-level-img]");
      let offset = 0;
      const tween = gsap.fromTo(
        "[data-zoom]",
        { scale: 1 },
        {
          scale: 1 / RATIO,
          duration: 3.2,
          ease: "none",
          repeat: -1,
          // Swap images in the same frame the zoom resets, so the seam can't be seen.
          onRepeat: () => {
            offset++;
            levels.forEach((img, k) => (img.src = shots[(k + offset) % shots.length]));
          },
        },
      );
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tween.play() : tween.pause()));
      io.observe(root.current!);
      return () => io.disconnect();
    },
    { scope: root, dependencies: [shots.length] },
  );

  const shot = (k: number) => shots[k % shots.length];

  return (
    <div ref={root} className={`overflow-hidden bg-night [container-type:inline-size] ${className}`} aria-label="This website, shown inside itself" role="img">
      <div data-zoom className="absolute inset-0 will-change-transform">
        {Array.from({ length: LEVELS }, (_, k) => (
          <div key={k} className="absolute inset-0" style={{ transform: `scale(${(RATIO ** k).toFixed(4)})` }}>
            <div className="absolute inset-[3%] overflow-hidden rounded-[1.4%] bg-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-cream/15">
              <div className="flex h-[6%] items-center gap-[0.8%] bg-[#1d1c1a] px-[1.6%]">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="aspect-square h-[34%] rounded-full" style={{ background: c }} />
                ))}
                <span className="mx-auto h-[46%] w-[34%] rounded-full bg-cream/10" />
              </div>
              {shot(k) && (
                // eslint-disable-next-line @next/next/no-img-element -- swapped every loop; next/image would refetch and flash
                <img data-level-img src={shot(k)} alt="" className="h-[94%] w-full object-cover object-top" draggable={false} />
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Every image is kept decoded so swaps are instant. */}
      <div className="hidden" aria-hidden>
        {shots.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element -- preload only
          <img key={s} src={s} alt="" />
        ))}
      </div>
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-accent)_30%,transparent)]" aria-hidden />
      {title && (
        <div className="pointer-events-none absolute inset-x-[6%] bottom-[7%] flex items-end justify-between text-cream mix-blend-difference">
          <p className="display text-[clamp(2.4rem,7cqw,7rem)] leading-none">
            This is <em>it.</em>
          </p>
          <p className="kicker hidden text-right sm:block">
            You are here
            <br />
            <span className="opacity-60">Challenge 06</span>
          </p>
        </div>
      )}
    </div>
  );
}
