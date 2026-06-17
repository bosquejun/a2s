import { describe, expect, it } from "vitest";

import {
  jitterDelayMs,
  MANUAL_MAX_JITTER_MS,
  nextNightWindowPostAt,
  NIGHT_WINDOW_END_HOUR,
  NIGHT_WINDOW_START_HOUR,
} from "../schedule";

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Build a UTC instant for a given Manila wall-clock time. */
function manila(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - MANILA_OFFSET_MS);
}

/** Manila wall-clock hour (fractional) of a UTC instant. */
function manilaHour(date: Date): number {
  const m = new Date(date.getTime() + MANILA_OFFSET_MS);
  return m.getUTCHours() + m.getUTCMinutes() / 60 + m.getUTCSeconds() / 3600;
}

describe("nextNightWindowPostAt", () => {
  it("lands inside the 2–4am Manila window when published before it", () => {
    const now = manila(2026, 6, 17, 0, 30); // 00:30 Manila
    for (const r of [0, 0.25, 0.5, 0.99]) {
      const at = nextNightWindowPostAt(now, () => r);
      expect(manilaHour(at)).toBeGreaterThanOrEqual(NIGHT_WINDOW_START_HOUR);
      expect(manilaHour(at)).toBeLessThan(NIGHT_WINDOW_END_HOUR);
      // Same Manila calendar day as `now`.
      expect(at.getTime()).toBeGreaterThanOrEqual(now.getTime());
      expect(at.getTime()).toBeLessThan(now.getTime() + 24 * HOUR_MS);
    }
  });

  it("never schedules in the past when already mid-window", () => {
    const now = manila(2026, 6, 17, 3, 0); // 03:00, inside the window
    const at = nextNightWindowPostAt(now, () => 0); // earliest possible slot
    expect(at.getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(manilaHour(at)).toBeLessThan(NIGHT_WINDOW_END_HOUR);
  });

  it("rolls to tomorrow once the window has closed", () => {
    const now = manila(2026, 6, 17, 10, 0); // 10:00 Manila, window passed
    const at = nextNightWindowPostAt(now, () => 0.5);
    expect(manilaHour(at)).toBeGreaterThanOrEqual(NIGHT_WINDOW_START_HOUR);
    expect(manilaHour(at)).toBeLessThan(NIGHT_WINDOW_END_HOUR);
    // Tomorrow's window: between ~16h and ~18h after now.
    const deltaH = (at.getTime() - now.getTime()) / HOUR_MS;
    expect(deltaH).toBeGreaterThan(15);
    expect(deltaH).toBeLessThan(19);
  });

  it("spreads a batch across the window for different random draws", () => {
    const now = manila(2026, 6, 17, 1, 0);
    const a = nextNightWindowPostAt(now, () => 0.1).getTime();
    const b = nextNightWindowPostAt(now, () => 0.9).getTime();
    expect(b).toBeGreaterThan(a);
  });
});

describe("jitterDelayMs", () => {
  it("stays within the manual jitter bound", () => {
    expect(jitterDelayMs(() => 0)).toBe(0);
    expect(jitterDelayMs(() => 0.999999)).toBeLessThan(MANUAL_MAX_JITTER_MS);
    expect(jitterDelayMs(() => 0.5)).toBe(Math.floor(0.5 * MANUAL_MAX_JITTER_MS));
  });
});
