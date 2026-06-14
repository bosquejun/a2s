import { describe, expect, it } from "vitest";
import { tagToSlug } from "@/lib/content/tags";

describe("tagToSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(tagToSlug("Late Night")).toBe("late-night");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(tagToSlug("can't sleep!!")).toBe("can-t-sleep");
    expect(tagToSlug("ghosts & spirits")).toBe("ghosts-spirits");
  });

  it("trims leading/trailing separators and whitespace", () => {
    expect(tagToSlug("  #insomnia  ")).toBe("insomnia");
  });

  it("maps tags that differ only by case/spacing to the same slug", () => {
    expect(tagToSlug("Lost Love")).toBe(tagToSlug("lost  love"));
  });

  it("returns an empty string for separator-only input", () => {
    expect(tagToSlug("  --  ")).toBe("");
  });
});
