import { describe, expect, it } from "vitest";
import {
  normalizeStory,
  normalizeStorySummary,
  type StoryDoc,
} from "@/lib/content/normalize";

const baseDoc: StoryDoc = {
  id: 1,
  title: "The Hallway Light",
  slug: "the-hallway-light",
  mood: "EMPTY",
};

describe("normalize viewCount", () => {
  it("maps viewCount onto the full Story shape", () => {
    const story = normalizeStory({ ...baseDoc, viewCount: 42 });
    expect(story.viewCount).toBe(42);
  });

  it("maps viewCount onto the summary shape", () => {
    const summary = normalizeStorySummary({ ...baseDoc, viewCount: 7 });
    expect(summary.viewCount).toBe(7);
  });

  it("defaults viewCount to 0 when absent or null", () => {
    expect(normalizeStory(baseDoc).viewCount).toBe(0);
    expect(normalizeStory({ ...baseDoc, viewCount: null }).viewCount).toBe(0);
    expect(normalizeStorySummary(baseDoc).viewCount).toBe(0);
  });
});
