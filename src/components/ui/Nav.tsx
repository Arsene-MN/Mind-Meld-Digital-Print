"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/content/site";
import { useExperience } from "@/components/providers/Experience";
import { useLenis, useScrollLock } from "@/components/providers/SmoothScroll";

const links = [
  { href: "#mission", label: "Mission" },
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#prototype", label: "Prototype" },
  { href: "#team", label: "Team" },
  { href: "#journey", label: "Journey" },
];

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { entered } = useExperience();
  const lenis = useLenis();
  useScrollLock(open);

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => gsap.set("[data-progress]", { scaleX: self.progress }),
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (entered) gsap.from("[data-nav-item]", { y: -16, autoAlpha: 0, stagger: 0.05, duration: 1, delay: 0.6 });
    },
    { scope: root, dependencies: [entered] },
  );

  useGSAP(
    () => {
      if (!open) return;
      gsap.from("[data-menu-link]", { yPercent: 110, stagger: 0.05, duration: 1, ease: "curtain" });
    },
    { scope: menu, dependencies: [open] },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const jump = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.6, force: true });
    else target.scrollIntoView();
  };

  return (
    <>
      <header ref={root} className="pointer-events-none fixed inset-x-0 top-0 z-[60] text-cream mix-blend-difference">
        <div className="gutter flex items-center justify-between py-5">
          <a href="#top" onClick={jump("#top")} data-nav-item className="pointer-events-auto display text-2xl leading-none">
            Mind <em>Meld</em>
          </a>
          <nav aria-label="Sections" className="pointer-events-auto hidden items-center gap-7 lg:flex">
            {links.map((l, i) => (
              <a key={l.href} href={l.href} onClick={jump(l.href)} data-nav-item className="kicker group relative">
                <span className="mr-1.5 opacity-50">0{i + 1}</span>
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-gallery group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="pointer-events-auto flex items-center gap-5" data-nav-item>
            <span className="kicker hidden opacity-60 lg:inline">
              {site.programme} {site.year}
            </span>
            <button className="kicker lg:hidden" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="menu">
              Menu
            </button>
          </div>
        </div>
        <div className="h-px w-full origin-left scale-x-0 bg-current opacity-60" data-progress />
      </header>

      {open && (
        <div
          id="menu"
          ref={menu}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-night text-cream gutter py-5"
        >
          <div className="flex items-center justify-between">
            <span className="display text-2xl">
              Mind <em>Meld</em>
            </span>
            <button className="kicker" onClick={() => setOpen(false)} autoFocus>
              Close
            </button>
          </div>
          <nav aria-label="Sections" className="flex flex-col">
            {links.map((l, i) => (
              <span key={l.href} className="split-line block">
                <a data-menu-link href={l.href} onClick={jump(l.href)} className="display block text-[13vw] leading-[1.02]">
                  <span className="kicker mr-3 align-top text-accent">0{i + 1}</span>
                  {l.label}
                </a>
              </span>
            ))}
          </nav>
          <p className="kicker text-cream/50">
            {site.programme} {site.year} · Digital Print
          </p>
        </div>
      )}
    </>
  );
}
