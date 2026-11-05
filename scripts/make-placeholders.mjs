#!/usr/bin/env node
/**
 * Generates labelled placeholder media for every file referenced in
 * src/content/site.ts that does not exist yet in /public.
 * Existing files are never touched, so drop real media in whenever you like.
 *
 *   npm run placeholders          # create missing files
 *   npm run placeholders -- --list  # just list what's missing
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (p) => join(root, "public", p);
const content = await import(join(root, "src/content/site.ts"));
const { site, problem, solution, team, challenges } = content;

let ffmpeg = "ffmpeg";
try {
  ffmpeg = (await import("ffmpeg-static")).default ?? ffmpeg;
} catch {}

const FONT = ["/System/Library/Fonts/Menlo.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"].find(existsSync);
const tmp = mkdtempSync(join(tmpdir(), "mm-ph-"));
const listOnly = process.argv.includes("--list");

const palettes = {
  ochre: ["0xC2541B", "0xF2C48D", "0x3A1A0C"],
  ink: ["0x5B2A12", "0xD9A066", "0x1C1916"],
  team: [
    ["0xB4542A", "0xE9B98A", "0x2A140A"],
    ["0x9C3D54", "0xF0B6A6", "0x24101A"],
    ["0x2F5D50", "0xC9B98A", "0x0F1E1A"],
    ["0x7A4E2D", "0xE3C79A", "0x1E130A"],
    ["0x4B3B7A", "0xD9A7C7", "0x14102A"],
  ],
};
const hex = (c) => c.replace("#", "0x");

function paletteFor(path) {
  const t = team.findIndex((m) => path.includes(`/team/${m.slug}`));
  if (t >= 0) return palettes.team[t];
  const c = challenges.find((c) => path.includes(`-${c.slug}/`));
  if (c) return [hex(c.tint[0]), hex(c.tint[1]), "0x1C1916"];
  if (path.includes("/problem/")) return palettes.ink;
  return palettes.ochre;
}

function labelFor(path) {
  const m = team.find((m) => path.includes(`/team/${m.slug}`));
  if (m) return [`${m.name.toUpperCase()}`, path.endsWith(".mp4") ? "close-up" : "portrait"];
  const c = challenges.find((c) => path.includes(`-${c.slug}/`));
  const file = basename(path).replace(/\.\w+$/, "");
  if (c) return [`CH.0${c.n}  ${c.title.toUpperCase()}`, file];
  return [path.split("/").slice(-2, -1)[0].toUpperCase(), file];
}

function seedFor(path) {
  let h = 0;
  for (const ch of path) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 100000;
}

function textFilter(path, w) {
  if (!FONT) return "";
  const [a, b] = labelFor(path);
  const files = ["PLACEHOLDER", a, b].map((t, i) => {
    const f = join(tmp, `${seedFor(path)}-${i}.txt`);
    writeFileSync(f, t);
    return f;
  });
  const s = Math.round(w / 48);
  return [
    `drawtext=fontfile=${FONT}:textfile=${files[0]}:fontsize=${Math.round(s * 0.7)}:fontcolor=white@0.7:x=${s}:y=${s}`,
    `drawtext=fontfile=${FONT}:textfile=${files[1]}:fontsize=${s * 1.4}:fontcolor=white@0.92:x=(w-text_w)/2:y=(h-text_h)/2-${s}`,
    `drawtext=fontfile=${FONT}:textfile=${files[2]}:fontsize=${s}:fontcolor=white@0.6:x=(w-text_w)/2:y=(h/2)+${s}`,
  ].join(",");
}

function gradient(path, w, h, d, speed) {
  const [c0, c1] = paletteFor(path);
  const seed = seedFor(path);
  const [x0, y0] = seed % 2 ? [0, 0] : [w, 0];
  return `gradients=s=${w}x${h}:r=30:x0=${x0}:y0=${y0}:x1=${w - x0}:y1=${h}:c0=${c1}:c1=${c0}:nb_colors=2:seed=${seed}:speed=${speed}:d=${d}`;
}

function run(args) {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${args.at(-1)}`);
}

const fit = (w, h, max) => {
  const k = Math.min(1, max / Math.max(w, h));
  return [Math.round((w * k) / 2) * 2, Math.round((h * k) / 2) * 2];
};

const jobs = [];
const image = (m) => jobs.push({ out: m.src, make: () => makeImage(m.src, m.w, m.h) });
const video = (m) => {
  jobs.push({ out: m.src, make: () => makeVideo(m.src, m.w, m.h, 8, false) });
  jobs.push({ out: m.poster, make: () => makeImage(m.poster, m.w, m.h) });
  if (m.full) jobs.push({ out: m.full, make: () => makeVideo(m.full, m.w, m.h, 30, true) });
};
const media = (m) => (m.kind === "image" ? image(m) : video(m));

function makeImage(out, w0, h0) {
  const [w, h] = fit(w0, h0, 1600);
  const text = textFilter(out, w);
  run(["-f", "lavfi", "-i", gradient(out, w, h, 1, 0.01), "-vf", `noise=alls=10:allf=u,vignette=PI/5${text ? "," + text : ""}`, "-frames:v", "1", "-q:v", "4", pub(out)]);
}

function makeVideo(out, w0, h0, d, withAudio) {
  const [w, h] = fit(w0, h0, 1280);
  const text = textFilter(out, w);
  const vf = `hue=H=2*PI*t/${d}:s=1.1,noise=alls=10:allf=t,vignette=PI/5${text ? "," + text : ""}`;
  const audio = withAudio
    ? ["-f", "lavfi", "-i", `aevalsrc='(0.10*sin(2*PI*220*t)+0.07*sin(2*PI*329.63*t)+0.05*sin(2*PI*440*t))*(0.6+0.4*sin(2*PI*t/4))':s=44100:d=${d}`]
    : [];
  run([
    "-f", "lavfi", "-i", gradient(out, w, h, d, 0.02),
    ...audio,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    ...(withAudio ? ["-c:a", "aac", "-b:a", "96k", "-shortest"] : ["-an"]),
    pub(out),
  ]);
}

media(site.heroClip);
problem.gaps.forEach((g) => image(g.image));
solution.pillars.forEach((p) => image(p.image));
team.forEach((m) => {
  image(m.portrait);
  if (m.clip) video(m.clip);
});
challenges.forEach((c) => {
  image(c.cover);
  c.media.forEach(media);
});

const missing = jobs.filter((j) => !existsSync(pub(j.out)));
console.log(`${jobs.length} media files referenced, ${missing.length} missing.`);
for (const j of missing) {
  console.log(listOnly ? `  missing ${j.out}` : `  making  ${j.out}`);
  if (listOnly) continue;
  mkdirSync(dirname(pub(j.out)), { recursive: true });
  j.make();
}
rmSync(tmp, { recursive: true, force: true });
