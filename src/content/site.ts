/**
 * Everything the site says lives in this file.
 *
 * Media: put raw files in /media-inbox and run `npm run media` (see
 * media-inbox/README.md). Whatever it processes replaces the placeholders
 * below automatically, via media.generated.ts.
 *
 * Search for TODO(team) to find every line that still needs real content.
 */
import type { Challenge, ImageMedia, Media, Member, VideoMedia } from "./types";
import { generated } from "./media.generated.ts";

const img = (src: string, w: number, h: number, alt: string, caption?: string): ImageMedia => ({
  kind: "image",
  src,
  w,
  h,
  alt,
  caption,
});

const vid = (
  base: string,
  w: number,
  h: number,
  alt: string,
  extra: Partial<VideoMedia> = {},
): VideoMedia => ({
  kind: "video",
  src: `${base}.mp4`,
  poster: `${base}.jpg`,
  w,
  h,
  alt,
  ...extra,
});


/** Swap a placeholder for the processed real file, keeping the placeholder's words where the real one has none. */
function real<T extends Media>(placeholder: T, processed?: Partial<Media>): T {
  if (!processed) return placeholder;
  const merged = { ...placeholder, ...processed } as T;
  merged.alt = processed.alt || placeholder.alt;
  merged.caption = processed.caption || placeholder.caption;
  return merged;
}

/** Each challenge's film on YouTube. Shown as a "Watch on YouTube" link on the journey, in the space and in the cinema. */
const youtube: Record<string, string> = {
  introduction: "https://youtu.be/u-K8a03hBZ8",
  "discover-africa": "https://youtu.be/1ttulsV8cTQ",
  "help-lab": "https://youtu.be/uCB1S-zCb24",
  "hunt-for-treasure": "https://youtu.be/ZQvoavHfRwA",
  "launch-your-mission": "https://youtu.be/yLGVBy0KwBQ",
};

const watchOnYouTube = (slug: string) => (youtube[slug] ? [{ label: "Watch on YouTube", href: youtube[slug] }] : []);

/** A challenge's processed media if there is any, otherwise its placeholders. */
function realMedia(slug: string, placeholders: Media[]): Media[] {
  const processed = generated.challenges?.[slug]?.media;
  if (!processed?.length) return placeholders;
  const firstFilm = processed.findIndex((m) => m.kind === "video" && m.full);
  return processed.map((m, i) => (i === firstFilm && youtube[slug] ? { ...m, youtube: youtube[slug] } : m));
}

export const site = {
  name: "Mind Meld",
  programme: "E-Lab",
  year: "2026",
  tagline: "Accessible, low-cost healthcare for the families who need it most.",
  mission:
    "Mobilize accessible, low-cost healthcare solutions for underprivileged Rwandan communities to build resilient, healthy and thriving societies.",
  heroClip: real(
    vid("/media/hero/montage", 1920, 1080, "Mind Meld team montage", { caption: "The think tank at work" }),
    generated.hero,
  ),
};

export const problem = {
  headline: "Enrolled is not the same as covered.",
  intro:
    "In Nyamagabe District, more than half of residents live in poverty. Most are enrolled in Mutuelle de Santé, Rwanda's community-based health insurance, yet low-income families still delay or skip care because of two gaps.",
  /** Shown as an animated row of figures. `value` counts up; the rest is static text. */
  stats: [
    { value: 51.4, decimals: 1, prefix: "", suffix: "%", label: "of Nyamagabe residents live in poverty", note: "27.4% nationally" },
    { value: 5000, decimals: 0, prefix: "Rwf ", suffix: "", label: "per person, per year, since July 2026", note: "up from Rwf 3,000 for households earning Rwf 30,000–60,000 a month" },
    { value: 47, decimals: 0, prefix: "", suffix: " km", label: "to the referral hospital, for some families", note: "where uncovered care is paid in cash" },
  ],
  source: "Poverty figures: NISR, EICV7 2023/24",
  gaps: [
    {
      title: "The lump sum",
      body: "The premium is paid as one annual lump sum for every member of the household, before anyone is covered. Since July 2026 it has risen from Rwf 3,000 to Rwf 5,000 per person for households earning Rwf 30,000–60,000 a month.",
      image: real({
        ...img("/media/problem/gap-01.jpg", 1536, 1920, "A Rwandan mother, her baby on her back, crossing a footbridge with her children", "Gap 01: paying for everyone, all at once"),
        credit: { text: "Photo: Muhirehussein12, CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Rwandan_filmy.jpg" },
      }, generated.problem?.[0]),
    },
    {
      title: "The uncovered cost",
      body: "Some treatments and medicines are not covered by Mutuelle de Santé, so families pay for them in cash, often after a long referral to a hospital up to 47 km away.",
      image: real({
        ...img("/media/problem/gap-02.jpg", 2189, 2736, "A pharmacist in a Kigali pharmacy, malaria medicines on the shelves behind him", "Gap 02: the cost the insurance leaves behind"),
        credit: {
          text: "Photo: Marshall Stowell / PSI, public domain",
          href: "https://commons.wikimedia.org/wiki/File:Pharmacist_with_PSI_products_Kigali,_Rwanda_Marshall_Stowell_PSI_(12835707974).jpg",
        },
      }, generated.problem?.[1]),
    },
  ],
  responses: ["They wait.", "They borrow.", "They sell what they own."],
  hmw: "How might we help 30 low-income households in Kaduha Sector (Nyamagabe District) stay continuously covered and get appropriate healthcare without new debt by December 2027?",
  ambition: "Starting in Kaduha. Built to grow across Rwanda, then Africa.",
};

export const solution = {
  name: "Agaseke k'Ubuzima",
  translation: "Health Basket",
  intro:
    "A health savings service run through ibimina, the community savings groups families already trust, with a simple USSD menu that works on any phone.",
  pillars: [
    {
      title: "Health basket",
      body: "Each family saves a little every week toward its yearly premium, in a locked account at a SACCO (Savings and Credit Cooperative). When the basket is full, the family is covered.",
      image: real(img("/media/solution/basket.jpg", 1400, 1000, "Woven baskets", "The basket fills a little every week"), generated.solution?.[0]),
    },
    {
      title: "Gap pot",
      body: "Each savings group shares a fund that pays for the treatments and medicines the insurance does not cover, so one emergency doesn't become a new debt.",
      image: real(img("/media/solution/gap-pot.jpg", 1400, 1000, "A community savings group meeting", "Ibimina already meet, save and trust each other"), generated.solution?.[1]),
    },
    {
      title: "USSD menu + SMS",
      body: "Families check their savings, deposit by mobile money and see when they are covered, with no smartphone and no internet. Just dial.",
      image: real(img("/media/solution/ussd.jpg", 1400, 1000, "A basic feature phone in someone's hand", "Any phone, no internet needed"), generated.solution?.[2]),
    },
  ],
};

export const prototype = {
  headline: "A health basket in every pocket.",
  body: "Our prototype is the USSD service at the heart of Agaseke k'Ubuzima. Try it on the phone: dial the code, then answer with the menu numbers, exactly as a family would on any basic phone.",
  // TODO(team): replace with your real short code once you have one.
  shortCode: "*775#",
  steps: ["Dial the short code", "Pick 1–4 from the menu", "Get an SMS for every saving"],
  // TODO(team): set to your exported Figma frame (e.g. "/media/prototype/figma.png") to show it instead of the live simulator.
  image: null as ImageMedia | null,
  // TODO(team): link to your Figma prototype.
  figma: null as string | null,
};

// TODO(team): Arsene and Ineza's roles are real; the other roles and every bio below are placeholders. Replace them.
export const team: Member[] = [
  {
    slug: "arsene",
    name: "Arsene Muvunyi",
    country: "Rwanda",
    role: "Editor",
    portrait: real(img("/media/team/arsene.jpg", 1086, 1448, "Portrait of Arsene Muvunyi"), generated.team?.arsene),
    interest: "Film, design and building things on the web.",
    funFact: "Can't watch a film without noticing the cuts.",
    brings: "Turns hours of raw footage and ideas into a story people actually finish watching.",
    pitch: "I'm Arsene from Rwanda. I edit, and I bring our think tank's work to life on screen.",
  },
  {
    slug: "ineza",
    name: "Ineza Celia",
    country: "Rwanda",
    role: "Team Lead",
    portrait: real(img("/media/team/ineza.jpg", 1200, 1600, "Portrait of Ineza Celia"), generated.team?.ineza),
    interest: "Public health and community leadership.",
    funFact: "Always has a plan B, and usually a plan C.",
    brings: "Keeps five people, six challenges and every deadline moving in the same direction.",
    pitch: "I'm Ineza from Rwanda. I lead Mind Meld and keep us focused on the people we're designing for.",
  },
  {
    slug: "mike",
    name: "Mike Banda",
    country: "Malawi",
    role: "Research & Strategy",
    portrait: real(img("/media/team/mike.jpg", 1200, 1600, "Portrait of Mike Banda"), generated.team?.mike),
    interest: "Economics, data and how systems really work.",
    funFact: "Reads the footnotes first.",
    brings: "Asks the question behind the question, and finds the evidence to answer it.",
    pitch: "I'm Mike from Malawi. I dig into the research so our ideas stand on solid ground.",
  },
  {
    slug: "angeline",
    name: "Angeline Uwamahoro",
    country: "Rwanda",
    role: "Community & Partnerships",
    portrait: real(img("/media/team/angeline.jpg", 1200, 1600, "Portrait of Angeline Uwamahoro"), generated.team?.angeline),
    interest: "People, conversations and community work.",
    funFact: "Can turn any stranger into a friend in five minutes.",
    brings: "Opens doors: interviews, community visits and the partners we learn from.",
    pitch: "I'm Angeline from Rwanda. I connect our think tank with the communities and partners behind our work.",
  },
  {
    slug: "nadine",
    name: "Nadine Uwase",
    country: "Rwanda",
    role: "Storytelling & Design",
    portrait: real(img("/media/team/nadine.jpg", 1200, 1600, "Portrait of Nadine Uwase"), generated.team?.nadine),
    interest: "Writing, visual design and photography.",
    funFact: "Has a camera roll that is 90% sunsets.",
    brings: "Shapes how our ideas look and sound, from slides to scripts.",
    pitch: "I'm Nadine from Rwanda. I make our ideas clear, beautiful and easy to share.",
  },
];

// TODO(team): replace with your real group statement from Challenge 1.
export const groupStatement =
  "We came to E-Lab as five people from two countries, and we are leaving as one think tank. We hope to learn how to turn concern into action: to listen to communities before designing for them, to test ideas cheaply and honestly, and to stay with a problem until it moves.";

const ch = (n: number, slug: string) => `/media/challenges/0${n}-${slug}`;

export const challenges: Challenge[] = [
  {
    n: 1,
    slug: "introduction",
    title: "Introduction",
    kicker: "Who are you? What drives you?",
    prompt:
      "Kick-start the E-Lab journey with a quick “Get to Know Me”: an elevator pitch from each member (name, country, interests, a fun fact, what you bring to the team) and a group statement on what we hope to gain from E-Lab.",
    definition:
      "Each of us recorded an elevator pitch, and together we wrote one statement about what we want E-Lab to change in us.",
    did: "Five pitches, two countries, one shared statement. The day Mind Meld became a team.",
    cover: real(img(`${ch(1, "introduction")}/cover.jpg`, 1600, 1000, "The Mind Meld team together"), generated.challenges?.["introduction"]?.cover),
    media: realMedia("introduction", [
      vid(`${ch(1, "introduction")}/pitches`, 1280, 720, "Our elevator pitches", { caption: "Elevator pitches", duration: "0:24", full: `${ch(1, "introduction")}/pitches-full.mp4` }),
      img(`${ch(1, "introduction")}/01.jpg`, 1200, 900, "First meeting", "First meeting"),
      img(`${ch(1, "introduction")}/02.jpg`, 900, 1200, "Planning the pitches", "Scripts on paper"),
      img(`${ch(1, "introduction")}/03.jpg`, 1200, 1200, "Group photo", "The five of us"),
      vid(`${ch(1, "introduction")}/bts`, 1280, 720, "Behind the scenes", { caption: "Behind the scenes" }),
      img(`${ch(1, "introduction")}/04.jpg`, 1600, 900, "Writing the group statement", "Writing the statement"),
    ]),
    links: watchOnYouTube("introduction"),
    tint: ["#3B5BF5", "#AFC0FF"],
  },
  {
    n: 2,
    slug: "discover-africa",
    title: "Discover Africa",
    kicker: "There is power in telling our own stories.",
    prompt:
      "Choose an African community and tell a story the world has not heard: its amazing facts, misconceptions, problems and uniqueness, using a creative media format like a news broadcast, podcast, radio show or vlog, with each member playing a role.",
    definition:
      "We produced Global Culture, a news broadcast on the Bo'di people of Ethiopia and their Ka'el festival: anchors in the studio, reporters in the field, and the facts, misconceptions and challenges behind the headlines.",
    did: "Every one of us had a role, from news anchor to field reporter. The bloopers prove it took a few takes.",
    cover: real(img(`${ch(2, "discover-africa")}/cover.jpg`, 1600, 1000, "Landscape of the Omo Valley"), generated.challenges?.["discover-africa"]?.cover),
    media: realMedia("discover-africa", [
      vid(`${ch(2, "discover-africa")}/story`, 1280, 720, "Our Bodi story", { caption: "The Bodi story", duration: "0:24", full: `${ch(2, "discover-africa")}/story-full.mp4` }),
      img(`${ch(2, "discover-africa")}/01.jpg`, 1200, 900, "Research board", "Research board"),
      img(`${ch(2, "discover-africa")}/02.jpg`, 900, 1200, "Recording set-up", "On set"),
      img(`${ch(2, "discover-africa")}/03.jpg`, 1600, 900, "Script read-through", "Read-through"),
      vid(`${ch(2, "discover-africa")}/bts`, 1280, 720, "Behind the scenes", { caption: "Behind the scenes" }),
    ]),
    links: watchOnYouTube("discover-africa"),
    tint: ["#8B3A1E", "#D98C3F"],
  },
  {
    n: 3,
    slug: "help-lab",
    title: "Help Lab",
    kicker: "Community engagement, in action.",
    prompt:
      "Choose a cause and add value to a community. Record everything, compile a 3-minute video with our reflections, and post it on YouTube and Instagram.",
    // TODO(team): written from the film. Check it matches what you did.
    definition:
      "We told Her Story: a young girl raising her younger siblings. We visited the family, shopped for what they needed and supported the siblings' school fees so they can stay in school, then each reflected on our contribution.",
    did: "Our first time moving from talking about impact to actually creating it.",
    cover: real(img(`${ch(3, "help-lab")}/cover.jpg`, 1600, 1000, "The team volunteering"), generated.challenges?.["help-lab"]?.cover),
    media: realMedia("help-lab", [
      vid(`${ch(3, "help-lab")}/film`, 1280, 720, "Help Lab film", { caption: "Help Lab: the 3-minute film", duration: "0:24", full: `${ch(3, "help-lab")}/film-full.mp4` }),
      img(`${ch(3, "help-lab")}/01.jpg`, 1200, 900, "On site", "On site"),
      img(`${ch(3, "help-lab")}/02.jpg`, 900, 1200, "Working together", "Hands on"),
      img(`${ch(3, "help-lab")}/03.jpg`, 1200, 1200, "With the community", "With the community"),
      vid(`${ch(3, "help-lab")}/moment`, 1280, 720, "A moment from the day", { caption: "A moment from the day" }),
      img(`${ch(3, "help-lab")}/04.jpg`, 1600, 900, "Reflection circle", "Reflections"),
    ]),
    links: watchOnYouTube("help-lab"),
    tint: ["#1F6F5C", "#9BD3B0"],
  },
  {
    n: 4,
    slug: "hunt-for-treasure",
    title: "Hunt for Treasure",
    kicker: "Learning from people already doing the work.",
    prompt:
      "Find a project, start-up or organisation working on our Grand Challenge and interview them: who they are, their mission, how and why they started, their daily operations, challenges, successes and future plans.",
    definition:
      "We visited eFiche, a Rwandan health-tech company building digital systems for health facilities, and interviewed Ziga Larissa, their Project Manager, about their mission, beginnings, operations, challenges and plans. Then we sat down as a team to unpack what we learned.",
    did: "What we learned from eFiche shaped how we think about technology that has to work in real clinics.",
    cover: real(img(`${ch(4, "hunt-for-treasure")}/cover.jpg`, 1600, 1000, "Interview with eFiche"), generated.challenges?.["hunt-for-treasure"]?.cover),
    media: realMedia("hunt-for-treasure", [
      vid(`${ch(4, "hunt-for-treasure")}/interview`, 1280, 720, "Interview with eFiche", { caption: "The eFiche interview", duration: "0:24", full: `${ch(4, "hunt-for-treasure")}/interview-full.mp4` }),
      img(`${ch(4, "hunt-for-treasure")}/01.jpg`, 1200, 900, "Preparing questions", "Preparing questions"),
      img(`${ch(4, "hunt-for-treasure")}/02.jpg`, 900, 1200, "At eFiche", "At eFiche"),
      img(`${ch(4, "hunt-for-treasure")}/03.jpg`, 1600, 900, "Interview set-up", "Set-up"),
      img(`${ch(4, "hunt-for-treasure")}/04.jpg`, 1200, 1200, "Notes from the interview", "Notes"),
    ]),
    links: watchOnYouTube("hunt-for-treasure"),
    tint: ["#1E3A8A", "#7FA7E6"],
  },
  {
    n: 5,
    slug: "launch-your-mission",
    title: "Launch your Mission",
    kicker: "A $10,000 grant is up for grabs.",
    prompt:
      "Launch the solution to the problem we identified: write a compelling grant application for a $10,000 grant, as a project proposal deck and a 3-minute video pitch covering who we are, the problem, the solution and why we need the money.",
    definition:
      "We pitched Agaseke k'Ubuzima live, slide by slide: who we are, the problem, what families told us, our solution and its USSD menu, and exactly how we would spend the $10,000.",
    did: "Our mission, our problem and our solution in one pitch, built to win a grant.",
    cover: real(img(`${ch(5, "launch-your-mission")}/cover.jpg`, 1600, 1000, "Pitching Agaseke k'Ubuzima"), generated.challenges?.["launch-your-mission"]?.cover),
    media: realMedia("launch-your-mission", [
      vid(`${ch(5, "launch-your-mission")}/pitch`, 1280, 720, "Our grant pitch", { caption: "The 3-minute pitch", duration: "0:24", full: `${ch(5, "launch-your-mission")}/pitch-full.mp4` }),
      img(`${ch(5, "launch-your-mission")}/deck-01.jpg`, 1600, 900, "Proposal deck: title", "Deck: title slide"),
      img(`${ch(5, "launch-your-mission")}/deck-02.jpg`, 1600, 900, "Proposal deck: the problem", "Deck: the problem"),
      img(`${ch(5, "launch-your-mission")}/deck-03.jpg`, 1600, 900, "Proposal deck: the solution", "Deck: the solution"),
      img(`${ch(5, "launch-your-mission")}/01.jpg`, 900, 1200, "Recording the pitch", "Recording"),
      vid(`${ch(5, "launch-your-mission")}/bts`, 1280, 720, "Behind the pitch", { caption: "Behind the pitch" }),
    ]),
    links: watchOnYouTube("launch-your-mission"),
    tint: ["#B4234A", "#F29CB0"],
  },
  {
    n: 6,
    slug: "digital-print",
    title: "Digital Print",
    kicker: "This website.",
    prompt:
      "Create a website that showcases our E-Lab journey, represents our think tank and the people in it, using images, videos and anything else.",
    definition:
      "The site you are on: our mission, problem, solution, prototype, team and all six challenges, in one place.",
    did: "Designed and built by Mind Meld. Every chapter of the journey, kept.",
    cover: real(img(`${ch(6, "digital-print")}/cover.jpg`, 1600, 1000, "The Mind Meld website"), generated.challenges?.["digital-print"]?.cover),
    media: realMedia("digital-print", [
      img(`${ch(6, "digital-print")}/01.jpg`, 1600, 900, "Early sketches", "Sketches"),
      img(`${ch(6, "digital-print")}/02.jpg`, 1600, 900, "Design exploration", "Design exploration"),
      vid(`${ch(6, "digital-print")}/process`, 1280, 720, "Building the site", { caption: "Building the site" }),
      img(`${ch(6, "digital-print")}/03.jpg`, 900, 1200, "Mobile layout", "Mobile"),
    ]),
    links: watchOnYouTube("digital-print"),
    tint: ["#11100E", "#3B5BF5"],
  },
];

/**
 * Screenshots of this very site, for Challenge 06's "this is it" loop.
 * Captured with `npm run capture`; until then, the challenge covers stand in.
 */
export const siteShots: string[] = (() => {
  const shots = (generated.challenges?.["digital-print"]?.media ?? []).filter((m) => m.kind === "image" && m.w > m.h).map((m) => m.src);
  return shots.length ? shots : challenges.slice(0, 5).map((c) => c.cover.src);
})();
