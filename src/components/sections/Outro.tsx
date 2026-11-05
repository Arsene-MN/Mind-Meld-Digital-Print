"use client";

import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/gsap";
import { challenges, groupStatement, site, team } from "@/content/site";
import { useSpace } from "@/components/providers/SpaceProvider";
import { useLenis } from "@/components/providers/SmoothScroll";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Magnetic } from "@/components/ui/Magnetic";

export function Outro() {
  const root = useRef<HTMLElement>(null);
  const { open } = useSpace();
  const lenis = useLenis();
  const pitch = challenges.find((c) => c.slug === "launch-your-mission");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.motion, () => {
        gsap.from("[data-big]", {
          yPercent: 30,
          ease: "none",
          scrollTrigger: { trigger: "[data-big]", start: "top bottom", end: "bottom bottom", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="outro" ref={root} data-theme="dark" className="relative overflow-hidden pt-[20vh]" aria-labelledby="outro-title">
      <div className="gutter grid gap-8 md:grid-cols-12">
        <p id="outro-title" className="label md:col-span-3">
          <span className="label-n">07</span>What we hope to gain
        </p>
        <SplitReveal as="blockquote" stagger={0.02} className="display text-[8.5vw] leading-[1.02] md:col-span-9 md:text-[4.2vw]">
          {groupStatement}
        </SplitReveal>
      </div>

      <div className="gutter mt-16 flex flex-wrap items-center gap-6 md:pl-[calc(25%+var(--gutter))]">
        {pitch && (
          <Magnetic>
            <button
              type="button"
              onClick={() => open(pitch.slug, 0)}
              data-cursor="Play"
              className="flex items-center gap-3 rounded-full bg-cream px-7 py-4 kicker text-ink transition-colors hover:bg-accent hover:text-cream"
            >
              <span aria-hidden>▶</span> Watch our pitch
            </button>
          </Magnetic>
        )}
        <a href="#journey" onClick={(e) => { e.preventDefault(); lenis?.scrollTo("#journey", { duration: 2 }); }} className="kicker underline decoration-cream/30 underline-offset-4 hover:decoration-cream">
          Revisit the journey
        </a>
      </div>

      <footer className="gutter mt-[16vh] border-t border-cream/10 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label label-sm text-cream/60">The think tank</p>
            <ul className="mt-4 space-y-1">
              {team.map((m) => (
                <li key={m.slug} className="flex justify-between gap-4 border-t border-cream/10 py-2">
                  <span>{m.name}</span>
                  <span className="kicker text-cream/50">
                    {m.role} · {m.country}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <p className="label label-sm text-cream/60">Chapters</p>
            <ul className="mt-4 space-y-1">
              {challenges.map((c) => (
                <li key={c.slug}>
                  <button type="button" onClick={() => open(c.slug)} className="text-left hover:text-accent-soft">
                    <span className="kicker mr-3 text-cream/40">0{c.n}</span>
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3 md:col-start-10">
            <p className="label label-sm text-cream/60">Made for</p>
            <p className="mt-4">
              {site.programme} {site.year}, Challenge 06: Digital Print.
            </p>
            <button type="button" onClick={() => lenis?.scrollTo(0, { duration: 2.4 })} className="mt-6 kicker underline underline-offset-4">
              Back to top ↑
            </button>
          </div>
        </div>
        <p data-big className="display mt-20 select-none text-center text-[23vw] leading-[0.75] text-cream/[0.06]" aria-hidden>
          Mind Meld
        </p>
      </footer>
    </section>
  );
}
