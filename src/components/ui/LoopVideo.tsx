"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { VideoMedia } from "@/content/types";

type Props = {
  media: VideoMedia;
  className?: string;
  /** Play only while on screen (default). Set false to control playback yourself. */
  auto?: boolean;
  loop?: boolean;
  priority?: boolean;
};

/** A muted, inline, looping clip that only decodes while visible. */
export const LoopVideo = forwardRef<HTMLVideoElement, Props>(function LoopVideo(
  { media, className, auto = true, loop = true, priority = false },
  ref,
) {
  const el = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLVideoElement);

  useEffect(() => {
    const video = el.current;
    if (!video || !auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
          if (video.preload === "none") video.preload = "auto";
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [auto]);

  return (
    <video
      ref={el}
      className={className}
      src={media.src}
      poster={media.poster}
      muted
      playsInline
      loop={loop}
      preload={priority ? "auto" : "none"}
      aria-label={media.alt}
      width={media.w}
      height={media.h}
    />
  );
});
