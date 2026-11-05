#!/usr/bin/env node
/**
 * Turns raw files in /media-inbox into web-ready media in /public/media and
 * records them in src/content/media.generated.ts, which site.ts reads.
 *
 *   npm run media
 *
 * Sections with nothing in the inbox are left exactly as they were, so you can
 * clear the inbox after processing. See media-inbox/README.md for the rules.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inbox = join(root, "media-inbox");
const pub = (p) => join(root, "public", p);
const generatedFile = join(root, "src/content/media.generated.ts");
const cacheFile = join(inbox, ".cache.json");
const tmp = mkdtempSync(join(tmpdir(), "mm-media-"));

const { challenges, team } = await import(join(root, "src/content/site.ts"));
const { generated: previous } = await import(generatedFile);

let ffmpeg = "ffmpeg";
try {
  ffmpeg = (await import("ffmpeg-static")).default ?? ffmpeg;
} catch {}

const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff", ".avif"]);
const VIDEO = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"]);
const FILM_SECONDS = 40;
const LOOP_SECONDS = 8;

const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf8")) : {};

// ── helpers ──────────────────────────────────────────────────────────────────

function run(args) {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.at(-1)}`);
}

function probe(file) {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const text = r.stderr ?? "";
  const d = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const v = text.match(/Stream[^\n]*Video:[^\n]*?\b(\d{2,5})x(\d{2,5})\b/);
  const fps = text.match(/Stream[^\n]*Video:[^\n]*?([\d.]+) fps/);
  const rot = text.match(/rotation of (-?[\d.]+)/);
  let [w, h] = v ? [Number(v[1]), Number(v[2])] : [0, 0];
  if (rot && Math.abs(Number(rot[1])) % 180 === 90) [w, h] = [h, w];
  return {
    duration: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0,
    w,
    h,
    fps: fps ? Number(fps[1]) : 30,
    audio: /Stream[^\n]*Audio:/.test(text),
  };
}

const kindOf = (file) => {
  const e = extname(file).toLowerCase();
  return IMAGE.has(e) ? "image" : VIDEO.has(e) ? "video" : null;
};

/** Files in an inbox folder, in natural name order. */
function list(folder) {
  const dir = join(inbox, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith(".") && kindOf(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((f) => join(dir, f));
}

/** "2 Painting the classroom @1:05.mov" → { order: "2", label: "Painting the classroom", at: 65 } */
function parseName(file) {
  let name = basename(file, extname(file));
  let at = null;
  const marker = name.match(/\s*@\s*(\d+)(?::(\d+))?\s*$/);
  if (marker) {
    at = marker[2] !== undefined ? Number(marker[1]) * 60 + Number(marker[2]) : Number(marker[1]);
    name = name.slice(0, marker.index);
  }
  const label = name.replace(/^\d+[\s._-]+/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const cameraName = /^(img|dsc|dscn|pxl|vid|mov|mvimg|photo|video|screenshot)?[\s]*[\d\s.]*$/i.test(label);
  return { label: cameraName ? "" : label.charAt(0).toUpperCase() + label.slice(1), at };
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 48) || "item";

/**
 * A short fingerprint of a source file, added to the names of fixed-slot outputs
 * (hero, problem, solution, team). A new photo gets a new address, so no browser
 * or image cache can keep showing the old one.
 */
const fingerprint = (file) => {
  const s = statSync(file);
  return createHash("sha1").update(`${file}|${s.size}|${s.mtimeMs}`).digest("hex").slice(0, 8);
};

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Limits the short side of a video to `px`, never upscaling. Keeps orientation. */
const shortSide = (px) => `scale='if(gte(iw,ih),-2,min(iw,${px}))':'if(gte(iw,ih),min(ih,${px}),-2)'`;
const fpsFilter = (fps) => (fps > 30.5 ? ",fps=30" : "");

function cached(input, key, make) {
  const s = statSync(input);
  const id = `${key}|${input}|${s.size}|${s.mtimeMs}`;
  const hit = cache[id];
  if (hit && hit.files.every((f) => existsSync(pub(f)))) return hit.result;
  const { result, files } = make();
  cache[id] = { result, files };
  writeFileSync(cacheFile, JSON.stringify(cache, null, 1));
  return result;
}

// ── processors ───────────────────────────────────────────────────────────────

/** Any photo (including iPhone HEIC) → an upright, resized JPG. */
async function photo(input, out, { max = 2000, alt, caption } = {}) {
  const s = statSync(input);
  const id = `photo:${out}:${max}|${input}|${s.size}|${s.mtimeMs}`;
  const hit = cache[id];
  if (hit && existsSync(pub(out))) return { ...hit.result, alt, caption: caption || undefined };

  let source = input;
  if ([".heic", ".heif"].includes(extname(input).toLowerCase())) {
    // sharp can't read iPhone HEIC; macOS's sips can.
    source = join(tmp, `${basename(input)}.jpg`);
    const r = spawnSync("sips", ["-s", "format", "jpeg", input, "--out", source], { stdio: "ignore" });
    if (r.status !== 0) throw new Error(`Couldn't read ${basename(input)}. Export it as JPG and try again.`);
  }
  mkdirSync(dirname(pub(out)), { recursive: true });
  const info = await sharp(source)
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(pub(out));
  const result = { kind: "image", src: out, w: info.width, h: info.height };
  cache[id] = { result, files: [out] };
  writeFileSync(cacheFile, JSON.stringify(cache, null, 1));
  return { ...result, alt, caption: caption || undefined };
}

function poster(fromVideo, out, at) {
  run(["-ss", String(at), "-i", pub(fromVideo), "-frames:v", "1", "-q:v", "3", pub(out)]);
}

/** A film (> 40 s): 1080p with sound for the cinema + an 8 s muted loop and a still for the pinboard. */
function film(input, base, info, at) {
  return cached(input, `film:${base}:${at}`, () => {
    const full = `${base}-full.mp4`;
    const loop = `${base}.mp4`;
    const still = `${base}.jpg`;
    const start = Math.max(0, Math.min(at ?? info.duration * 0.2, info.duration - LOOP_SECONDS));
    mkdirSync(dirname(pub(full)), { recursive: true });
    console.log(`    film  → ${full} (this can take a few minutes)`);
    run([
      "-i", input,
      "-vf", shortSide(1080) + fpsFilter(info.fps),
      "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-maxrate", "2.5M", "-bufsize", "5M", "-pix_fmt", "yuv420p",
      ...(info.audio ? ["-c:a", "aac", "-b:a", "128k", "-ac", "2"] : ["-an"]),
      "-movflags", "+faststart", pub(full),
    ]);
    console.log(`    loop  → ${loop}`);
    run([
      "-ss", String(start), "-t", String(LOOP_SECONDS), "-i", input,
      "-vf", shortSide(720) + fpsFilter(info.fps),
      "-c:v", "libx264", "-preset", "medium", "-crf", "27", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", pub(loop),
    ]);
    poster(loop, still, 0);
    const out = probe(pub(full));
    return {
      result: { kind: "video", src: loop, poster: still, full, w: out.w, h: out.h, duration: clock(info.duration) },
      files: [full, loop, still],
    };
  });
}

/** A short clip (≤ 40 s): one 720p file, muted on the pinboard and with sound in the cinema. */
function clip(input, base, info) {
  return cached(input, `clip:${base}`, () => {
    const src = `${base}.mp4`;
    const still = `${base}.jpg`;
    mkdirSync(dirname(pub(src)), { recursive: true });
    console.log(`    clip  → ${src}`);
    run([
      "-i", input,
      "-vf", shortSide(720) + fpsFilter(info.fps),
      "-c:v", "libx264", "-preset", "medium", "-crf", "25", "-maxrate", "2M", "-bufsize", "4M", "-pix_fmt", "yuv420p",
      ...(info.audio ? ["-c:a", "aac", "-b:a", "96k", "-ac", "2"] : ["-an"]),
      "-movflags", "+faststart", pub(src),
    ]);
    poster(src, still, Math.min(1, info.duration / 3));
    const out = probe(pub(src));
    return {
      result: { kind: "video", src, poster: still, w: out.w, h: out.h, duration: clock(info.duration) },
      files: [src, still],
    };
  });
}

/** The hero: a muted, seamless-enough loop of up to 10 s. */
function heroLoop(input, info, at) {
  return cached(input, `hero:${at}`, () => {
    const id = fingerprint(input);
    const src = `/media/hero/montage-${id}.mp4`;
    const still = `/media/hero/montage-${id}.jpg`;
    const length = Math.min(10, info.duration);
    const start = info.duration <= 12 ? 0 : Math.max(0, Math.min(at ?? info.duration * 0.15, info.duration - length));
    mkdirSync(dirname(pub(src)), { recursive: true });
    console.log(`    hero  → ${src}`);
    run([
      "-ss", String(start), "-t", String(length), "-i", input,
      "-vf", shortSide(1080) + fpsFilter(info.fps),
      "-c:v", "libx264", "-preset", "medium", "-crf", "25", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", pub(src),
    ]);
    poster(src, still, 0);
    const out = probe(pub(src));
    return { result: { kind: "video", src, poster: still, w: out.w, h: out.h }, files: [src, still] };
  });
}

/** Removes files in an output folder that the new set doesn't use (old placeholders, renamed items). */
function prune(folder, keep) {
  const dir = pub(folder);
  if (!existsSync(dir)) return;
  const used = new Set(keep.map((f) => basename(f)));
  for (const f of readdirSync(dir)) if (!used.has(f)) rmSync(join(dir, f));
}

const filesOf = (m) => [m.src, m.poster, m.full].filter(Boolean);

// ── sections ─────────────────────────────────────────────────────────────────

const next = structuredClone(previous);
next.team ??= {};
next.challenges ??= {};

async function section(name, fn) {
  console.log(`\n${name}`);
  try {
    await fn();
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
    process.exitCode = 1;
  }
}

await section("hero/", async () => {
  const video = list("hero").find((f) => kindOf(f) === "video");
  if (!video) return console.log("  (empty, unchanged)");
  console.log(`  ${basename(video)}`);
  next.hero = heroLoop(video, probe(video), parseName(video).at);
  prune("/media/hero", [next.hero.src, next.hero.poster]);
});

for (const [folder, max] of [["problem", 2], ["solution", 3]]) {
  await section(`${folder}/`, async () => {
    const photos = list(folder).filter((f) => kindOf(f) === "image").slice(0, max);
    if (!photos.length) return console.log("  (empty, unchanged)");
    next[folder] = [];
    for (const [i, f] of photos.entries()) {
      console.log(`  ${basename(f)}`);
      next[folder][i] = await photo(f, `/media/${folder}/${folder}-0${i + 1}-${fingerprint(f)}.jpg`, { max: 1800 });
    }
    prune(`/media/${folder}`, next[folder].map((m) => m.src));
  });
}

await section("team/", async () => {
  const photos = list("team").filter((f) => kindOf(f) === "image");
  if (!photos.length) return console.log("  (empty, unchanged)");
  for (const f of photos) {
    const first = basename(f, extname(f)).toLowerCase().split(/[\s._-]+/)[0];
    const member = team.find((m) => m.slug === first || m.name.toLowerCase().split(" ")[0] === first);
    if (!member) {
      console.log(`  ? ${basename(f)}: name it after a first name (${team.map((m) => m.slug).join(", ")})`);
      continue;
    }
    console.log(`  ${basename(f)} → ${member.name}`);
    const out = `/media/team/${member.slug}-${fingerprint(f)}.jpg`;
    next.team[member.slug] = await photo(f, out, { max: 1600 });
    // Drop this person's older processed photos (their placeholder, named without a fingerprint, stays).
    for (const old of readdirSync(pub("/media/team"))) {
      if (old.startsWith(`${member.slug}-`) && `/media/team/${old}` !== out) rmSync(pub(`/media/team/${old}`));
    }
  }
});

for (const c of challenges) {
  const folder = `0${c.n}-${c.slug}`;
  await section(`${folder}/`, async () => {
    const files = list(folder);
    if (!files.length) return console.log("  (empty, unchanged)");
    const out = `/media/challenges/${folder}`;
    const used = new Set();
    const base = (label, fallback) => {
      let s = slugify(label || fallback);
      for (let k = 2; used.has(s); k++) s = `${slugify(label || fallback)}-${k}`;
      used.add(s);
      return `${out}/${s}`;
    };

    const films = [];
    const rest = [];
    let cover = null;
    let photoCount = 0;
    let videoCount = 0;
    for (const f of files) {
      const kind = kindOf(f);
      const { label, at } = parseName(f);
      console.log(`  ${basename(f)}`);
      if (kind === "image") {
        photoCount++;
        const isCover = /^cover$/i.test(label);
        const alt = isCover ? `${c.title}: cover photo` : label || `${c.title}, photo ${photoCount}`;
        const media = await photo(f, `${base(isCover ? "cover" : label, `photo-${photoCount}`)}.jpg`, {
          alt,
          caption: isCover ? undefined : label,
        });
        if (isCover) cover = media;
        else rest.push(media);
      } else if (kind === "video") {
        videoCount++;
        const info = probe(f);
        const b = base(label, `video-${videoCount}`);
        const alt = label || `${c.title}, video ${videoCount}`;
        if (info.duration > FILM_SECONDS) films.push({ ...film(f, b, info, at), alt, caption: label || undefined });
        else rest.push({ ...clip(f, b, info), alt, caption: label || undefined });
      }
    }
    const media = [...films, ...rest];
    if (!cover) {
      const firstPhoto = media.find((m) => m.kind === "image");
      const firstVideo = media.find((m) => m.kind === "video");
      cover = firstPhoto
        ? { ...firstPhoto, caption: undefined }
        : firstVideo && { kind: "image", src: firstVideo.poster, w: firstVideo.w, h: firstVideo.h, alt: firstVideo.alt };
    }
    next.challenges[c.slug] = { cover, media };
    prune(out, [...media.flatMap(filesOf), cover?.src].filter(Boolean));
  });
}

// ── write ────────────────────────────────────────────────────────────────────

const body = JSON.stringify(next, null, 2);
writeFileSync(
  generatedFile,
  `// Written by \`npm run media\` from the files in /media-inbox. Don't edit by hand: re-run the command instead.
// Anything listed here replaces the matching placeholder in site.ts.
import type { ImageMedia, Media, VideoMedia } from "./types";

/** Photos for fixed slots (hero, problem, solution, team) take their words from site.ts. */
type Slot<T> = Omit<T, "alt"> & { alt?: string };

export const generated: {
  hero?: Slot<VideoMedia>;
  problem?: Slot<ImageMedia>[];
  solution?: Slot<ImageMedia>[];
  team?: Record<string, Slot<ImageMedia>>;
  challenges?: Record<string, { cover?: ImageMedia; media: Media[] }>;
} = ${body};
`,
);
rmSync(tmp, { recursive: true, force: true });
console.log(`\nDone. Updated src/content/media.generated.ts`);
