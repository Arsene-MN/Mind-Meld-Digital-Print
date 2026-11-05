"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { challenges, siteShots } from "@/content/site";
import type { Challenge } from "@/content/types";
import { useSpace } from "@/components/providers/SpaceProvider";
import { useLenis, useScrollLock } from "@/components/providers/SmoothScroll";
import { Magnetic } from "@/components/ui/Magnetic";
import { Marquee } from "@/components/ui/Marquee";
import { ThisIsIt } from "@/components/ui/ThisIsIt";
import { PinboardScene, type PinboardHandle } from "./PinboardScene";
import { CinemaViewer } from "./CinemaViewer";

export default function SpaceOverlay() {
  const { state } = useSpace();
  const challenge = state ? challenges.find((c) => c.slug === state.slug) : undefined;
  useScrollLock(!!challenge);

  return (
    <AnimatePresence>
      {challenge && (
        <motion.div
          key="space"
          className="fixed inset-0 z-[90] bg-night text-cream"
          data-lenis-prevent
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <SpaceView challenge={challenge} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SpaceView({ challenge }: { challenge: Challenge }) {
  const { state, close, go, setItem } = useSpace();
  const lenis = useLenis();
  const board = useRef<PinboardHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<DOMRect | null>(null);
  const [busy, setBusy] = useState(false);
  const item = state?.item ?? null;
  const i = challenges.indexOf(challenge);
  const prev = challenges[(i - 1 + challenges.length) % challenges.length];
  const next = challenges[(i + 1) % challenges.length];
  const youtube = challenge.links.find((l) => /youtu/.test(l.href)) ?? challenge.links[0];

  const switchTo = useCallback(
    async (target: Challenge) => {
      if (busy) return;
      setBusy(true);
      await Promise.all([
        board.current?.leave(),
        gsap.to(root.current!.querySelectorAll("[data-head]"), { yPercent: -110, autoAlpha: 0, duration: 0.5, stagger: 0.03, ease: "power3.in" }),
      ]);
      go(target.slug);
      setBusy(false);
    },
    [busy, go],
  );

  // Title and header come in per chapter.
  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set("[data-head]", { yPercent: 0, autoAlpha: 1 });
      if (reduce) return;
      const split = SplitText.create("[data-space-title]", { type: "chars", mask: "chars" });
      gsap.from(split.chars, { yPercent: 110, duration: 1.2, stagger: 0.03, ease: "expo.out", delay: 0.3 });
      gsap.from("[data-head-sub]", { y: 20, autoAlpha: 0, duration: 1, stagger: 0.06, delay: 0.5 });
      return () => split.revert();
    },
    { scope: root, dependencies: [challenge.slug], revertOnUpdate: true },
  );

  useEffect(() => {
    if (item !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") void switchTo(next);
      if (e.key === "ArrowLeft") void switchTo(prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, close, switchTo, next, prev]);

  return (
    <div ref={root} className="absolute inset-0">
      <PinboardScene
        key={challenge.slug}
        ref={board}
        challenge={challenge}
        onOpen={(index, rect) => {
          setOrigin(rect);
          setItem(index);
        }}
        feature={challenge.slug === "digital-print" ? <ThisIsIt shots={siteShots} className="relative h-full w-full" /> : undefined}
        onFeature={() => {
          // You're already here: close the space and ride back up to where it all starts.
          close();
          window.setTimeout(() => lenis?.scrollTo(0, { duration: 2.6, force: true }), 700);
        }}
      />

      {/* Header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-night via-night/70 to-transparent pb-24">
        <div className="gutter flex items-start justify-between gap-6 pt-6">
          <div className="max-w-2xl">
            <p data-head className="label text-cream/70">
              <span className="label-n">0{challenge.n} / 0{challenges.length}</span>Challenge {challenge.n}, the space
            </p>
            <h2 data-head data-space-title key={challenge.slug} className="display mt-3 text-[13vw] leading-[0.9] md:text-[6vw]">
              {challenge.title}
            </h2>
            <p data-head data-head-sub className="mt-3 hidden max-w-lg text-pretty text-sm leading-relaxed text-cream/70 md:block">
              {challenge.definition}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            data-head
            className="pointer-events-auto kicker flex shrink-0 items-center gap-2 rounded-full border border-cream/25 px-4 py-2 backdrop-blur hover:border-cream"
          >
            Close <span className="hidden text-cream/50 sm:inline">Esc</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-night via-night/70 to-transparent pt-24">
        <div className="gutter flex items-end justify-between gap-6 pb-6">
          <div className="pointer-events-auto flex gap-6">
            <button type="button" onClick={() => switchTo(prev)} className="group text-left" aria-label={`Previous challenge: ${prev.title}`}>
              <span className="kicker block text-cream/50">← Prev</span>
              <span className="hidden font-serif text-xl italic transition-colors group-hover:text-accent-soft sm:block">{prev.title}</span>
            </button>
            <button type="button" onClick={() => switchTo(next)} className="group text-left" aria-label={`Next challenge: ${next.title}`}>
              <span className="kicker block text-cream/50">Next →</span>
              <span className="hidden font-serif text-xl italic transition-colors group-hover:text-accent-soft sm:block">{next.title}</span>
            </button>
          </div>

          <p className="kicker hidden text-cream/40 lg:block">Drag to explore · Click to open</p>

          {youtube && (
            <Magnetic>
              <a
                href={youtube.href}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto flex w-56 items-center overflow-hidden rounded-full bg-cream py-3 text-ink transition-colors hover:bg-accent hover:text-cream"
                aria-label={`${youtube.label} (opens in a new tab)`}
              >
                <Marquee items={[`${youtube.label} ↗`, `Chapter 0${challenge.n}`]} className="kicker" speed={9} />
              </a>
            </Magnetic>
          )}
        </div>
      </div>

      {item !== null && (
        <CinemaViewer
          challenge={challenge}
          index={item}
          origin={origin}
          onIndex={(n) => {
            setOrigin(null);
            setItem(n);
          }}
          onClose={() => setItem(null)}
        />
      )}
    </div>
  );
}
