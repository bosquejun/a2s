import { describe, expect, it } from "vitest";

import {
  COMMENT_DELAY_MAX_MS,
  COMMENT_DELAY_MIN_MS,
  buildEngagementComment,
  buildLinkComment,
  randomCommentDelayMs,
} from "../link-comment";

const URL = "https://after2amstories.com/story/s";

describe("buildLinkComment", () => {
  it("always includes the link, whichever variation is chosen", () => {
    // Walk every variation by sweeping the rng across the pool.
    for (let i = 0; i < 50; i++) {
      const text = buildLinkComment(URL, () => i / 50);
      expect(text).toContain(URL);
    }
  });

  it("varies the text across calls", () => {
    const a = buildLinkComment(URL, () => 0);
    const b = buildLinkComment(URL, () => 0.99);
    expect(a).not.toBe(b);
  });
});

describe("buildEngagementComment", () => {
  it("never contains a link", () => {
    for (let i = 0; i < 50; i++) {
      const text = buildEngagementComment(() => i / 50);
      expect(text).not.toMatch(/https?:\/\//);
    }
  });

  it("varies the text across calls", () => {
    expect(buildEngagementComment(() => 0)).not.toBe(
      buildEngagementComment(() => 0.99)
    );
  });
});

describe("randomCommentDelayMs", () => {
  it("stays within the configured 3–5s window", () => {
    expect(randomCommentDelayMs(() => 0)).toBe(COMMENT_DELAY_MIN_MS);
    expect(randomCommentDelayMs(() => 0.999999)).toBe(COMMENT_DELAY_MAX_MS);
    for (let i = 0; i < 100; i++) {
      const ms = randomCommentDelayMs();
      expect(ms).toBeGreaterThanOrEqual(COMMENT_DELAY_MIN_MS);
      expect(ms).toBeLessThanOrEqual(COMMENT_DELAY_MAX_MS);
    }
  });
});
