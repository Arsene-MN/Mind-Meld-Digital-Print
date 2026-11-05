"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useScrollLock } from "./SmoothScroll";

type ExperienceValue = {
  /** True once the visitor has passed the preloader. */
  entered: boolean;
  enter: () => void;
};

const ExperienceContext = createContext<ExperienceValue>({ entered: true, enter: () => {} });

export const useExperience = () => useContext(ExperienceContext);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);
  useScrollLock(!entered);
  const enter = useCallback(() => setEntered(true), []);
  return <ExperienceContext.Provider value={{ entered, enter }}>{children}</ExperienceContext.Provider>;
}
