"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/gsap";
import { prototype, solution } from "@/content/site";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { UssdSimulator } from "./UssdSimulator";

export function Prototype() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.motion, () => {
        gsap.fromTo(
          "[data-phone]",
          { rotateY: -32, rotateX: 18, rotateZ: -8, y: 160, scale: 0.86 },
          {
            rotateY: 0,
            rotateX: 0,
            rotateZ: 0,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 90%", end: "center 55%", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          "[data-phone-shadow]",
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 90%", end: "center 55%", scrub: true } },
        );
        gsap.from("[data-step]", {
          x: -30,
          autoAlpha: 0,
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-steps]", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="prototype" ref={root} data-theme="light" className="relative py-[18vh]" aria-labelledby="prototype-title">
      <div className="gutter grid items-center gap-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label">
            <span className="label-n">04</span>Prototype
          </p>
          <SplitReveal as="h2" className="display mt-8 text-[13vw] md:text-[6.4vw]">
            <span id="prototype-title">{prototype.headline}</span>
          </SplitReveal>
          <p className="mt-8 max-w-lg text-pretty text-lg leading-relaxed text-mute">{prototype.body}</p>

          <ol data-steps className="mt-12 max-w-lg">
            {prototype.steps.map((s, i) => (
              <li key={s} data-step className="flex items-baseline gap-6 border-t border-current/15 py-4">
                <span className="kicker text-accent">0{i + 1}</span>
                <span className="display text-3xl">{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <p className="kicker text-mute">
              Short code <span className="text-ink">{prototype.shortCode}</span> · works on any phone
            </p>
            {prototype.figma && (
              <Magnetic>
                <a href={prototype.figma} target="_blank" rel="noreferrer" className="rounded-full border border-current px-5 py-2.5 kicker hover:bg-ink hover:text-cream">
                  Open in Figma ↗
                </a>
              </Magnetic>
            )}
          </div>
        </div>

        <div className="flex justify-center md:col-span-6 [perspective:1600px]">
          <div className="relative">
            <div data-phone-shadow className="absolute -bottom-10 left-1/2 h-16 w-[80%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-2xl" aria-hidden />
            <div
              data-phone
              className="relative aspect-[9/17.5] w-[min(84vw,330px)] rounded-[3.2rem] bg-[#1a1918] p-[11px] shadow-[0_40px_80px_-30px_rgba(17,16,14,0.6),inset_0_0_0_2px_#3a3734] [transform-style:preserve-3d]"
              aria-label={`${solution.name} USSD prototype`}
              role="group"
            >
              {/* side buttons */}
              <span className="absolute -left-[3px] top-[18%] h-8 w-[3px] rounded-l bg-[#2a2826]" aria-hidden />
              <span className="absolute -left-[3px] top-[26%] h-14 w-[3px] rounded-l bg-[#2a2826]" aria-hidden />
              <span className="absolute -right-[3px] top-[24%] h-20 w-[3px] rounded-r bg-[#2a2826]" aria-hidden />
              <div className="relative h-full overflow-hidden rounded-[2.75rem]">
                <span className="absolute left-1/2 top-2.5 z-40 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
                {prototype.image ? (
                  <Image src={prototype.image.src} alt={prototype.image.alt} fill sizes="340px" className="object-cover" />
                ) : (
                  <UssdSimulator />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
