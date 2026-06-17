import { describe, expect, it } from "vitest";

import type { Story } from "@/lib/types";
import {
  CONTENT_SLIDE_CHAR_BUDGET,
  MAX_CAROUSEL_SLIDES,
  MAX_CONTENT_SLIDES,
  htmlToParagraphs,
  planCarouselSlides,
} from "../carousel-plan";

function makeStory(content: string): Story {
  return {
    id: "1",
    title: "T",
    slug: "s",
    hook: "H",
    excerpt: "E",
    content,
    mood: "DREAD" as Story["mood"],
    categories: [],
    tags: [],
    intensity: 3,
    readTime: 1,
    wordCount: 0,
    viewCount: 0,
  };
}

describe("htmlToParagraphs", () => {
  it("splits block tags into paragraphs and strips inline tags", () => {
    const html = "<p>One <em>two</em></p><p>three</p>";
    expect(htmlToParagraphs(html)).toEqual(["One two", "three"]);
  });

  it("decodes common entities and drops empties", () => {
    expect(htmlToParagraphs("<p>a &amp; b</p><p></p>")).toEqual(["a & b"]);
  });

  it("turns <br> into a break", () => {
    expect(htmlToParagraphs("<p>a<br>b</p>")).toEqual(["a", "b"]);
  });
});

describe("planCarouselSlides", () => {
  it("always brackets content with a cover and a CTA", () => {
    const slides = planCarouselSlides(makeStory("<p>short body</p>"));
    expect(slides[0]).toEqual({ kind: "cover" });
    expect(slides[slides.length - 1]).toEqual({ kind: "cta" });
    expect(slides.length).toBeGreaterThanOrEqual(2);
  });

  it("paginates content and numbers each page", () => {
    const para = "x".repeat(CONTENT_SLIDE_CHAR_BUDGET);
    const html = `<p>${para}</p><p>${para}</p>`;
    const slides = planCarouselSlides(makeStory(html));
    const content = slides.filter((s) => s.kind === "content");
    expect(content.length).toBe(2);
    expect(content).toEqual([
      { kind: "content", text: para, page: 1, pageCount: 2 },
      { kind: "content", text: para, page: 2, pageCount: 2 },
    ]);
  });

  it("never exceeds Instagram's slide limit", () => {
    const para = "<p>" + "y".repeat(CONTENT_SLIDE_CHAR_BUDGET) + "</p>";
    const slides = planCarouselSlides(makeStory(para.repeat(40)));
    expect(slides.length).toBeLessThanOrEqual(MAX_CAROUSEL_SLIDES);
    const content = slides.filter((s) => s.kind === "content");
    expect(content.length).toBe(MAX_CONTENT_SLIDES);
  });

  it("keeps each content slide within the char budget", () => {
    const html = Array.from(
      { length: 6 },
      (_, i) => `<p>Paragraph number ${i} with some words.</p>`
    ).join("");
    const slides = planCarouselSlides(makeStory(html));
    for (const slide of slides) {
      if (slide.kind === "content") {
        expect(slide.text.length).toBeLessThanOrEqual(
          CONTENT_SLIDE_CHAR_BUDGET
        );
      }
    }
  });

  it("falls back to a 2-slide carousel when there is no body", () => {
    const slides = planCarouselSlides(makeStory(""));
    expect(slides).toEqual([{ kind: "cover" }, { kind: "cta" }]);
  });
});
