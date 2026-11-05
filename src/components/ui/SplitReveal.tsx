"use client";

import { useRef } from "react";
import { gsap, MOTION, SplitText, useGSAP } from "@/lib/gsap";
import { useExperience } from "@/components/providers/Experience";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "div" | "blockquote";
  children: React.ReactNode;
  className?: string;
  /** "scroll" reveals when it enters the viewport; "enter" plays right after the preloader. */
  on?: "scroll" | "enter";
  delay?: number;
  stagger?: number;
};

/**
 * Masked word-by-word reveal. SplitText keeps an accessible label on the
 * element and hides the split pieces from assistive tech. Without JS, or
 * under reduced motion, the text is simply there.
 */
export function SplitReveal({ as: Tag = "h2", children, className, on = "scroll", delay = 0, stagger = 0.05 }: Props) {
  const el = useRef<HTMLElement>(null);
  const { entered } = useExperience();

  useGSAP(
    () => {
      if (on === "enter" && !entered) {
        gsap.set(el.current, { autoAlpha: 0 });
        return;
      }
      gsap.set(el.current, { autoAlpha: 1 });
      const mm = gsap.matchMedia();
      mm.add(MOTION.motion, () => {
        const split = SplitText.create(el.current, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 115,
              rotate: 2,
              duration: 1.25,
              stagger,
              delay,
              scrollTrigger: on === "scroll" ? { trigger: el.current, start: "top 88%", once: true } : undefined,
            }),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [on === "enter" && entered], scope: el, revertOnUpdate: true },
  );

  return (
    // @ts-expect-error -- polymorphic ref
    <Tag ref={el} className={className}>
      {children}
    </Tag>
  );
}
