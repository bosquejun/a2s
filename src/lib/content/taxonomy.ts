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

export const CATEGORY_LABELS: Record<Category, string> = {
  HORROR: "Horror",
  CONFESSION: "Confession",
  ROMANCE: "Romance",
  EXISTENTIAL: "Existential",
  SURREAL: "Surreal",
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
