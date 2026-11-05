export type Credit = { text: string; href: string };

export type ImageMedia = {
  kind: "image";
  src: string;
  alt: string;
  caption?: string;
  w: number;
  h: number;
  /** For photos that aren't ours: photographer and licence, linked to the source. */
  credit?: Credit;
};

export type VideoMedia = {
  kind: "video";
  /** Short, muted loop used in grids, the pinboard and as a preview. */
  src: string;
  poster: string;
  alt: string;
  caption?: string;
  w: number;
  h: number;
  /** Optional long version (with sound) played in the cinema viewer. */
  full?: string;
  /** Optional YouTube URL. Shown as a link; if there is no `full` file the cinema embeds it. */
  youtube?: string;
  duration?: string;
};

export type Media = ImageMedia | VideoMedia;

export type Member = {
  slug: string;
  name: string;
  country: string;
  role: string;
  /** 4:5 photo. Used on the team stage and in the profile. */
  portrait: ImageMedia;
  /** Optional close-up video. When set, it plays inside the portrait frame instead of the photo. */
  clip?: VideoMedia;
  /** Stage colour behind this person, e.g. "#2a2a2a". Leave out to match the photo's own backdrop automatically. */
  bg?: string;
  interest: string;
  funFact: string;
  brings: string;
  pitch: string;
};

export type Link = { label: string; href: string };

export type Challenge = {
  n: number;
  slug: string;
  title: string;
  kicker: string;
  prompt: string;
  definition: string;
  did: string;
  cover: ImageMedia;
  media: Media[];
  links: Link[];
  /** Two colours used for this chapter's accents. */
  tint: [string, string];
};
