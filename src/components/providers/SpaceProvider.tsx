"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { challenges } from "@/content/site";
import { useExperience } from "./Experience";

const SpaceOverlay = dynamic(() => import("@/components/space/SpaceOverlay"), { ssr: false });

type SpaceState = { slug: string; item: number | null } | null;

type SpaceValue = {
  state: SpaceState;
  /** Open a challenge's space, optionally straight into one item's cinema view. */
  open: (slug: string, item?: number | null) => void;
  go: (slug: string) => void;
  setItem: (item: number | null) => void;
  close: () => void;
};

const SpaceContext = createContext<SpaceValue | null>(null);

export function useSpace() {
  const value = useContext(SpaceContext);
  if (!value) throw new Error("useSpace must be used inside <SpaceProvider>");
  return value;
}

const slugFromUrl = () => {
  const slug = new URLSearchParams(window.location.search).get("space");
  return challenges.some((c) => c.slug === slug) ? slug : null;
};

const withSpace = (slug: string | null) => {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("space", slug);
  else url.searchParams.delete("space");
  return url.pathname + url.search + url.hash;
};

/** Keeps the open space in the URL (?space=slug) so Back closes it and links can deep-link into it. */
export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SpaceState>(null);
  const pushed = useRef(false);
  const { entered } = useExperience();

  useEffect(() => {
    if (!entered) return;
    const slug = slugFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deep link read once on entry
    if (slug) setState({ slug, item: null });
    const onPop = () => {
      const s = slugFromUrl();
      pushed.current = false;
      setState(s ? { slug: s, item: null } : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [entered]);

  const open = useCallback((slug: string, item: number | null = null) => {
    if (slugFromUrl() !== slug) {
      window.history.pushState(null, "", withSpace(slug));
      pushed.current = true;
    }
    setState({ slug, item });
  }, []);

  const go = useCallback((slug: string) => {
    window.history.replaceState(null, "", withSpace(slug));
    setState({ slug, item: null });
  }, []);

  const setItem = useCallback((item: number | null) => {
    setState((s) => (s ? { ...s, item } : s));
  }, []);

  const close = useCallback(() => {
    if (pushed.current) window.history.back();
    else window.history.replaceState(null, "", withSpace(null));
    pushed.current = false;
    setState(null);
  }, []);

  return (
    <SpaceContext.Provider value={{ state, open, go, setItem, close }}>
      {children}
      <SpaceOverlay />
    </SpaceContext.Provider>
  );
}
