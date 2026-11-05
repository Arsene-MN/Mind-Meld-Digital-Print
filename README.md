# Mind Meld: E-Lab Digital Print

The showcase site for **Mind Meld**, an E-Lab think tank: mission, problem, solution, prototype, team, and all six E-Lab challenges.

Built with Next.js 16, TypeScript, Tailwind CSS 4, GSAP (ScrollTrigger + SplitText), Lenis smooth scroll and Motion.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Change the words

Every piece of text lives in **`src/content/site.ts`**: mission, problem, solution, prototype, team bios, the group statement and the six challenges (brief, what we did, captions, links).

Search the file for `TODO(team)` to find what still needs real content:

- Team bios (interests, fun facts, pitches) and the roles for Mike, Angeline and Nadine are placeholders.
- The Challenge 1 group statement.
- The Challenge 2 format and roles, and the Challenge 3 cause.
- YouTube / Instagram links (they currently point to the YouTube and Instagram home pages).
- The USSD short code (`*775#`) and the optional Figma link and screenshot for the prototype.

## Change the media

Put your raw files in **`media-inbox/`** (one folder per section) and run:

```bash
npm run media
```

That's all. It compresses everything (4K/60fps videos and iPhone HEIC photos are fine), cuts 8-second loops and stills from your films, names the files, puts them in `public/media`, and records them in `src/content/media.generated.ts`, which replaces the placeholders on the site. **[`media-inbox/README.md`](media-inbox/README.md) says what goes in each folder**, plus how to set the order, captions, cover and loop moment.

- Raw files stay in the inbox and are ignored by git. Only the processed copies are committed.
- Re-run it whenever you add or change something. Unchanged files are skipped.
- A 3-minute 1080p film comes out at about 55–60 MB (1080p, 30fps, about 2.5 Mbps), under GitHub's 100 MB limit, and it starts playing before it finishes downloading.
- Anything you haven't provided keeps its labelled **PLACEHOLDER**. `npm run placeholders` recreates any placeholder that has gone missing.

**Challenge 06** is this website, so its media is screenshots of the site itself: `npm run capture` (with `npm run dev` running) photographs every section with your installed Chrome, then `npm run media` puts them in. They power the "This is it" infinite zoom.

**Team photos:** use the same framing for everyone (head and shoulders, face centred, plain background). The stage takes on each photo's own backdrop colour. If the colour it picks looks off, set it yourself with `bg: "#2a2a2a"` on that member in `site.ts`.

**YouTube links** for the films go in the `youtube` list near the top of `site.ts`. A film's glowing background only works with the uploaded file, not with a YouTube embed, so the links are shown as a "Watch on YouTube" button.

## Photo credits

Everything is the team's own work except these two photos in the Problem section. Both are credited on the page under the photo:

- **Gap 01:** "Rwandan family traveling in the village" by Muhirehussein12, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Rwandan_filmy.jpg), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Cropped to a 4:5 portrait; the crop is shared under the same licence.
- **Gap 02:** "Pharmacist with PSI products, Kigali, Rwanda" by Marshall Stowell / PSI, for the President's Malaria Initiative, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pharmacist_with_PSI_products_Kigali,_Rwanda_Marshall_Stowell_PSI_(12835707974).jpg), public domain.

To use another photo that isn't yours, add `credit: { text, href }` to it in `site.ts`, and it's shown under the photo.

## How it's built

| Piece | Where |
|---|---|
| Page and section order | `src/app/page.tsx` |
| Sections | `src/components/sections/*` |
| Journey line + peek gallery | `src/components/sections/Journey.tsx` |
| 3D pinboard space, cinema player, reactive glow | `src/components/space/*` |
| Smooth scroll (Lenis) + scroll locks | `src/components/providers/SmoothScroll.tsx` |
| Paper ↔ dark scene cross-fade | `src/components/providers/ThemeScroller.tsx` |
| Colours, fonts, utilities | `src/app/globals.css` |

- Each challenge's space has its own link (`/?space=help-lab`), and the browser Back button closes it.
- Keyboard: Esc closes, ← → switch chapters (in a space) or items (in the cinema), Space plays/pauses, and M mutes.
- With "reduce motion" turned on in the OS, smooth scrolling and scroll-driven animation are turned off and everything is simply shown.

## Deploy

1. Push to a GitHub repository under **your personal account**. Vercel's free Hobby plan can't connect to repositories owned by a GitHub organization.
2. On [Vercel](https://vercel.com/new), import that repository. The defaults work (framework: Next.js, build: `npm run build`), and no environment variables are needed.
3. Every push to `main` redeploys automatically.

Deploy through the GitHub import, not the `vercel` command line: CLI uploads are capped at 100 MB on Hobby, and the processed media is about 300 MB. Git deployments don't have that cap. The largest films are about 53 MB, under GitHub's 100 MB per-file limit (GitHub prints a warning for files over 50 MB; that's fine).

The site's icon is `src/app/icon.svg`. The image shown when the link is shared is `src/app/opengraph-image.jpg`, a capture of the hero.
