"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Challenge, Media } from "@/content/types";
import { GLOW_H, GLOW_W, useAmbientGlow } from "./useAmbientGlow";

type Props = {
  challenge: Challenge;
  index: number;
  /** Where the clicked thumbnail was, so the player can grow out of it. */
  origin: DOMRect | null;
  onIndex: (i: number) => void;
  onClose: () => void;
};

const time = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function youtubeId(url?: string) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Fit a w×h box inside the available stage. */
function fitBox(w: number, h: number) {
  const maxW = window.innerWidth * (window.innerWidth < 900 ? 0.92 : 0.74);
  const maxH = window.innerHeight * 0.66;
  const k = Math.min(maxW / w, maxH / h);
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

export function CinemaViewer({ challenge, index, origin, onIndex, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [clock, setClock] = useState({ t: 0, d: 0 });
  const [box, setBox] = useState({ width: 0, height: 0 });

  const media: Media = challenge.media[index];
  const total = challenge.media.length;
  const yt = media.kind === "video" && !media.full ? youtubeId(media.youtube) : null;
  const isVideo = media.kind === "video" && !yt;
  const source = (isVideo ? video : yt ? poster : image) as React.RefObject<HTMLVideoElement | HTMLImageElement | null>;

  useAmbientGlow(canvas, source, index);

  useEffect(() => {
    const size = () => setBox(fitBox(media.w, media.h));
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, [media.w, media.h]);

  // Grow out of the thumbnail on first open.
  useGSAP(
    () => {
      if (!box.width) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.from("[data-chrome]", { autoAlpha: 0, y: 20, stagger: 0.05, duration: 0.8, delay: 0.35 });
      if (reduce || !origin || !frame.current) return;
      const end = frame.current.getBoundingClientRect();
      gsap.from(frame.current, {
        x: origin.left + origin.width / 2 - (end.left + end.width / 2),
        y: origin.top + origin.height / 2 - (end.top + end.height / 2),
        scaleX: origin.width / end.width,
        scaleY: origin.height / end.height,
        duration: 1.1,
        ease: "expo.inOut",
      });
    },
    { scope: root, dependencies: [box.width > 0] },
  );

  // Each new item eases in.
  useGSAP(
    () => {
      gsap.fromTo("[data-media]", { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.9 });
    },
    { scope: root, dependencies: [index] },
  );

  // Progress bar runs off rAF so it's smooth even though timeupdate is coarse.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const sync = () => {
      setPlaying(!v.paused && !v.ended);
      setMuted(v.muted);
      setClock({ t: v.currentTime, d: v.duration });
    };
    const events = ["play", "pause", "ended", "volumechange", "timeupdate", "loadedmetadata"] as const;
    events.forEach((e) => v.addEventListener(e, sync));
    void v.play().catch(() => {
      // Autoplay with sound refused: fall back to muted so something still moves.
      v.muted = true;
      void v.play().catch(() => {});
    });
    return () => {
      cancelAnimationFrame(raf);
      events.forEach((e) => v.removeEventListener(e, sync));
    };
  }, [index, isVideo]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused || v.ended) void v.play();
    else v.pause();
  }, []);

  const step = useCallback((d: number) => onIndex((index + d + total) % total), [index, total, onIndex]);

  const fullscreen = () => {
    const el = frame.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === " " && isVideo) {
        e.preventDefault();
        toggle();
      }
      if (e.key.toLowerCase() === "m" && video.current) video.current.muted = !video.current.muted;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, toggle, onClose, isVideo]);

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = video.current;
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const go = (x: number) => (v.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * v.duration);
    go(e.clientX);
    const move = (ev: PointerEvent) => go(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const caption = media.caption ?? media.alt;

  return (
    <div ref={root} className="fixed inset-0 z-[95] flex flex-col items-center justify-center overflow-hidden bg-night text-cream" role="dialog" aria-modal="true" aria-label={caption}>
      {/* The reactive glow */}
      <canvas
        ref={canvas}
        width={GLOW_W}
        height={GLOW_H}
        aria-hidden
        className="pointer-events-none absolute left-[-15%] top-[-15%] h-[130%] w-[130%] opacity-90 [filter:blur(80px)_saturate(1.7)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(12,11,10,0.85)_100%)]" aria-hidden />

      <div data-chrome className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gutter py-5">
        <p className="kicker text-cream/70">
          Ch.0{challenge.n} · {challenge.title} — {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <button type="button" onClick={onClose} className="kicker flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2 hover:border-cream" autoFocus>
          Close <span className="text-cream/50">Esc</span>
        </button>
      </div>

      <div ref={frame} className="relative z-[5] bg-black shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]" style={{ width: box.width, height: box.height }}>
        <div data-media className="absolute inset-0" key={index}>
          {isVideo && media.kind === "video" ? (
            <video
              ref={video}
              src={media.full ?? media.src}
              poster={media.poster}
              playsInline
              preload="metadata"
              onClick={toggle}
              data-cursor={playing ? "Pause" : "Play"}
              className="h-full w-full object-contain"
              aria-label={media.alt}
            />
          ) : yt && media.kind === "video" ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- hidden source for the glow */}
              <img ref={poster} src={media.poster} alt="" className="hidden" />
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={media.alt}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- the glow samples this element directly
            <img ref={image} src={media.src} alt={media.alt} className="h-full w-full object-contain" />
          )}
        </div>
      </div>

      <div data-chrome className="relative z-10 mt-5 w-full" style={{ maxWidth: Math.max(box.width, 280) }}>
        {isVideo && (
          <div className="flex items-center gap-4">
            <button type="button" onClick={toggle} className="kicker w-14 text-left" aria-label={playing ? "Pause" : "Play"}>
              {playing ? "Pause" : "Play"}
            </button>
            <span className="kicker tabular-nums text-cream/60">{time(clock.t)}</span>
            <div
              className="group relative h-6 flex-1 cursor-pointer touch-none"
              onPointerDown={seek}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(clock.d || 0)}
              aria-valuenow={Math.round(clock.t)}
              tabIndex={0}
              onKeyDown={(e) => {
                const v = video.current;
                if (!v) return;
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") e.stopPropagation();
                if (e.key === "ArrowRight") v.currentTime += 5;
                if (e.key === "ArrowLeft") v.currentTime -= 5;
              }}
            >
              <div className="absolute inset-x-0 top-1/2 h-px bg-cream/20 transition-[height] group-hover:h-[3px]" />
              <div ref={bar} className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-cream transition-[height] group-hover:h-[3px]" />
            </div>
            <span className="kicker tabular-nums text-cream/60">{time(clock.d)}</span>
            <button type="button" onClick={() => video.current && (video.current.muted = !muted)} className="kicker w-14 text-right">
              {muted ? "Unmute" : "Mute"}
            </button>
            <button type="button" onClick={fullscreen} className="kicker hidden sm:block" aria-label="Fullscreen">
              ⤢
            </button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-serif text-2xl italic">{caption}</p>
          {media.kind === "video" && media.youtube && (
            <a href={media.youtube} target="_blank" rel="noreferrer" className="kicker rounded-full bg-cream px-4 py-2 text-ink transition-colors hover:bg-accent hover:text-cream">
              Watch on YouTube ↗
            </a>
          )}
        </div>
      </div>

      {total > 1 && (
        <>
          <button type="button" data-chrome onClick={() => step(-1)} aria-label="Previous" className="absolute left-0 top-1/2 z-10 -translate-y-1/2 gutter py-10 kicker text-cream/60 hover:text-cream">
            ← Prev
          </button>
          <button type="button" data-chrome onClick={() => step(1)} aria-label="Next" className="absolute right-0 top-1/2 z-10 -translate-y-1/2 gutter py-10 kicker text-cream/60 hover:text-cream">
            Next →
          </button>
        </>
      )}
    </div>
  );
}
