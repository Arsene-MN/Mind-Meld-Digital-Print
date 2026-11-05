"use client";

import { useRef } from "react";
import { gsap, MOTION, SplitText, useGSAP } from "@/lib/gsap";
import { site, team } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";
import { LoopVideo } from "@/components/ui/LoopVideo";

/** The small video window before it opens, as % insets from each edge. */
type Win = { top: number; right: number; bottom: number; left: number };
const DESKTOP: Win = { top: 46, right: 5, bottom: 9, left: 58 };
const MOBILE: Win = { top: 58, right: 5, bottom: 12, left: 5 };
const clip = (w: Win) => `inset(${w.top}% ${w.right}% ${w.bottom}% ${w.left}% round 4px)`;

/**
 * Shrinks the full-bleed video and centres it on the window, so the small
 * window shows the whole frame instead of a corner of it. Scrolling then
 * grows it back to full size while the window opens, in the same motion.
 */
function framing(w: Win) {
  const width = 100 - w.left - w.right;
  const height = 100 - w.top - w.bottom;
  return {
    scale: Math.max(width, height) / 100,
    xPercent: w.left + width / 2 - 50,
    yPercent: w.top + height / 2 - 50,
  };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { entered } = useExperience();

  // Scroll: the small window opens into a full-bleed screen.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ ...MOTION }, (ctx) => {
        const { motion, desktop } = ctx.conditions!;
        const win = desktop ? DESKTOP : MOBILE;
        gsap.set("[data-window]", { clipPath: clip(win) });
        gsap.set("[data-window] video", framing(win));
        if (!motion) return;
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=130%", scrub: 0.6, pin: true } })
          .to("[data-window]", { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
          .to("[data-window] video", { scale: 1, xPercent: 0, yPercent: 0, ease: "none" }, 0)
          .to("[data-title]", { yPercent: -18, autoAlpha: 0, ease: "none" }, 0)
          .to("[data-hud]", { autoAlpha: 0, ease: "none", duration: 0.3 }, 0)
          .fromTo("[data-overlay]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, 0.6);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Intro: plays once the preloader lifts.
  useGSAP(
    () => {
      if (!entered) return;
      const mm = gsap.matchMedia();
      mm.add({ ...MOTION }, (ctx) => {
        const { motion, desktop } = ctx.conditions!;
        if (!motion) return;
        const split = SplitText.create("[data-title] > span", { type: "chars", mask: "chars" });
        gsap
          .timeline()
          .from(split.chars, { yPercent: 120, duration: 1.6, stagger: 0.045, ease: "curtain" })
          .from(
            "[data-window]",
            { clipPath: desktop ? "inset(100% 5% 0% 58% round 4px)" : "inset(100% 5% 0% 5% round 4px)", duration: 1.6, ease: "curtain" },
            0.2,
          )
          .from("[data-window] video", { scale: framing(desktop ? DESKTOP : MOBILE).scale * 1.4, duration: 2.2 }, 0.2)
          .from("[data-hud]", { autoAlpha: 0, y: 12, stagger: 0.06, duration: 1 }, 0.6);
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [entered] },
  );

  return (
    <section id="top" ref={root} data-theme="light" className="relative h-[100svh] overflow-hidden" aria-label="Introduction">
      <div className="gutter relative z-10 flex h-full flex-col pt-24 pb-8">
        <h1 data-title className="display mt-[8vh] text-[25vw] md:mt-[6vh] md:text-[19vw]" aria-label={site.name}>
          <span className="block" aria-hidden>
            Mind
          </span>
          <span className="block pl-[12vw] italic text-accent md:pl-[22vw]" aria-hidden>
            Meld
          </span>
        </h1>

        <div className="mt-auto max-w-[min(30rem,52vw)] max-md:max-w-none max-md:pb-[38vh]">
          <p data-hud className="text-balance text-lg leading-snug md:text-xl">
            {site.tagline}
          </p>
          <p data-hud className="mt-4 kicker text-mute">
            Scroll to begin <span aria-hidden>↓</span>
          </p>
        </div>
      </div>

      <div data-window className="absolute inset-0 z-20 bg-night" style={{ clipPath: clip(DESKTOP) }}>
        <LoopVideo media={site.heroClip} priority className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-night/20" />
        <div data-overlay className="gutter invisible absolute inset-x-0 bottom-10 text-cream">
          <p className="label text-cream/80">{site.heroClip.caption}</p>
          <p className="display mt-3 max-w-4xl text-[11vw] md:text-[6.5vw]">
            {team.length} people. One <em className="text-accent-soft">mission.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
