import { describe, expect, it } from "vitest";
import { resolveStoryFilter } from "@/lib/services/stories/story-filter";

describe("resolveStoryFilter", () => {
  it("validates and uppercases a known mood", () => {
    expect(resolveStoryFilter({ mood: "dark" })).toEqual({ mood: "DARK" });
  });

  it("validates and uppercases a known category", () => {
    expect(resolveStoryFilter({ category: "horror" })).toEqual({
      category: "HORROR",
    });
  });

  it("keeps a trimmed tag as-is", () => {
    expect(resolveStoryFilter({ tag: "  insomnia  " })).toEqual({
      tag: "insomnia",
    });
  });

  it("drops unknown moods and categories", () => {
    expect(resolveStoryFilter({ mood: "happy" })).toEqual({});
    expect(resolveStoryFilter({ category: "comedy" })).toEqual({});
  });

  it("applies precedence tag > category > mood", () => {
    expect(
      resolveStoryFilter({ tag: "ghosts", category: "horror", mood: "dark" })
    ).toEqual({ tag: "ghosts" });
    expect(resolveStoryFilter({ category: "horror", mood: "dark" })).toEqual({
      category: "HORROR",
    });
  });

  it("returns an empty filter when nothing valid is provided", () => {
    expect(resolveStoryFilter({})).toEqual({});
    expect(resolveStoryFilter({ tag: "   " })).toEqual({});
  });
});
