"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const themes = {
  light: { "--bg": "#f2eee5", "--fg": "#11100e" },
  dark: { "--bg": "#0c0b0a", "--fg": "#f2eee5" },
} as const;

/**
 * Cross-fades the page between gallery paper and screening-room black as
 * sections marked data-theme="dark" | "light" cross the middle of the screen.
 * Rendered last on the page so pinned sections have already added their spacing.
 */
export function ThemeScroller() {
  useGSAP(() => {
    const root = document.documentElement;
    const apply = (theme: keyof typeof themes, instant = false) => {
      root.dataset.scene = theme;
      gsap.to(root, { ...themes[theme], duration: instant ? 0 : 0.9, ease: "power2.out", overwrite: true });
    };
    const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
    sections.forEach((section) => {
      const theme = section.dataset.theme as keyof typeof themes;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && apply(theme),
      });
    });
    apply("light", true);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
  return null;
}
