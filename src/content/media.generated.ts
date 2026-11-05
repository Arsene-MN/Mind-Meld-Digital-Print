// Written by `npm run media` from the files in /media-inbox. Don't edit by hand: re-run the command instead.
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
} = {
  "team": {
    "angeline": {
      "kind": "image",
      "src": "/media/team/angeline-95c1c66c.jpg",
      "w": 824,
      "h": 1080
    },
    "mike": {
      "kind": "image",
      "src": "/media/team/mike-976f627d.jpg",
      "w": 954,
      "h": 1280
    },
    "nadine": {
      "kind": "image",
      "src": "/media/team/nadine-d793f996.jpg",
      "w": 990,
      "h": 1280
    },
    "ineza": {
      "kind": "image",
      "src": "/media/team/ineza-d26da7ef.jpg",
      "w": 960,
      "h": 1280
    }
  },
  "challenges": {
    "introduction": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/01-introduction/the-five-of-us.jpg",
        "w": 2000,
        "h": 1127,
        "alt": "The five of us"
      },
      "media": [
        {
          "kind": "video",
          "src": "/media/challenges/01-introduction/elevator-pitches.mp4",
          "poster": "/media/challenges/01-introduction/elevator-pitches.jpg",
          "full": "/media/challenges/01-introduction/elevator-pitches-full.mp4",
          "w": 1920,
          "h": 1080,
          "duration": "2:43",
          "alt": "Elevator pitches",
          "caption": "Elevator pitches"
        },
        {
          "kind": "video",
          "src": "/media/challenges/01-introduction/bloopers.mp4",
          "poster": "/media/challenges/01-introduction/bloopers.jpg",
          "full": "/media/challenges/01-introduction/bloopers-full.mp4",
          "w": 1080,
          "h": 1920,
          "duration": "1:24",
          "alt": "Bloopers",
          "caption": "Bloopers"
        },
        {
          "kind": "image",
          "src": "/media/challenges/01-introduction/the-five-of-us.jpg",
          "w": 2000,
          "h": 1127,
          "alt": "The five of us",
          "caption": "The five of us"
        },
        {
          "kind": "image",
          "src": "/media/challenges/01-introduction/behind-the-scenes.jpg",
          "w": 1080,
          "h": 1878,
          "alt": "Behind the scenes",
          "caption": "Behind the scenes"
        },
        {
          "kind": "video",
          "src": "/media/challenges/01-introduction/one-pitch-at-a-time.mp4",
          "poster": "/media/challenges/01-introduction/one-pitch-at-a-time.jpg",
          "w": 1280,
          "h": 720,
          "duration": "0:15",
          "alt": "One pitch at a time",
          "caption": "One pitch at a time"
        }
      ]
    },
    "discover-africa": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/02-discover-africa/global-culture.jpg",
        "w": 2000,
        "h": 1127,
        "alt": "Global Culture"
      },
      "media": [
        {
          "kind": "video",
          "src": "/media/challenges/02-discover-africa/global-culture-the-broadcast.mp4",
          "poster": "/media/challenges/02-discover-africa/global-culture-the-broadcast.jpg",
          "full": "/media/challenges/02-discover-africa/global-culture-the-broadcast-full.mp4",
          "w": 1920,
          "h": 1080,
          "duration": "2:59",
          "alt": "Global Culture, the broadcast",
          "caption": "Global Culture, the broadcast"
        },
        {
          "kind": "video",
          "src": "/media/challenges/02-discover-africa/bloopers.mp4",
          "poster": "/media/challenges/02-discover-africa/bloopers.jpg",
          "full": "/media/challenges/02-discover-africa/bloopers-full.mp4",
          "w": 1080,
          "h": 1920,
          "duration": "1:52",
          "alt": "Bloopers",
          "caption": "Bloopers"
        },
        {
          "kind": "image",
          "src": "/media/challenges/02-discover-africa/global-culture.jpg",
          "w": 2000,
          "h": 1127,
          "alt": "Global Culture",
          "caption": "Global Culture"
        },
        {
          "kind": "image",
          "src": "/media/challenges/02-discover-africa/fail-counter.jpg",
          "w": 1112,
          "h": 1964,
          "alt": "Fail counter",
          "caption": "Fail counter"
        },
        {
          "kind": "video",
          "src": "/media/challenges/02-discover-africa/reporting-from-the-field.mp4",
          "poster": "/media/challenges/02-discover-africa/reporting-from-the-field.jpg",
          "w": 1280,
          "h": 720,
          "duration": "0:16",
          "alt": "Reporting from the field",
          "caption": "Reporting from the field"
        },
        {
          "kind": "image",
          "src": "/media/challenges/02-discover-africa/in-the-studio.jpg",
          "w": 1920,
          "h": 1080,
          "alt": "In the studio",
          "caption": "In the studio"
        }
      ]
    },
    "help-lab": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/03-help-lab/shopping-for-the-family.jpg",
        "w": 2000,
        "h": 1124,
        "alt": "Shopping for the family"
      },
      "media": [
        {
          "kind": "video",
          "src": "/media/challenges/03-help-lab/her-story.mp4",
          "poster": "/media/challenges/03-help-lab/her-story.jpg",
          "full": "/media/challenges/03-help-lab/her-story-full.mp4",
          "w": 1920,
          "h": 1080,
          "duration": "2:53",
          "alt": "Her Story",
          "caption": "Her Story"
        },
        {
          "kind": "video",
          "src": "/media/challenges/03-help-lab/our-reflections.mp4",
          "poster": "/media/challenges/03-help-lab/our-reflections.jpg",
          "w": 720,
          "h": 1280,
          "duration": "0:26",
          "alt": "Our reflections",
          "caption": "Our reflections"
        },
        {
          "kind": "image",
          "src": "/media/challenges/03-help-lab/shopping-for-the-family.jpg",
          "w": 2000,
          "h": 1124,
          "alt": "Shopping for the family",
          "caption": "Shopping for the family"
        },
        {
          "kind": "image",
          "src": "/media/challenges/03-help-lab/listening-to-her-story.jpg",
          "w": 1122,
          "h": 1892,
          "alt": "Listening to her story",
          "caption": "Listening to her story"
        },
        {
          "kind": "video",
          "src": "/media/challenges/03-help-lab/visiting-the-family.mp4",
          "poster": "/media/challenges/03-help-lab/visiting-the-family.jpg",
          "w": 1280,
          "h": 720,
          "duration": "0:16",
          "alt": "Visiting the family",
          "caption": "Visiting the family"
        }
      ]
    },
    "hunt-for-treasure": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/04-hunt-for-treasure/welcome-to-efiche.jpg",
        "w": 1920,
        "h": 1080,
        "alt": "Welcome to eFiche"
      },
      "media": [
        {
          "kind": "video",
          "src": "/media/challenges/04-hunt-for-treasure/the-efiche-interview.mp4",
          "poster": "/media/challenges/04-hunt-for-treasure/the-efiche-interview.jpg",
          "full": "/media/challenges/04-hunt-for-treasure/the-efiche-interview-full.mp4",
          "w": 1920,
          "h": 1080,
          "duration": "2:52",
          "alt": "The eFiche interview",
          "caption": "The eFiche interview"
        },
        {
          "kind": "image",
          "src": "/media/challenges/04-hunt-for-treasure/welcome-to-efiche.jpg",
          "w": 1920,
          "h": 1080,
          "alt": "Welcome to eFiche",
          "caption": "Welcome to eFiche"
        },
        {
          "kind": "image",
          "src": "/media/challenges/04-hunt-for-treasure/ziga-larissa-project-manager.jpg",
          "w": 2000,
          "h": 1126,
          "alt": "Ziga Larissa, Project Manager",
          "caption": "Ziga Larissa, Project Manager"
        },
        {
          "kind": "video",
          "src": "/media/challenges/04-hunt-for-treasure/in-conversation-with-efiche.mp4",
          "poster": "/media/challenges/04-hunt-for-treasure/in-conversation-with-efiche.jpg",
          "w": 720,
          "h": 1280,
          "duration": "0:26",
          "alt": "In conversation with eFiche",
          "caption": "In conversation with eFiche"
        },
        {
          "kind": "video",
          "src": "/media/challenges/04-hunt-for-treasure/what-we-learned.mp4",
          "poster": "/media/challenges/04-hunt-for-treasure/what-we-learned.jpg",
          "w": 1280,
          "h": 720,
          "duration": "0:19",
          "alt": "What we learned",
          "caption": "What we learned"
        },
        {
          "kind": "image",
          "src": "/media/challenges/04-hunt-for-treasure/on-set.jpg",
          "w": 1100,
          "h": 1964,
          "alt": "On set",
          "caption": "On set"
        }
      ]
    },
    "launch-your-mission": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/05-launch-your-mission/agaseke-kubuzima-the-pitch.jpg",
        "w": 2000,
        "h": 1127,
        "alt": "Agaseke k'Ubuzima, the pitch"
      },
      "media": [
        {
          "kind": "video",
          "src": "/media/challenges/05-launch-your-mission/the-grant-pitch.mp4",
          "poster": "/media/challenges/05-launch-your-mission/the-grant-pitch.jpg",
          "full": "/media/challenges/05-launch-your-mission/the-grant-pitch-full.mp4",
          "w": 1920,
          "h": 1080,
          "duration": "2:46",
          "alt": "The grant pitch",
          "caption": "The grant pitch"
        },
        {
          "kind": "image",
          "src": "/media/challenges/05-launch-your-mission/agaseke-kubuzima-the-pitch.jpg",
          "w": 2000,
          "h": 1127,
          "alt": "Agaseke k'Ubuzima, the pitch",
          "caption": "Agaseke k'Ubuzima, the pitch"
        },
        {
          "kind": "image",
          "src": "/media/challenges/05-launch-your-mission/research-what-families-now-pay.jpg",
          "w": 1104,
          "h": 1964,
          "alt": "Research, what families now pay",
          "caption": "Research, what families now pay"
        },
        {
          "kind": "video",
          "src": "/media/challenges/05-launch-your-mission/the-ussd-menu.mp4",
          "poster": "/media/challenges/05-launch-your-mission/the-ussd-menu.jpg",
          "w": 720,
          "h": 1280,
          "duration": "0:26",
          "alt": "The USSD menu",
          "caption": "The USSD menu"
        },
        {
          "kind": "image",
          "src": "/media/challenges/05-launch-your-mission/project-proposal.jpg",
          "w": 1920,
          "h": 1080,
          "alt": "Project proposal",
          "caption": "Project proposal"
        },
        {
          "kind": "image",
          "src": "/media/challenges/05-launch-your-mission/budget-for-the-grant.jpg",
          "w": 1920,
          "h": 1080,
          "alt": "Budget for the grant",
          "caption": "Budget for the grant"
        }
      ]
    },
    "digital-print": {
      "cover": {
        "kind": "image",
        "src": "/media/challenges/06-digital-print/the-hero.jpg",
        "w": 2000,
        "h": 1250,
        "alt": "The hero"
      },
      "media": [
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-hero.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The hero",
          "caption": "The hero"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-hero-opens-up.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The hero opens up",
          "caption": "The hero opens up"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/our-mission.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "Our mission",
          "caption": "Our mission"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/they-wait-they-borrow.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "They wait, they borrow",
          "caption": "They wait, they borrow"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-solution-side-by-side.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The solution, side by side",
          "caption": "The solution, side by side"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-ussd-prototype.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The USSD prototype",
          "caption": "The USSD prototype"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-team-stage.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The team stage",
          "caption": "The team stage"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-journey-line.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The journey line",
          "caption": "The journey line"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/a-challenge-space.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "A challenge space",
          "caption": "A challenge space"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/the-cinema.jpg",
          "w": 2000,
          "h": 1250,
          "alt": "The cinema",
          "caption": "The cinema"
        },
        {
          "kind": "image",
          "src": "/media/challenges/06-digital-print/on-a-phone.jpg",
          "w": 924,
          "h": 2000,
          "alt": "On a phone",
          "caption": "On a phone"
        }
      ]
    }
  },
  "hero": {
    "kind": "video",
    "src": "/media/hero/montage.mp4",
    "poster": "/media/hero/montage.jpg",
    "w": 1920,
    "h": 1080
  },
  "problem": [
    {
      "kind": "image",
      "src": "/media/problem/problem-01-a8529842.jpg",
      "w": 1440,
      "h": 1800
    },
    {
      "kind": "image",
      "src": "/media/problem/problem-02-b42d974b.jpg",
      "w": 1440,
      "h": 1800
    }
  ],
  "solution": [
    {
      "kind": "image",
      "src": "/media/solution/solution-01-2b06433d.jpg",
      "w": 1024,
      "h": 683
    },
    {
      "kind": "image",
      "src": "/media/solution/solution-02-ad141972.jpg",
      "w": 1800,
      "h": 1200
    },
    {
      "kind": "image",
      "src": "/media/solution/solution-03-cecc3e94.jpg",
      "w": 1050,
      "h": 601
    }
  ]
};
