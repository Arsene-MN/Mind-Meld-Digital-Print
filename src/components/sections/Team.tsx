"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { gsap, MOTION, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site, team } from "@/content/site";
import type { Member } from "@/content/types";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { type Backdrop, DEFAULT_BACKDROP, fromHex, sampleBackdrop } from "@/lib/backdrop";

const INK = "#11100e";
const CREAM = "#f2eee5";
const textOn = (b: Backdrop) => (b.light ? INK : CREAM);

/** Feathers a photo's edges so it dissolves into a stage painted the same colour as its backdrop. */
const FEATHER = "radial-gradient(ellipse 50% 52% at 50% 46%, #000 58%, transparent 100%)";
const feather: React.CSSProperties = { maskImage: FEATHER, WebkitMaskImage: FEATHER };

/**
 * The whole photo, never cropped: it sits on a soft blur of itself, so a photo
 * whose shape doesn't match the frame still fills it gracefully.
 * The optional close-up clip replaces it when a member has one.
 */
function Portrait({ member, sizes, priority }: { member: Member; sizes: string; priority?: boolean }) {
  if (member.clip) return <LoopVideo media={member.clip} className="h-full w-full object-cover" />;
  return (
    <>
      <Image src={member.portrait.src} alt="" fill sizes="120px" className="scale-110 object-cover [filter:blur(24px)_brightness(0.7)]" aria-hidden />
      <Image src={member.portrait.src} alt={member.portrait.alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </>
  );
}

/** The photo as part of the room: whole, bottom-anchored, edges feathered away. */
function StagePhoto({ member, sizes, priority }: { member: Member; sizes: string; priority?: boolean }) {
  return (
    <div className="absolute inset-0" style={feather}>
      {member.clip ? (
        <LoopVideo media={member.clip} className="h-full w-full object-cover" />
      ) : (
        <Image src={member.portrait.src} alt={member.portrait.alt} fill sizes={sizes} priority={priority} className="object-contain object-bottom" />
      )}
    </div>
  );
}

export function Team() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [profile, setProfile] = useState<Member | null>(null);
  const [backdrops, setBackdrops] = useState<Backdrop[]>(() => team.map((m) => (m.bg ? fromHex(m.bg) : DEFAULT_BACKDROP)));
  const previous = useRef(0);

  // Match the stage to each photo's own backdrop colour.
  useEffect(() => {
    let cancelled = false;
    Promise.all(team.map((m) => sampleBackdrop(m.portrait, m.bg))).then((b) => !cancelled && setBackdrops(b));
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll drives who is on stage (hovering a name overrides it); the pointer moves the light and the person.
  useGSAP(
    () => {
      // Park every name but the first below its mask, ready to rise in.
      gsap.set(gsap.utils.toArray<HTMLElement>("[data-bigname]").slice(1), { yPercent: 105, opacity: 1 });

      const mm = gsap.matchMedia();
      mm.add(MOTION, (ctx) => {
        const { motion, desktop } = ctx.conditions!;

        if (!desktop) {
          if (!motion) return;
          gsap.utils.toArray<HTMLElement>("[data-story]").forEach((story) => {
            gsap.fromTo(
              story.querySelector("[data-story-photo]"),
              { y: 40, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1.2, scrollTrigger: { trigger: story, start: "top 75%", once: true } },
            );
          });
          return;
        }

        ScrollTrigger.create({
          trigger: "[data-stage]",
          start: "top top",
          end: `+=${team.length * 65}%`,
          pin: true,
          onUpdate: (self) => setActive(Math.min(team.length - 1, Math.floor(self.progress * team.length))),
        });
        if (!motion) return;

        gsap.from("[data-row]", {
          x: -40,
          autoAlpha: 0,
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-stage]", start: "top 60%", once: true },
        });

        const stage = root.current!.querySelector<HTMLElement>("[data-stage]")!;
        const personX = gsap.quickTo("[data-parallax]", "x", { duration: 1.4, ease: "power3" });
        const nameX = gsap.quickTo("[data-bigname-track]", "x", { duration: 1.8, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          personX(px * 24);
          nameX(-px * 90);
          stage.style.setProperty("--lx", `${e.clientX - r.left}px`);
          stage.style.setProperty("--ly", `${e.clientY - r.top}px`);
        };
        const leave = () => {
          personX(0);
          nameX(0);
        };
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // The room takes on the colour of whoever is standing in it.
  useEffect(() => {
    const stage = root.current!.querySelector("[data-stage]");
    const b = backdrops[active];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(stage, { backgroundColor: b.bg, color: textOn(b), duration: reduce ? 0 : 1.2, ease: "power2.inOut", overwrite: true });
  }, [active, backdrops]);

  // Change who's on stage: the next person materialises out of the room as the last one dissolves.
  useEffect(() => {
    const el = root.current!;
    const prev = previous.current;
    previous.current = active;
    if (prev === active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 0 : 1;
    const down = active > prev;

    el.querySelectorAll<HTMLElement>("[data-person]").forEach((p, i) => {
      if (i === active) {
        gsap.fromTo(
          p,
          { autoAlpha: 0, y: 30, scale: 1.03, filter: "blur(12px)" },
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.3 * d, ease: "expo.out", overwrite: true },
        );
      } else {
        gsap.to(p, { autoAlpha: 0, filter: "blur(8px)", duration: 0.7 * d, ease: "power2.in", overwrite: true });
      }
    });
    el.querySelectorAll<HTMLElement>("[data-bigname]").forEach((n, i) => {
      if (i === active) gsap.fromTo(n, { yPercent: down ? 105 : -105 }, { yPercent: 0, duration: 1.2 * d, ease: "curtain", overwrite: true });
      else if (i === prev) gsap.to(n, { yPercent: down ? -105 : 105, duration: 1.2 * d, ease: "curtain", overwrite: true });
    });
    const detail = el.querySelector("[data-detail]");
    if (detail && !reduce) gsap.fromTo(detail.children, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.7, overwrite: true });
  }, [active]);

  const m = team[active];

  return (
    <section id="team" ref={root} data-theme="dark" className="relative text-cream" aria-labelledby="team-title">
      {/* Desktop: one room that each person steps into */}
      <div data-stage className="relative hidden h-[100svh] overflow-hidden md:block" style={{ backgroundColor: backdrops[0].bg, color: textOn(backdrops[0]) }}>
        {/* A soft light that follows the pointer */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(700px circle at var(--lx, 50%) var(--ly, 35%), rgba(255,255,255,0.07), transparent 65%)" }}
          aria-hidden
        />

        {/* Giant first name behind the person */}
        <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 overflow-hidden opacity-[0.12]" aria-hidden>
          <div data-bigname-track className="relative h-[25vw]">
            {team.map((member, i) => (
              <span
                key={member.slug}
                data-bigname
                className="display absolute inset-x-0 top-0 whitespace-nowrap text-center text-[25vw] italic leading-none"
                style={{ opacity: i === 0 ? undefined : 0 }}
              >
                {member.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* The people */}
        <div className="absolute bottom-0 left-1/2 aspect-[3/4] h-[min(80svh,62vw)] -translate-x-1/2">
          <div data-parallax className="absolute inset-0">
            {team.map((member, i) => (
              <div
                key={member.slug}
                data-person
                className="absolute inset-0"
                style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
                aria-hidden={i !== active}
              >
                <StagePhoto member={member} sizes="(min-width: 900px) 70vh, 100vw" priority={i === 0} />
              </div>
            ))}
          </div>
        </div>

        <div className="gutter absolute inset-x-0 top-24 flex justify-between">
          <p id="team-title" className="label">
            <span className="label-n">05</span>The think tank
          </p>
        </div>

        <ul className="gutter absolute bottom-10 left-0 w-[31%]">
          {team.map((member, i) => (
            <li key={member.slug} data-row>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setProfile(member)}
                data-cursor="Profile"
                className={`group flex w-full items-center gap-4 border-t border-current/15 py-2 text-left transition-opacity duration-500 ${
                  i === active ? "opacity-100" : "opacity-40 hover:opacity-80"
                }`}
              >
                <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-current/10">
                  <Image src={member.portrait.src} alt={member.portrait.alt} fill sizes="40px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="display block truncate text-[clamp(1.6rem,2.4vw,2.6rem)] leading-none">{member.name}</span>
                  <span className="kicker mt-1 block text-[0.62rem] opacity-60">
                    {member.role} · {member.country}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div data-detail className="gutter absolute bottom-10 right-0 w-[min(28%,360px)] text-right" aria-live="polite">
          <p className="label opacity-70">What {m.name.split(" ")[0]} brings</p>
          <p className="mt-3 text-pretty text-lg leading-snug">{m.brings}</p>
          <button type="button" onClick={() => setProfile(m)} className="mt-5 kicker underline decoration-current/40 underline-offset-4 hover:decoration-current">
            Full profile →
          </button>
        </div>
      </div>

      {/* Mobile: one story per person, each in their own colour */}
      <div className="bg-night md:hidden">
        <div className="gutter pt-24 pb-6">
          <p className="label">
            <span className="label-n">05</span>The think tank
          </p>
          <h2 className="display mt-6 text-[15vw]">
            Meet <em className="text-accent-soft">{site.name}</em>
          </h2>
        </div>
        {team.map((member, i) => (
          <article
            key={member.slug}
            data-story
            className="relative overflow-hidden pb-12 transition-colors duration-1000"
            style={{ backgroundColor: backdrops[i].bg, color: textOn(backdrops[i]) }}
          >
            <div data-story-photo className="relative mx-auto aspect-[3/4] w-full">
              <StagePhoto member={member} sizes="100vw" />
            </div>
            <div className="gutter relative -mt-10">
              <p className="kicker opacity-60">
                {member.role} · {member.country}
              </p>
              <h3 className="display mt-2 text-5xl">{member.name}</h3>
              <p className="mt-3 text-pretty opacity-80">{member.brings}</p>
              <button type="button" onClick={() => setProfile(member)} className="mt-4 kicker underline underline-offset-4">
                Full profile →
              </button>
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>{profile && <ProfilePanel member={profile} onClose={() => setProfile(null)} />}</AnimatePresence>
    </section>
  );
}

function ProfilePanel({ member, onClose }: { member: Member; onClose: () => void }) {
  useScrollLock(true);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const facts = [
    ["Country", member.country],
    ["Role", member.role],
    ["Interests", member.interest],
    ["Fun fact", member.funFact],
    ["What I bring", member.brings],
  ];

  return (
    <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Close profile" className="absolute inset-0 bg-night/60 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name}, profile`}
        data-lenis-prevent
        className="absolute inset-y-0 right-0 w-full max-w-[560px] overflow-y-auto bg-paper text-ink"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="flex items-center justify-between p-6">
          <p className="label label-sm text-mute">Profile</p>
          <button ref={close} type="button" onClick={onClose} className="kicker">
            Close ✕
          </button>
        </div>
        <figure className="relative mx-6 aspect-[3/4] overflow-hidden bg-night">
          <Portrait member={member} sizes="560px" />
        </figure>
        <div className="p-6">
          <h3 className="display text-6xl">{member.name}</h3>
          <blockquote className="mt-6 text-pretty font-serif text-2xl italic leading-snug">“{member.pitch}”</blockquote>
          <dl className="mt-8">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 border-t border-ink/15 py-4">
                <dt className="label label-sm text-mute">{k}</dt>
                <dd className="col-span-2 text-pretty">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.aside>
    </motion.div>
  );
}
