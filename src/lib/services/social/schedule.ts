/**
 * Timing helpers that make automated social posting read like a real person
 * posting in the small hours rather than a bot firing a whole batch at once.
 *
 * The "After 2AM" night window is wall-clock 2:00–4:00 in the Philippines
 * (Asia/Manila). Manila is a fixed UTC+8 offset with no daylight saving, so we
 * can do the math with a constant offset instead of a full tz database.
 */

/** Asia/Manila is a fixed UTC+8 offset (no DST). */
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Manila wall-clock bounds of the nightly posting window. */
export const NIGHT_WINDOW_START_HOUR = 2;
export const NIGHT_WINDOW_END_HOUR = 4;

/**
 * Largest delay applied to a manually-published story before it auto-posts.
 * Small enough to still feel "right away", large enough to de-synchronise a
 * handful of stories published together.
 */
export const MANUAL_MAX_JITTER_MS = 10_000;

/** The UTC instant of Manila 00:00 on the Manila calendar date of `now`. */
function manilaMidnightUTC(now: Date): number {
  const manila = new Date(now.getTime() + MANILA_OFFSET_MS);
  const y = manila.getUTCFullYear();
  const mo = manila.getUTCMonth();
  const d = manila.getUTCDate();
  return Date.UTC(y, mo, d, 0, 0, 0, 0) - MANILA_OFFSET_MS;
}

/**
 * Pick a single, human-uneven instant inside the next 2:00–4:00 (Asia/Manila)
 * window. If we are already inside today's window the slot is drawn from the
 * remaining time; once the window has closed for the day we target tomorrow's.
 *
 * `rand` is injectable so callers can test the bounds deterministically.
 */
export function nextNightWindowPostAt(
  now: Date = new Date(),
  rand: () => number = Math.random
): Date {
  let midnight = manilaMidnightUTC(now);
  let windowStart = midnight + NIGHT_WINDOW_START_HOUR * HOUR_MS;
  let windowEnd = midnight + NIGHT_WINDOW_END_HOUR * HOUR_MS;

  // Today's window has already closed → roll to tomorrow's.
  if (now.getTime() >= windowEnd) {
    midnight += DAY_MS;
    windowStart = midnight + NIGHT_WINDOW_START_HOUR * HOUR_MS;
    windowEnd = midnight + NIGHT_WINDOW_END_HOUR * HOUR_MS;
  }

  // Never schedule in the past: if we're mid-window, draw from now onward.
  const lower = Math.max(windowStart, now.getTime());
  const span = Math.max(0, windowEnd - lower);
  return new Date(lower + rand() * span);
}

/** A small random delay (ms) used to stagger manual, post-now publishes. */
export function jitterDelayMs(rand: () => number = Math.random): number {
  return Math.floor(rand() * MANUAL_MAX_JITTER_MS);
}
