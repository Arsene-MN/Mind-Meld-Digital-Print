"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

CustomEase.create("gallery", "0.22,1,0.36,1");
CustomEase.create("curtain", "0.76,0,0.24,1");

gsap.defaults({ ease: "gallery", duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });

/** Conditions shared by every gsap.matchMedia() call on the site. */
export const MOTION = {
  motion: "(prefers-reduced-motion: no-preference)",
  desktop: "(min-width: 900px)",
};

export { gsap, ScrollTrigger, SplitText, useGSAP };
