# Team photos: how to match

Every portrait on the Team stage blends into a room painted the colour of its own backdrop. It only looks seamless if all five photos are framed the same way. Send your teammates **[`team-photo-guide.jpg`](team-photo-guide.jpg)** together with the message below.

---

## Message for the team (copy and paste)

> Hey! For the Mind Meld website I need one portrait photo from each of you, matching Arsene's (guide image attached):
>
> **Framing:** portrait 3:4, head and shoulders, face centred. Top of your hair about 16% from the top, eyes about 43% down, chin about 75% down, shoulders running off the bottom edge. Your head should be about half the photo's width.
>
> **Background:** plain dark charcoal grey, with nothing behind you (no room, no wall details, not outdoors).
>
> **Light:** soft and even from the front. Stand facing a window, with no harsh shadows.
>
> **You:** plain black crew-neck t-shirt, no logos. Look straight at the camera, shoulders square, neutral face, mouth closed.
>
> **Camera:** have someone take it with the back camera at 1×, phone at your eye level, about 1 m away, focused on your eyes. Send the original file, not a screenshot or a WhatsApp-compressed version (send it "as a document").
>
> No dark wall? Take it anywhere plain and use the AI prompt below to swap the background.

---

## AI prompt (only to fix the background, lighting or framing)

Use it with ChatGPT, Gemini or any image editor that edits an uploaded photo. Upload your own photo plus `team-photo-guide.jpg` as the reference.

```
Edit my uploaded photo into a studio headshot that matches the attached reference.

Keep my face exactly as it is: same facial features, skin tone, hair, eyes and expression. Do not beautify, slim, smooth or change my identity in any way.

Background: replace it with a plain, smooth, dark charcoal grey studio backdrop (#222120), very slightly darker toward the corners. Nothing else behind me.
Lighting: soft, even studio light from the front, no harsh shadows, natural colours.
Clothing: plain black crew-neck t-shirt with no logo (keep mine if it already is).
Framing: portrait 3:4, at least 1080 × 1440 pixels. Head and shoulders, face centred left to right. Top of the hair about 16% from the top edge, eyes at about 43% of the height, chin at about 75%, shoulders running off the bottom edge. Head about half the image width.
Pose: looking straight into the camera, shoulders square, neutral relaxed expression, mouth closed.
Output a realistic photograph with sharp focus: no illustration, no text, no watermark, no added accessories.
```

**Before sending it, check:** does it still look exactly like you? AI editors sometimes change faces slightly (smoother skin, different eyes or nose). If it does, try again or use the real photo. A real photo with a slightly different background is better than a face that isn't quite yours, because the site adjusts to each photo's background colour anyway.

---

## When you receive them

1. Save each photo as the person's first name: `ineza.jpg`, `mike.jpg`, `angeline.jpg`, `nadine.jpg` (`.heic` and `.png` are fine too).
2. Put them in `media-inbox/team/`.
3. Run `npm run media`.

Each one goes on the site straight away, with the stage colour matched to its background.
