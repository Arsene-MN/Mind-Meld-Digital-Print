#!/usr/bin/env node
/**
 * Photographs this site, for Challenge 06 ("this website is it").
 * Drives your installed Google Chrome through the running dev server and
 * saves high-resolution screenshots into media-inbox/06-digital-print.
 *
 *   npm run dev                                  # in another terminal
 *   npm run capture                              # or: npm run capture -- http://localhost:3001
 *   npm run media                                # puts them on the site
 */
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "media-inbox/06-digital-print");
const url = process.argv[2] ?? "http://localhost:3000";
const chrome =
  process.env.CHROME_PATH ??
  {
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    linux: "/usr/bin/google-chrome",
  }[process.platform];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (/\.(jpg|png)$/i.test(f)) rmSync(join(out, f));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", "--mute-audio"],
});

async function open(viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 90_000 });
  // Pass the preloader.
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => b.textContent?.includes("to enter") && getComputedStyle(b).opacity === "1"),
    { timeout: 60_000 },
  );
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("to enter"))?.click());
  await wait(3500);
  return page;
}

/** Scrolls so `selector`'s top (plus a fraction of the viewport) is at the top, lets the motion settle, then shoots. */
async function shot(page, name, { selector, offset = 0, settle = 2200, before } = {}) {
  await page.evaluate(
    ({ selector, offset }) => {
      const el = selector ? document.querySelector(selector) : null;
      const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
      window.scrollTo(0, top + offset * window.innerHeight);
    },
    { selector, offset },
  );
  await wait(settle);
  if (before) {
    await before(page);
  }
  // Keep the cursor dot out of the picture.
  await page.mouse.move(-10, -10);
  await page.screenshot({ path: join(out, `${name}.jpg`), type: "jpeg", quality: 90 });
  console.log(`  ${name}`);
}

const desktop = await open({ width: 1440, height: 900, deviceScaleFactor: 2 });
await shot(desktop, "1 The hero", { settle: 1500 });
await shot(desktop, "2 The hero opens up", { selector: "#top", offset: 1.25 });
await shot(desktop, "3 Our mission", { selector: "#mission", offset: 0.05 });
await shot(desktop, "4 They wait, they borrow", { selector: "[data-responses]", offset: -0.3 });
await shot(desktop, "5 The solution, side by side", { selector: "#solution [data-pin]", offset: 0.9 });
await shot(desktop, "6 The USSD prototype", {
  selector: "#prototype",
  offset: 0.12,
  before: async (page) => {
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("for me"))?.click());
    await wait(3200);
  },
});
await shot(desktop, "7 The team stage", { selector: "#team", offset: 0.02 });
await shot(desktop, "8 The journey line", { selector: "[data-stop]:nth-child(3)", offset: -0.1 });
await shot(desktop, "9 A challenge space", {
  selector: "[data-stop]:nth-child(3)",
  before: async (page) => {
    await page.evaluate(() => document.querySelector("[data-stop]:nth-child(3) [data-plate]")?.click());
    await wait(3500);
  },
});
await shot(desktop, "10 The cinema", {
  before: async (page) => {
    await page.evaluate(() => document.querySelector("[data-item]")?.click());
    await wait(4500);
  },
});
await desktop.close();

const phone = await open({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await shot(phone, "11 On a phone", { settle: 2500 });
await phone.close();

await browser.close();
console.log(`\nSaved to media-inbox/06-digital-print. Now run: npm run media`);
