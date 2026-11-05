"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/gsap";
import { solution } from "@/content/site";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Caption } from "@/components/ui/Caption";

export function Solution() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, (ctx) => {
        const { motion, desktop } = ctx.conditions!;
        if (!motion) return;
        const panels = gsap.utils.toArray<HTMLElement>("[data-pillar]");

        if (!desktop) {
          panels.forEach((p) =>
            gsap.from(p, { y: 60, autoAlpha: 0, scrollTrigger: { trigger: p, start: "top 85%", once: true } }),
          );
          return;
        }

        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const scroll = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              gsap.set("[data-bar]", { scaleX: self.progress });
              const i = Math.min(panels.length, Math.floor(self.progress * panels.length) + 1);
              const counter = root.current!.querySelector("[data-counter]");
              if (counter) counter.textContent = `0${i}`;
            },
          },
        });

        panels.forEach((panel) => {
          const img = panel.querySelector("img");
          gsap.fromTo(
            img,
            { xPercent: -8, scale: 1.18 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: panel, containerAnimation: scroll, start: "left right", end: "right left", scrub: true },
            },
          );
          gsap.from(panel.querySelectorAll("[data-pillar-text]"), {
            y: 40,
            autoAlpha: 0,
            stagger: 0.08,
            scrollTrigger: { trigger: panel, containerAnimation: scroll, start: "left 70%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="solution" ref={root} data-theme="light" className="pt-[18vh]" aria-labelledby="solution-title">
      <div className="gutter grid gap-8 md:grid-cols-12">
        <p className="label md:col-span-3">
          <span className="label-n">03</span>Our solution
        </p>
        <div className="md:col-span-9">
          <SplitReveal as="h2" className="display text-[15vw] italic md:text-[10vw]">
            <span id="solution-title">{solution.name}</span>
          </SplitReveal>
          <p className="mt-4 kicker text-mute">({solution.translation})</p>
          <p className="mt-10 max-w-2xl text-pretty text-xl leading-relaxed md:text-2xl">{solution.intro}</p>
        </div>
      </div>

      <div data-pin className="relative mt-[10vh] md:h-[100svh] md:overflow-hidden">
        <div data-track className="gutter flex flex-col gap-20 md:h-full md:w-max md:flex-row md:items-center md:gap-[6vw]">
          {solution.pillars.map((p, i) => (
            <article key={p.title} data-pillar className="md:w-[64vw] md:max-w-[1100px]">
              <div className="grid gap-6 md:grid-cols-12 md:items-end">
                <figure className="relative aspect-[7/5] overflow-hidden bg-paper-2 md:col-span-8">
                  <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 900px) 45vw, 100vw" className="object-cover" />
                </figure>
                <div className="md:col-span-4">
                  <p data-pillar-text className="display text-8xl text-accent md:text-[9vw]">
                    0{i + 1}
                  </p>
                  <h3 data-pillar-text className="display mt-2 text-5xl">
                    {p.title}
                  </h3>
                  <p data-pillar-text className="mt-4 text-pretty leading-relaxed text-mute">
                    {p.body}
                  </p>
                </div>
              </div>
              <Caption className="mt-4" title={p.image.caption ?? p.image.alt} />
            </article>
          ))}
          <div className="hidden w-[10vw] shrink-0 md:block" />
        </div>

        <div className="gutter absolute inset-x-0 bottom-8 hidden items-center gap-6 md:flex" aria-hidden>
          <span className="kicker">
            <span data-counter>01</span> / 0{solution.pillars.length}
          </span>
          <div className="h-px flex-1 bg-current/15">
            <div data-bar className="h-px origin-left scale-x-0 bg-accent" />
          </div>
          <span className="kicker text-mute">Scroll</span>
        </div>
      </div>
    </section>
  );
}
