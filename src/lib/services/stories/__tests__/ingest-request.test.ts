import { describe, expect, it } from "vitest";
import { parseIngestRequest } from "@/lib/services/stories/ingest-request";

const valid = {
  title: "The Light Left On",
  excerpt: "A short note about the hallway light at 3am.",
  hook: "Some lights you leave on for people who aren't coming back.",
  mood: "EMPTY",
  categories: ["ROMANCE"],
  tags: ["hallway", "insomnia", "memory"],
  intensity: 3,
  author: "Anon",
  htmlBody: "<p>The light was still on when I got up.</p>",
  readTime: 1,
  wordCount: 140,
  seo: {
    title: "The Light Left On",
    description:
      "A quiet after-2am note about the hallway light and who it was for.",
    keywords: ["hallway", "insomnia", "late night"],
  },
};

describe("parseIngestRequest", () => {
  it("accepts a valid night-writer payload and maps it to ingest input", () => {
    const result = parseIngestRequest(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input.title).toBe("The Light Left On");
    expect(result.input.categories).toEqual(["ROMANCE"]);
    expect(result.input.mood).toBe("EMPTY");
    expect(result.input.seo?.title).toBe("The Light Left On");
  });

  it("rejects an unknown mood with a 400-style error list", () => {
    const result = parseIngestRequest({ ...valid, mood: "NOT_A_MOOD" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(" ")).toMatch(/mood/i);
  });

  it("rejects a missing required field (title)", () => {
    const { title: _omit, ...withoutTitle } = valid;
    const result = parseIngestRequest(withoutTitle);
    expect(result.ok).toBe(false);
  });
});
