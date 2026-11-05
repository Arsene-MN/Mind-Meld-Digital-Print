"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A small dot that follows the pointer and grows into a labelled disc over
 * anything with a data-cursor attribute ("Open", "Play", "Drag"…).
 * Hidden on touch devices by CSS; the native cursor is never removed.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useGSAP(
    (_, contextSafe) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const node = root.current!;
      const x = gsap.quickTo(node, "x", { duration: 0.45, ease: "power3" });
      const y = gsap.quickTo(node, "y", { duration: 0.45, ease: "power3" });
      gsap.set(node, { xPercent: -50, yPercent: -50 });

      const move = contextSafe!((e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
      });
      const over = (e: PointerEvent) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
        setLabel(target?.dataset.cursor ?? "");
      };
      const hide = contextSafe!(() => gsap.to(node, { autoAlpha: 0, duration: 0.3 }));
      const show = contextSafe!(() => gsap.to(node, { autoAlpha: 1, duration: 0.3 }));

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerover", over);
      document.documentElement.addEventListener("pointerleave", hide);
      document.documentElement.addEventListener("pointerenter", show);
      window.addEventListener("blur", hide);
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", hide);
        document.documentElement.removeEventListener("pointerenter", show);
        window.removeEventListener("blur", hide);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="cursor pointer-events-none fixed left-0 top-0 z-[200] mix-blend-difference" aria-hidden>
      <div
        className="flex items-center justify-center rounded-full bg-cream text-ink transition-[width,height] duration-500 ease-gallery"
        style={{ width: label ? 88 : 10, height: label ? 88 : 10 }}
      >
        <span className={`kicker text-[0.62rem] transition-opacity duration-300 ${label ? "opacity-100" : "opacity-0"}`}>{label}</span>
      </div>
    </div>
  );
}
