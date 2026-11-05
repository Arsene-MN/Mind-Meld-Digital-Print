"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/gsap";
import { site } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";

/** Counts up while fonts and the hero clip load, then waits for a click (or tap, or key press) anywhere. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const { enter } = useExperience();
  const leaving = useRef(false);

  useGSAP(
    () => {
      const counter = { v: 0 };
      const out = root.current!.querySelector<HTMLElement>("[data-count]")!;
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const mm = gsap.matchMedia();

      mm.add({ ...MOTION, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        if (ctx.conditions?.reduce) {
          out.textContent = "100";
          fonts.then(() => setReady(true));
          return;
        }
        const tl = gsap.timeline();
        tl.from("[data-word] > span", { yPercent: 110, duration: 1.4, stagger: 0.08, ease: "curtain" }, 0.1)
          .to(counter, {
            v: 100,
            duration: 2.2,
            ease: "power2.inOut",
            onUpdate: () => (out.textContent = String(Math.round(counter.v)).padStart(3, "0")),
          }, 0)
          .from("[data-bar]", { scaleX: 0, transformOrigin: "left", duration: 2.2, ease: "power2.inOut" }, 0);
        Promise.all([fonts, tl.then()]).then(() => setReady(true));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!ready) return;
      gsap.from("[data-choice]", { y: 24, autoAlpha: 0, duration: 0.9 });
    },
    { scope: root, dependencies: [ready] },
  );

  const go = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      enter();
      setGone(true);
      return;
    }
    gsap
      .timeline({ onComplete: () => setGone(true) })
      .to(root.current!.querySelectorAll("[data-fade]"), { autoAlpha: 0, y: -20, duration: 0.5, stagger: 0.03 })
      .to(root.current!.querySelectorAll("[data-panel]"), { yPercent: -100, duration: 1.2, stagger: 0.07, ease: "curtain" }, 0.25)
      .add(enter, 0.75);
  }, [enter]);

  // Any key works too, once loading is done.
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Tab") return;
      e.preventDefault();
      go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, go]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex-col justify-between text-cream"
      role="dialog"
      aria-modal="true"
      aria-label={`${site.name}: click anywhere to enter`}
      onClick={ready ? go : undefined}
      data-cursor={ready ? "Enter" : undefined}
      style={{ cursor: ready ? "pointer" : "progress" }}
    >
      <div className="absolute inset-0 flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} data-panel className="h-full flex-1 bg-night" style={{ marginLeft: -1 }} />
        ))}
      </div>

      <div data-fade className="gutter relative flex justify-between pt-6 kicker text-cream/60">
        <span>{site.programme} · Digital Print</span>
        <span>
          Loading <span data-count>000</span>
        </span>
      </div>

      <div className="gutter relative">
        <h1 data-fade className="display text-[22vw] leading-[0.8] md:text-[16vw]" aria-label={site.name}>
          {site.name.split(" ").map((w, i) => (
            <span key={w} data-word className="split-line block" aria-hidden>
              <span className={`block ${i === 1 ? "italic text-accent-soft pl-[8vw]" : ""}`}>{w}</span>
            </span>
          ))}
        </h1>
      </div>

      <div className="gutter relative pb-8">
        <div data-fade className="mb-6 h-px w-full bg-cream/15">
          <div data-bar className="h-px w-full bg-accent" />
        </div>
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-4">
          <p data-fade className="max-w-sm text-sm text-cream/60">
            A think tank&apos;s E-Lab journey, in six challenges.
          </p>
          {ready && (
            <button
              type="button"
              data-choice
              data-fade
              onClick={(e) => {
                e.stopPropagation();
                go();
              }}
              className="group flex items-center gap-3 kicker text-cream"
              // Any click or key enters, so this prompt never needs a focus ring.
              style={{ outline: "none" }}
            >
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-soft opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-soft" />
              </span>
              <span className="[@media(pointer:coarse)]:hidden">Click anywhere to enter</span>
              <span className="hidden [@media(pointer:coarse)]:inline">Tap anywhere to enter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
