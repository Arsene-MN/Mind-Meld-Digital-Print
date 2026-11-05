"use client";

import { useRef } from "react";
import { gsap, MOTION, SplitText, useGSAP } from "@/lib/gsap";
import { Imigongo } from "@/components/ui/Imigongo";

const values = [
  { k: "Accessible", v: "Care that reaches families where they already are: their phones, their savings groups." },
  { k: "Low-cost", v: "Small, regular steps instead of one impossible payment." },
  { k: "Resilient", v: "Communities that can absorb a shock without falling into debt." },
];

export function Mission() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.motion, () => {
        const split = SplitText.create("[data-statement]", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: "[data-statement]", start: "top 75%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.to("[data-band]", {
          xPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.from("[data-value]", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-values]", start: "top 85%", once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="mission" ref={root} data-theme="light" className="relative pt-[18vh] pb-[14vh]" aria-labelledby="mission-title">
      <div className="gutter">
        <div className="grid gap-8 md:grid-cols-12">
          <p id="mission-title" className="label md:col-span-3">
            <span className="label-n">01</span>Our mission
          </p>
          <blockquote data-statement className="display text-[9.5vw] leading-[0.98] md:col-span-9 md:text-[5.4vw]">
            Mobilize <em className="text-accent">accessible, low-cost</em> healthcare solutions for underprivileged Rwandan communities to
            build <em>resilient, healthy</em> and <em>thriving</em> societies.
          </blockquote>
        </div>
      </div>

      <div className="my-[12vh] overflow-hidden text-ink" aria-hidden>
        <div data-band className="w-[140%]">
          <Imigongo className="h-20 w-full" />
        </div>
      </div>

      <div data-values className="gutter grid gap-10 md:grid-cols-12">
        <p className="label text-mute md:col-span-3">What we stand for</p>
        {values.map((item, i) => (
          <div key={item.k} data-value className="md:col-span-3">
            <div className="hairline mb-5" />
            <p className="kicker text-mute">0{i + 1}</p>
            <h3 className="display mt-3 text-5xl">{item.k}</h3>
            <p className="mt-3 max-w-xs text-pretty text-mute">{item.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
