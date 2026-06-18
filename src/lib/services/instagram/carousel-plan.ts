import type { Story } from "@/lib/types";

/**
 * Planning for the Instagram carousel post: a deterministic, pure mapping from a
 * story to an ordered list of slides. Both the image route (which renders one
 * slide) and the share flow (which builds the child-media URLs) call this so
 * they always agree on the slide count and order.
 *
 * Shape of a carousel:
 *   1. cover  — the story's OG hook card (slide 1)
 *   2..N-1    — the story text, paginated into readable chunks
 *   N         — a "read the full story" call-to-action
 */

/** Instagram allows 2–10 items in a carousel. */
export const MIN_CAROUSEL_SLIDES = 2;
export const MAX_CAROUSEL_SLIDES = 10;
/**
 * The body slides are a *teaser*, not the whole story: a few short, swipeable
 * cards that open the story and stop on a cliffhanger, so readers keep swiping
 * and tap through to the site. Keep the slide count low and the text per card
 * light — content past the cap is dropped (the CTA points to the full story).
 */
export const MAX_CONTENT_SLIDES = 4;
/** Rough character budget per content slide, tuned to the 1080² type sizes. */
export const CONTENT_SLIDE_CHAR_BUDGET = 240;

export type InstagramPostFormat = "image" | "carousel";

export type CarouselSlide =
  | { kind: "cover" }
  | { kind: "content"; text: string; page: number; pageCount: number }
  | { kind: "cta" };

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
};

/**
 * Flatten rendered story HTML into plain-text paragraphs: block-level tags
 * become paragraph breaks, every remaining tag is stripped, and a handful of
 * common entities are decoded. Empty paragraphs are dropped.
 */
export function htmlToParagraphs(html: string): string[] {
  if (!html) return [];
  const withBreaks = html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(
      /<\/(p|div|h[1-6]|li|blockquote|figcaption|section)\s*>/gi,
      "\n\n"
    );
  const text = withBreaks
    .replace(/<[^>]+>/g, "")
    .replace(
      /&#x?[0-9a-f]+;|&[a-z]+;/gi,
      (m) => ENTITIES[m.toLowerCase()] ?? " "
    );
  return text
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * Break a paragraph that overflows the budget into sentence-sized units,
 * hard-splitting any single sentence that is itself too long.
 */
function splitOversized(paragraph: string, budget: number): string[] {
  if (paragraph.length <= budget) return [paragraph];
  const sentences = paragraph.match(/[^.!?…]+[.!?…]*\s*/g) ?? [paragraph];
  const units: string[] = [];
  let cur = "";
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length > budget) {
      if (cur) {
        units.push(cur.trim());
        cur = "";
      }
      for (let i = 0; i < s.length; i += budget) {
        units.push(s.slice(i, i + budget).trim());
      }
      continue;
    }
    if (cur && (cur + " " + s).length > budget) {
      units.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? cur + " " + s : s;
    }
  }
  if (cur.trim()) units.push(cur.trim());
  return units;
}

/**
 * Pack paragraphs greedily into at most `maxChunks` content slides. Whole
 * paragraphs that share a slide keep their paragraph break (`\n\n`); a single
 * paragraph too long for one slide is split into space-joined sentence groups,
 * each its own slide, so sentences never get spurious blank lines between them.
 * Content past the cap is dropped — the CTA points readers to the full story.
 */
function packContent(
  paragraphs: string[],
  budget: number,
  maxChunks: number
): string[] {
  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur) {
      chunks.push(cur);
      cur = "";
    }
  };

  for (const paragraph of paragraphs) {
    if (chunks.length >= maxChunks) break;

    if (paragraph.length > budget) {
      flush();
      for (const piece of splitOversized(paragraph, budget)) {
        if (chunks.length >= maxChunks) break;
        chunks.push(piece);
      }
      continue;
    }

    const candidate = cur ? cur + "\n\n" + paragraph : paragraph;
    if (cur && candidate.length > budget) {
      flush();
      cur = paragraph;
    } else {
      cur = candidate;
    }
  }
  if (chunks.length < maxChunks) flush();
  return chunks.slice(0, maxChunks);
}

/** Build the ordered slide plan for a story's Instagram carousel. */
export function planCarouselSlides(story: Story): CarouselSlide[] {
  const paragraphs = htmlToParagraphs(story.content);
  const chunks = packContent(
    paragraphs,
    CONTENT_SLIDE_CHAR_BUDGET,
    MAX_CONTENT_SLIDES
  );
  const pageCount = chunks.length;
  const content: CarouselSlide[] = chunks.map((text, i) => ({
    kind: "content",
    text,
    page: i + 1,
    pageCount,
  }));
  return [{ kind: "cover" }, ...content, { kind: "cta" }];
}

/** Randomly choose a post format — used by the automated night-window routine. */
export function randomInstagramFormat(): InstagramPostFormat {
  return Math.random() < 0.5 ? "carousel" : "image";
}
