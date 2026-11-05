"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Gently pulls its child toward the pointer. Fine pointers only. */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const node = el.current!;
      if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
      const x = gsap.quickTo(node, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const y = gsap.quickTo(node, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const move = contextSafe!((e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      });
      const leave = contextSafe!(() => {
        x(0);
        y(0);
      });
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      };
    },
    { scope: el },
  );

  return (
    <span ref={el} className="inline-block will-change-transform">
      {children}
    </span>
  );
}
