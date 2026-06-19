import "server-only";

/**
 * Shared helpers for the auto-posted "link in first comment" feature so every
 * platform reads like a person, not a bot:
 *
 *  - the comment text is picked at random from a pool of variations on each
 *    share, instead of one fixed line that looks templated when readers scroll
 *    a feed of several posts; and
 *  - a short, randomised pause separates the post from its first comment, since
 *    a comment that lands the same instant as the post is an obvious tell that
 *    an automation made both.
 */

/**
 * Variations for the comment that carries the story link (Facebook, Instagram).
 * Each must include `${url}` so the link is always present whichever line is
 * chosen. The link is placed on its own line where it reads better.
 */
const LINK_COMMENT_TEMPLATES: ((url: string) => string)[] = [
  (url) => `👇 Full story here:\n${url}`,
  (url) => `Read the full story 👉 ${url}`,
  (url) => `Save this for later! 🔖\n${url}`,
  (url) => `The rest of the story is waiting for you 🌙\n${url}`,
  (url) => `Couldn't stop reading — here's the full thing 👉 ${url}`,
  (url) => `Dive into the full story 📖\n${url}`,
  (url) => `You'll want to read this one all the way through 👇\n${url}`,
  (url) => `Read it all here 🖤\n${url}`,
];

/**
 * Variations for an engagement reply on platforms where the link already lives
 * in the post body (X, Threads), so the reply nudges interaction rather than
 * repeating the link.
 */
const ENGAGEMENT_COMMENT_TEMPLATES: string[] = [
  "Save this for later! 🔖",
  "👇 Drop your thoughts below.",
  "Which part stayed with you? 👀",
  "Best read after 2am. 🌙",
  "Tag someone who needs this tonight.",
  "Read it twice — it hits different. 🖤",
  "What would you have done? 👀",
];

function pick<T>(items: readonly T[], rng: () => number = Math.random): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * A varied, human-looking comment that carries the story link. Pass a custom
 * `rng` only in tests; production always uses `Math.random`.
 */
export function buildLinkComment(url: string, rng?: () => number): string {
  return pick(LINK_COMMENT_TEMPLATES, rng)(url);
}

/**
 * A varied engagement reply with no link, for platforms whose post body already
 * contains the clickable link.
 */
export function buildEngagementComment(rng?: () => number): string {
  return pick(ENGAGEMENT_COMMENT_TEMPLATES, rng);
}

/** Lower/upper bound (inclusive) for the post→comment pause, in milliseconds. */
export const COMMENT_DELAY_MIN_MS = 3000;
export const COMMENT_DELAY_MAX_MS = 5000;

/**
 * A randomised delay between {@link COMMENT_DELAY_MIN_MS} and
 * {@link COMMENT_DELAY_MAX_MS} so the first comment doesn't land the same
 * instant as the post.
 */
export function randomCommentDelayMs(rng: () => number = Math.random): number {
  const span = COMMENT_DELAY_MAX_MS - COMMENT_DELAY_MIN_MS;
  return COMMENT_DELAY_MIN_MS + Math.floor(rng() * (span + 1));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sleep for a randomised post→comment delay. */
export function waitBeforeComment(): Promise<void> {
  return sleep(randomCommentDelayMs());
}
