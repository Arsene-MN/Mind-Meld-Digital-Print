# Media inbox

Drop your raw photos and videos here, then run:

```bash
npm run media
```

It compresses everything, cuts short loops and stills from your videos, names the files and puts them on the site. Raw files can be any size (CapCut 1080p exports, iPhone photos including HEIC, anything). They stay here and are never uploaded to git. Only the small processed copies in `public/media` are.

Run it again any time you add or change something. Files it has already processed are skipped, so it's fast.

## What goes where

| Folder | Put in | Becomes |
|---|---|---|
| `hero/` | **one video** of the team (any length) | the looping video at the top of the page |
| `problem/` | **2 photos**: the first is Gap 01 (the lump sum), the second Gap 02 (the uncovered cost) | the two problem images |
| `solution/` | **3 photos**, in order: health basket, gap pot, USSD phone | the three solution images |
| `team/` | **one photo per person, named by first name**: `arsene.jpg`, `ineza.heic`, `mike.png`… | the team portraits |
| `01-introduction/` … `06-digital-print/` | **everything for that challenge**: films, short clips, photos, slides | that challenge's space |

## Inside a challenge folder

- **Films** (longer than 40 seconds) get a 1080p version with sound for the cinema, plus an 8-second muted loop and a still for the pinboard. They're placed first, in the middle of the space.
- **Short clips** (40 seconds or less) are shown as they are, with their sound in the cinema.
- **Photos** are resized and placed around the films.
- **Order:** sorted by file name. Start names with numbers (`1 ...`, `2 ...`) to control it.
- **Captions** come from the file name: `2 Painting the classroom.jpg` is captioned "Painting the classroom". Camera names like `IMG_2041.HEIC` get no caption.
- **Cover:** name a photo `cover` (e.g. `cover.jpg`) to make it the big picture on the journey line. Otherwise the first photo is used.
- **Loop moment:** add `@` and a time to a film's name to choose where its 8-second loop starts: `Help Lab film @1:05.mp4`. Otherwise it starts 20% of the way in.

## Challenge 06: this website

`06-digital-print/` is filled automatically with screenshots of the site itself. They feed the "This is it" infinite zoom on the journey line and in that challenge's space. To retake them after the site changes:

```bash
npm run dev          # keep it running
npm run capture      # add the address if it isn't port 3000, e.g. npm run capture -- http://localhost:3001
npm run media
```

## Tips

- Export films from CapCut at **1080p, 30fps, MP4 (H.264)**. Don't worry about the file size.
- Team photos: **3:4 portrait, plain background, face centred**, the same set-up for everyone.
- YouTube and Instagram links go in `src/content/site.ts`, not here.
