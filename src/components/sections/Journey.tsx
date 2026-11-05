"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, MOTION, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { challenges, siteShots } from "@/content/site";
import type { Challenge } from "@/content/types";
import { useSpace } from "@/components/providers/SpaceProvider";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { ThisIsIt } from "@/components/ui/ThisIsIt";

/** Where the three peek thumbnails rest, as % of the plate (mirrored for right-hand plates). */
const FAN = [
  { left: -9, top: -24, r: -8 },
  { left: 72, top: -18, r: 6 },
  { left: 50, top: 74, r: -4 },
];
const THUMB_W = 30;

/** Draws a smooth vertical S-curve through the given points. */
function routePath(points: { x: number; y: number }[]) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dy = (b.y - a.y) * 0.55;
    d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  }
  return d;
}

export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const route = root.current!.querySelector<HTMLElement>("[data-route]")!;
      const path = route.querySelector<SVGPathElement>("[data-path]")!;
      const ghost = route.querySelector<SVGPathElement>("[data-ghost]")!;
      const tip = route.querySelector<SVGCircleElement>("[data-tip]")!;
      let length = 1;
      let progress = 0;

      const draw = () => {
        path.style.strokeDashoffset = String(length * (1 - progress));
        const p = path.getPointAtLength(length * progress);
        tip.setAttribute("cx", String(p.x));
        tip.setAttribute("cy", String(p.y));
      };

      const build = () => {
        const box = route.getBoundingClientRect();
        const nodes = [...route.querySelectorAll<HTMLElement>("[data-node]")].map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
        });
        const start = { x: box.width / 2, y: 0 };
        const end = { x: box.width / 2, y: box.height };
        const d = routePath([start, ...nodes, end]);
        path.setAttribute("d", d);
        ghost.setAttribute("d", d);
        length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        draw();
      };

      build();
      const ro = new ResizeObserver(build);
      ro.observe(route);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        progress = 1;
        draw();
      } else {
        ScrollTrigger.create({
          trigger: route,
          start: "top 55%",
          end: "bottom 55%",
          scrub: 0.6,
          onUpdate: (self) => {
            progress = self.progress;
            draw();
          },
        });
      }

      const mm = gsap.matchMedia();
      mm.add(MOTION.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => {
          const plate = stop.querySelector("[data-plate]");
          const thumbs = stop.querySelectorAll("[data-thumb]");
          const reveal = gsap
            .timeline({ scrollTrigger: { trigger: stop, start: "top 85%", end: "center 55%", scrub: 0.8 } })
            .fromTo(plate, { clipPath: "inset(16% 12% 16% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" });
          const cover = plate?.querySelector("[data-plate-img]");
          if (cover) reveal.fromTo(cover, { scale: 1.35 }, { scale: 1, ease: "none" }, 0);

          // Thumbnails start stacked under the plate's centre and fan out to their resting spots.
          const fromCentre = (axis: "x" | "y") => (_: number, el: HTMLElement) => {
            const p = plate as HTMLElement;
            return axis === "x"
              ? p.offsetLeft + p.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)
              : p.offsetTop + p.offsetHeight / 2 - (el.offsetTop + el.offsetHeight / 2);
          };
          gsap.fromTo(
            thumbs,
            { x: fromCentre("x"), y: fromCentre("y"), scale: 0.7, autoAlpha: 0 },
            {
              x: 0,
              y: 0,
              scale: 1,
              autoAlpha: 1,
              stagger: 0.08,
              ease: "power2.out",
              // Measured once and kept: re-measuring on every refresh would drop the hidden start state
              // and flash the thumbnails in their final spots until scrolling reached them.
              immediateRender: true,
              scrollTrigger: { trigger: stop, start: "top 60%", end: "center 45%", scrub: 1 },
            },
          );

          gsap.from(stop.querySelectorAll("[data-copy]"), {
            y: 40,
            autoAlpha: 0,
            stagger: 0.08,
            scrollTrigger: { trigger: stop, start: "top 65%", once: true },
          });
          gsap.fromTo(
            stop.querySelector("[data-node]"),
            { scale: 0 },
            { scale: 1, ease: "back.out(2)", duration: 0.8, scrollTrigger: { trigger: stop, start: "top 55%", toggleActions: "play none none reverse" } },
          );
        });
      });

      return () => {
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <section id="journey" ref={root} data-theme="light" className="relative overflow-x-clip pt-[18vh] pb-[10vh]" aria-labelledby="journey-title">
      <div className="gutter grid gap-8 md:grid-cols-12">
        <p className="label md:col-span-3">
          <span className="label-n">06</span>The journey
        </p>
        <div className="md:col-span-9">
          <SplitReveal as="h2" className="display text-[14vw] md:text-[8vw]">
            <span id="journey-title">
              Six challenges. <em className="text-accent">One think tank.</em>
            </span>
          </SplitReveal>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-mute">
            Every E-Lab challenge, in order. Follow the line and step into each one: open a space to wander through its photos and films.
          </p>
        </div>
      </div>

      <div data-route className="relative mt-[12vh]">
        <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible" aria-hidden>
          <path data-ghost fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="2 6" />
          <path data-path fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
          <circle data-tip r="5" fill="var(--color-accent)" />
        </svg>
        <ol>
          {challenges.map((c, i) => (
            <Stop key={c.slug} challenge={c} flip={i % 2 === 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stop({ challenge: c, flip }: { challenge: Challenge; flip: boolean }) {
  const { open } = useSpace();
  const thumbs = c.media.slice(0, 3);
  const enter = () => open(c.slug);

  return (
    <li data-stop className="gutter relative grid items-center gap-10 py-[10vh] max-md:pl-14 md:min-h-[100vh] md:grid-cols-12 md:gap-6">
      <div className={`relative md:row-start-1 ${flip ? "md:col-span-7 md:col-start-6" : "md:col-span-7 md:col-start-1"}`}>
        {thumbs.map((m, i) => (
          <span
            key={i}
            data-thumb
            className="absolute hidden overflow-hidden shadow-2xl md:block"
            style={{
              aspectRatio: `${m.w}/${m.h}`,
              width: `${THUMB_W}%`,
              left: `${flip ? 100 - THUMB_W - FAN[i].left : FAN[i].left}%`,
              top: `${FAN[i].top}%`,
              rotate: `${FAN[i].r}deg`,
            }}
            aria-hidden
          >
            <Image src={m.kind === "video" ? m.poster : m.src} alt="" fill sizes="20vw" className="object-cover" />
          </span>
        ))}

        <button
          type="button"
          data-plate
          data-cursor="Enter"
          onClick={enter}
          aria-label={`Enter the space for Challenge ${c.n}: ${c.title}`}
          className="group relative z-[1] block aspect-[16/10] w-full overflow-hidden bg-night"
        >
          {c.slug === "digital-print" ? (
            <ThisIsIt shots={siteShots} className="absolute inset-0" title={false} />
          ) : (
            <Image
              data-plate-img
              src={c.cover.src}
              alt={c.cover.alt}
              fill
              sizes="(min-width: 900px) 58vw, 100vw"
              className="object-cover transition-transform duration-[1.4s] ease-gallery group-hover:scale-105"
            />
          )}
          <span
            className="absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-60"
            style={{ background: `linear-gradient(135deg, ${c.tint[0]}, transparent)` }}
          />
          <span className="absolute bottom-5 left-5 flex items-center gap-3 kicker text-cream">
            <span className="inline-block h-px w-8 bg-current transition-all duration-700 ease-gallery group-hover:w-16" />
            Enter the space
          </span>
          <span className="absolute right-5 top-5 kicker text-cream/80">{c.media.length} pieces</span>
        </button>

        <span
          data-node
          className={`absolute top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-paper kicker text-accent max-md:-left-12 max-md:top-0 max-md:h-9 max-md:w-9 max-md:translate-y-0 ${
            flip ? "md:-left-[22px]" : "md:-right-[22px]"
          }`}
          aria-hidden
        >
          0{c.n}
        </span>
      </div>

      <div className={`relative z-[3] md:row-start-1 ${flip ? "md:col-span-4 md:col-start-1" : "md:col-span-4 md:col-start-9"}`}>
        <p data-copy className="label text-mute">
          <span className="label-n">0{c.n} / 06</span>Challenge {c.n}
        </p>
        <h3 data-copy className="display mt-4 text-[13vw] md:text-[5.2vw]">
          {c.title}
        </h3>
        <p data-copy className="mt-3 font-serif text-2xl italic text-accent">
          {c.kicker}
        </p>
        <dl data-copy className="mt-8 space-y-5">
          <div>
            <dt className="label label-sm text-mute">The brief</dt>
            <dd className="mt-2 text-pretty leading-relaxed">{c.prompt}</dd>
          </div>
          <div>
            <dt className="label label-sm text-mute">What we did</dt>
            <dd className="mt-2 text-pretty leading-relaxed">{c.definition}</dd>
          </div>
        </dl>
        <div data-copy className="mt-8 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button type="button" onClick={enter} className="rounded-full bg-ink px-6 py-3 kicker text-cream transition-colors hover:bg-accent">
              Enter the space →
            </button>
          </Magnetic>
          {c.links.map((l) => (
            <a key={l.href + l.label} href={l.href} target="_blank" rel="noreferrer" className="kicker underline decoration-current/30 underline-offset-4 hover:decoration-current">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </li>
  );
}
