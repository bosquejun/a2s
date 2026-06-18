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

  it("appends hashtags as a trailing block when provided", () => {
    const c = buildInstagramCaption(
      { hook: "H", title: "T" },
      "#After2AM #Horror"
    );
    expect(c).toBe(
      "H\n\nRead the full story — link in bio 🔗\n\n#After2AM #Horror"
    );
  });

  it("omits the hashtag block when empty", () => {
    expect(buildInstagramCaption({ hook: "H", title: "T" }, "")).toBe(
      "H\n\nRead the full story — link in bio 🔗"
    );
  });

  it("defaults to the link-in-bio CTA", () => {
    const c = buildInstagramCaption({ hook: "H", title: "T" }, undefined, {
      linkInComment: false,
    });
    expect(c).toBe("H\n\nRead the full story — link in bio 🔗");
  });

  it("points to the comments when the link is auto-commented", () => {
    const c = buildInstagramCaption({ hook: "H", title: "T" }, "#After2AM", {
      linkInComment: true,
    });
    expect(c).toBe(
      "H\n\nRead the full story — link in comments 👇\n\n#After2AM"
    );
  });
});
