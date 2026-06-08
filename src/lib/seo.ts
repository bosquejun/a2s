/** Centralized site/SEO constants and helpers. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://after2amstories.com"
).replace(/\/$/, "");

export const SITE_NAME = "After 2AM Stories";
export const SITE_TAGLINE = "Midnight Whispers & Late Night Confessions";
export const SITE_DESCRIPTION =
  "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.";

export const SITE_KEYWORDS = [
  "after 2am",
  "stories",
  "horror",
  "confessions",
  "late night",
  "midnight tales",
  "storytelling",
  "nighttime stories",
];

/** Build an absolute URL from a path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
