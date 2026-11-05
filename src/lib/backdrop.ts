"use client";

import { getImageProps } from "next/image";
import type { ImageMedia } from "@/content/types";

export type Backdrop = { bg: string; light: boolean };

export const DEFAULT_BACKDROP: Backdrop = { bg: "#1b1a19", light: false };

const luminance = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

export function fromHex(hex: string): Backdrop {
  const n = parseInt(hex.replace("#", ""), 16);
  return { bg: hex, light: luminance((n >> 16) & 255, (n >> 8) & 255, n & 255) > 0.55 };
}

/**
 * Reads the colour of a photo's backdrop: the average of its top band and
 * upper side edges, where a portrait is almost always plain background.
 * Transparent pixels (cut-out PNGs) are ignored; if nothing is left, the
 * default stage colour is used.
 */
export async function sampleBackdrop(photo: ImageMedia, override?: string): Promise<Backdrop> {
  if (override) return fromHex(override);
  const w = 48;
  const h = Math.round((w * photo.h) / photo.w);
  const { props } = getImageProps({ src: photo.src, width: w, height: h, alt: "" });
  const img = new window.Image();
  img.src = props.src;
  try {
    await img.decode();
  } catch {
    return DEFAULT_BACKDROP;
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_BACKDROP;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let r = 0, g = 0, b = 0, count = 0;
  for (let y = 0; y < h * 0.6; y++) {
    for (let x = 0; x < w; x++) {
      const edge = y < h * 0.12 || x < w * 0.1 || x >= w * 0.9;
      if (!edge) continue;
      const i = (y * w + x) * 4;
      if (data[i + 3] < 200) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  if (count < 20) return DEFAULT_BACKDROP;
  [r, g, b] = [r / count, g / count, b / count].map(Math.round);
  return { bg: `rgb(${r}, ${g}, ${b})`, light: luminance(r, g, b) > 0.55 };
}
