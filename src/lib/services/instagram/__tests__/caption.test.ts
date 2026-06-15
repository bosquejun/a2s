import { describe, expect, it } from "vitest";
import { buildInstagramCaption } from "../share-story";

describe("buildInstagramCaption", () => {
  it("prefers the hook and appends the link-in-bio line", () => {
    const c = buildInstagramCaption({ hook: "H", excerpt: "E", title: "T" });
    expect(c).toBe("H\n\nRead the full story — link in bio 🔗");
  });

  it("falls back to excerpt, then title", () => {
    expect(buildInstagramCaption({ excerpt: "E", title: "T" })).toContain("E\n\n");
    expect(buildInstagramCaption({ title: "T" })).toContain("T\n\n");
  });
});
