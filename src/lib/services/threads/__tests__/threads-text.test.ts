import { describe, expect, it } from "vitest";
import { buildThreadsText } from "../share-story";

describe("buildThreadsText", () => {
  it("returns the bare message when there is no link or hashtags", () => {
    expect(buildThreadsText("Hello")).toBe("Hello");
  });

  it("appends the link after the message on its own block", () => {
    expect(buildThreadsText("Hello", "https://x/story/s")).toBe(
      "Hello\n\nhttps://x/story/s"
    );
  });

  it("places hashtags before the link", () => {
    expect(buildThreadsText("Hello", "https://x/story/s", "#After2AM")).toBe(
      "Hello\n\n#After2AM\n\nhttps://x/story/s"
    );
  });

  it("truncates a long message but always preserves the link and hashtags", () => {
    const long = "a".repeat(600);
    const url = "https://after2amstories.com/story/some-slug";
    const tags = "#After2AM #Horror";
    const out = buildThreadsText(long, url, tags);
    expect(out.length).toBeLessThanOrEqual(500);
    expect(out.endsWith(`${tags}\n\n${url}`)).toBe(true);
    expect(out).toContain("…");
  });

  it("truncates with an ellipsis when only a long message is given", () => {
    const long = "b".repeat(600);
    const out = buildThreadsText(long);
    expect(out).toHaveLength(500);
    expect(out.endsWith("…")).toBe(true);
  });
});
