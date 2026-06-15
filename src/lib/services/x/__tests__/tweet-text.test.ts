import { describe, expect, it } from "vitest";
import { buildTweetText } from "../share-story";

describe("buildTweetText", () => {
  it("appends the story link after the message", () => {
    expect(buildTweetText("Hello", "https://x/story/s")).toBe(
      "Hello https://x/story/s"
    );
  });

  it("returns the bare message when there is no link", () => {
    expect(buildTweetText("Hello")).toBe("Hello");
  });

  it("truncates a long message with an ellipsis when no link is present", () => {
    const long = "a".repeat(300);
    const out = buildTweetText(long);
    expect(out.length).toBe(280);
    expect(out.endsWith("…")).toBe(true);
  });

  it("reserves room for the t.co-wrapped link and stays within the limit", () => {
    const long = "b".repeat(300);
    const url = "https://after2amstories.com/story/some-very-long-slug";
    const out = buildTweetText(long, url);
    // message is truncated (…), then a space, then the (untruncated) url.
    expect(out.endsWith(`… ${url}`)).toBe(true);
    // Reserved budget: 280 - 23 (t.co) - 1 (space) = 256 chars for the message.
    expect(out.slice(0, out.indexOf(" "))).toHaveLength(256);
  });
});
