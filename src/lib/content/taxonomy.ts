/**
 * Canonical content taxonomy for After 2AM Stories.
 *
 * These used to live as Prisma enums in the generated client. Payload now owns
 * the database, so the fixed taxonomies (mood, category, status) are defined
 * here as plain TypeScript and reused by both Payload collection configs and
 * the app/AI layer.
 */

export const MOODS = [
  "CANT_SLEEP",
  "DARK",
  "MISS_SOMEONE",
  "EMPTY",
  "REFLECTIVE",
  "UNSETTLING",
] as const;

export type Mood = (typeof MOODS)[number];
export const Mood = Object.fromEntries(MOODS.map((m) => [m, m])) as {
  [K in Mood]: K;
};

export const CATEGORIES = [
  "HORROR",
  "CONFESSION",
  "ROMANCE",
  "EXISTENTIAL",
  "SURREAL",
  "WORKPLACE",
  "DESIRE",
  "SPITE",
  "TIES",
] as const;

export type Category = (typeof CATEGORIES)[number];
export const Category = Object.fromEntries(
  CATEGORIES.map((c) => [c, c])
) as { [K in Category]: K };

export const STORY_STATUSES = [
  "PENDING",
  "REJECTED",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type Status = (typeof STORY_STATUSES)[number];
export const Status = Object.fromEntries(
  STORY_STATUSES.map((s) => [s, s])
) as { [K in Status]: K };

export const STORY_REQUEST_STATUSES = [
  "PENDING",
  "REJECTED",
  "APPROVED",
  "FAILED",
] as const;
export type StoryRequestStatus = (typeof STORY_REQUEST_STATUSES)[number];
export const StoryRequestStatus = Object.fromEntries(
  STORY_REQUEST_STATUSES.map((s) => [s, s])
) as { [K in StoryRequestStatus]: K };

/** Human-facing copy used on the landing page and mood routes. */
export const MOOD_LABELS: Record<Mood, string> = {
  CANT_SLEEP: "I can't sleep",
  DARK: "I want something dark",
  MISS_SOMEONE: "I miss someone",
  EMPTY: "I feel empty",
  REFLECTIVE: "I feel reflective",
  UNSETTLING: "I feel uneasy",
};

/** Whispered subtitles paired with each mood across the site. */
export const MOOD_WHISPERS: Record<Mood, string> = {
  CANT_SLEEP: "for the restless",
  DARK: "for the curious",
  MISS_SOMEONE: "for the longing",
  EMPTY: "for the hollow",
  REFLECTIVE: "for the quiet",
  UNSETTLING: "for the unsettled",
};

/** Longer descriptions for mood archive pages and their metadata. */
export const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  CANT_SLEEP:
    "Stories for the restless - the ones you read when sleep will not come.",
  DARK: "Dark, haunting narratives for when you want something with teeth.",
  MISS_SOMEONE:
    "Stories about absence and longing, for the nights someone is missing.",
  EMPTY: "Quiet, hollow stories for when you feel like an empty room.",
  REFLECTIVE:
    "Thoughtful, slow stories for when the night turns you inward.",
  UNSETTLING: "Eerie, uneasy stories that sit just under the skin.",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  HORROR: "Horror",
  CONFESSION: "Confession",
  ROMANCE: "Romance",
  EXISTENTIAL: "Existential",
  SURREAL: "Surreal",
  WORKPLACE: "Workplace",
  DESIRE: "Desire",
  SPITE: "Spite",
  TIES: "Ties",
};

/** Whispered subtitles paired with each category on its archive page. */
export const CATEGORY_TAGLINES: Record<Category, string> = {
  HORROR: "for the brave",
  CONFESSION: "for the honest",
  ROMANCE: "for the tender",
  EXISTENTIAL: "for the searching",
  SURREAL: "for the dreaming",
  WORKPLACE: "for the clocked-in",
  DESIRE: "for the wanting",
  SPITE: "for the unforgiving",
  TIES: "for the bonded",
};

/** Longer descriptions for category archive pages and their metadata. */
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  HORROR:
    "Dark, haunting narratives with teeth — for the nights you want to be scared.",
  CONFESSION:
    "Secrets told to the dark — the things people only admit after 2am.",
  ROMANCE:
    "Love, longing, and the people we can't put down — tender and aching.",
  EXISTENTIAL:
    "Slow, searching stories about meaning, time, and feeling small at night.",
  SURREAL:
    "Dreamlike, off-kilter tales where the ordinary rules of the night bend.",
  WORKPLACE:
    "Office confessions and the quiet wars of work — the things we only admit once the building's empty.",
  DESIRE:
    "Charged, kept-awake-by-someone stories — longing and tension drawn out, suggested, never spelled out.",
  SPITE:
    "Grudges, pettiness, and the unhinged little revenge fantasies that only surface long after midnight.",
  TIES:
    "Family, old friends, and the people we grew apart from — the bonds that aren't romance but still keep us up.",
};

/** Intensity scale shared by the writer/editor agents and the admin UI. */
export const INTENSITY_LABELS: Record<number, string> = {
  1: "cozy / calming",
  2: "melancholic",
  3: "emotionally heavy but grounded",
  4: "unsettling",
  5: "intense but non-graphic",
};

/** Build Payload `select` option arrays from a label map. */
export const toSelectOptions = <T extends string>(
  labels: Record<T, string>
): { label: string; value: T }[] =>
  (Object.keys(labels) as T[]).map((value) => ({
    label: labels[value],
    value,
  }));
