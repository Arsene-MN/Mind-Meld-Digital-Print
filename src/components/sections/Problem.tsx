"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/lib/gsap";
import { problem } from "@/content/site";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Caption } from "@/components/ui/Caption";
import type { ImageMedia } from "@/content/types";

/**
 * Fills a plate with a photo. Small photos would go soft stretched that far,
 * so they hang as a framed print (never enlarged much) on a blur of themselves.
 */
function PlateImage({ image, sizes }: { image: ImageMedia; sizes: string }) {
  if (image.w >= 700) return <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />;
  return (
    <>
      <Image src={image.src} alt="" fill sizes="200px" className="scale-125 object-cover [filter:blur(28px)_saturate(1.2)_brightness(0.8)]" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-[12%]">
        <div
          className="relative max-h-full max-w-full bg-cream p-[3%] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
          style={{ aspectRatio: `${image.w}/${image.h}`, height: `min(100%, ${Math.round(image.h * 1.5)}px)` }}
        >
          <div className="relative h-full w-full">
            <Image src={image.src} alt={image.alt} fill sizes={`${image.w}px`} quality={90} className="object-cover" />
          </div>
        </div>
      </div>
    </>
  );
}

const format = (v: number, decimals: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function Problem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, (ctx) => {
        const { motion, desktop } = ctx.conditions!;
        if (!motion) return;

        const plates = gsap.utils.toArray<HTMLElement>("[data-plate]");
        const gaps = gsap.utils.toArray<HTMLElement>("[data-gap]");

        if (desktop) {
          gsap.set(plates.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
          gaps.forEach((gap, i) => {
            if (i === 0) return;
            gsap
              .timeline({ scrollTrigger: { trigger: gap, start: "top 85%", end: "top 35%", scrub: 0.5 } })
              .to(plates[i], { clipPath: "inset(0% 0% 0% 0%)", ease: "none" })
              .fromTo(plates[i].querySelector("img"), { scale: 1.3 }, { scale: 1, ease: "none" }, 0);
          });
        }

        gaps.forEach((gap) => {
          gsap.from(gap.querySelectorAll("[data-gap-item]"), {
            y: 50,
            autoAlpha: 0,
            stagger: 0.1,
            scrollTrigger: { trigger: gap, start: "top 75%", once: true },
          });
        });

        // Each figure counts up from zero the first time it scrolls into view.
        gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((stat, i) => {
          const s = problem.stats[i];
          const out = stat.querySelector("[data-stat-value]")!;
          const n = { v: 0 };
          const show = () => (out.textContent = format(n.v, s.decimals));
          show();
          gsap.to(n, { v: s.value, duration: 1.8, ease: "power3.out", onUpdate: show, scrollTrigger: { trigger: stat, start: "top 85%", once: true } });
          gsap.from(stat, { y: 40, autoAlpha: 0, duration: 1.1, delay: i * 0.08, scrollTrigger: { trigger: stat, start: "top 85%", once: true } });
        });

        gsap.utils.toArray<HTMLElement>("[data-kinetic]").forEach((line, i) => {
          gsap.fromTo(
            line,
            { xPercent: i % 2 ? -20 : 12 },
            {
              xPercent: i % 2 ? 6 : -14,
              ease: "none",
              scrollTrigger: { trigger: "[data-responses]", start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="problem" ref={root} aria-labelledby="problem-title">
      <div data-theme="light" className="gutter pt-[10vh]">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label md:col-span-3">
            <span className="label-n">02</span>The problem
          </p>
          <div className="md:col-span-9">
            <SplitReveal as="h2" className="display text-[13vw] md:text-[7.5vw]">
              <span id="problem-title">{problem.headline}</span>
            </SplitReveal>
            <p className="mt-10 max-w-2xl text-pretty text-xl leading-relaxed text-mute md:text-2xl">{problem.intro}</p>
          </div>
        </div>

        {/* The problem in three numbers */}
        <div className="mt-[12vh] grid gap-10 md:grid-cols-12 md:gap-6">
          <p className="label label-sm text-mute md:col-span-3">By the numbers</p>
          <dl className="grid gap-10 sm:grid-cols-3 md:col-span-9 md:gap-8">
            {problem.stats.map((s) => (
              <div key={s.label} data-stat className="border-t border-current/15 pt-5">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <p className="display whitespace-nowrap text-[15vw] leading-none sm:text-[6vw] md:text-[4.8vw]">
                    {s.prefix && <span className="text-[0.45em] align-[0.85em] mr-[0.15em]">{s.prefix.trim()}</span>}
                    <span data-stat-value>{format(s.value, s.decimals)}</span>
                    <span className="italic text-accent">{s.suffix}</span>
                  </p>
                  <p className="mt-4 text-pretty text-lg leading-snug" aria-hidden>
                    {s.label}
                  </p>
                  <p className="mt-2 text-pretty text-sm text-mute">{s.note}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-right text-xs text-mute">{problem.source}</p>

        <div className="relative mt-[14vh] grid gap-12 md:grid-cols-12">
          <div className="hidden md:sticky md:top-[14vh] md:col-span-6 md:block md:h-[72vh]">
            {problem.gaps.map((gap) => (
              <figure key={gap.title} data-plate className="absolute inset-0 overflow-hidden bg-paper-2">
                <PlateImage image={gap.image} sizes="50vw" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent p-5 text-cream">
                  <Caption title={gap.image.caption ?? gap.title} credit={gap.image.credit} />
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="md:col-span-5 md:col-start-8">
            {problem.gaps.map((gap, i) => (
              <article key={gap.title} data-gap className="flex flex-col justify-center py-[6vh] md:min-h-[80vh]">
                <figure data-gap-item className="mb-8 md:hidden">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <PlateImage image={gap.image} sizes="100vw" />
                  </div>
                  <figcaption className="mt-3 text-mute">
                    <Caption title={gap.image.caption ?? gap.title} credit={gap.image.credit} />
                  </figcaption>
                </figure>
                <p data-gap-item className="label">
                  <span className="label-n">0{i + 1}</span>Gap {i + 1}
                </p>
                <h3 data-gap-item className="display mt-4 text-6xl md:text-7xl">
                  {gap.title}
                </h3>
                <p data-gap-item className="mt-6 text-pretty text-lg leading-relaxed text-mute">
                  {gap.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div data-theme="dark" className="relative overflow-hidden py-[20vh]">
        <p className="gutter label opacity-70">So families respond the only ways they can</p>
        <div data-responses className="mt-10 space-y-2" aria-label={problem.responses.join(" ")}>
          {problem.responses.map((r, i) => (
            <p key={r} data-kinetic aria-hidden className={`display whitespace-nowrap text-[17vw] ${i === 1 ? "italic text-accent pl-[20vw]" : ""}`}>
              {r}
            </p>
          ))}
        </div>

        <div className="gutter mt-[22vh] grid gap-8 md:grid-cols-12">
          <p className="label md:col-span-3">
            <span className="label-n">→</span>The question we chose
          </p>
          <SplitReveal as="h3" stagger={0.025} className="display text-[9vw] leading-[1] md:col-span-9 md:text-[4.6vw]">
            <em className="text-accent">How might we</em> {problem.hmw.replace(/^How might we /, "")}
          </SplitReveal>
          <p className="label text-cream/70 md:col-span-9 md:col-start-4">{problem.ambition}</p>
        </div>
      </div>
    </section>
  );
}
