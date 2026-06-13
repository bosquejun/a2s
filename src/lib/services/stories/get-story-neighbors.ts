import type { Category, Mood } from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";

/** How many "more like this" cards to surface under a story. */
const RELATED_LIMIT = 3;

/** Similarity weights — categories matter most, then mood, then tags. */
const SCORE_SAME_CATEGORY = 3;
const SCORE_SAME_MOOD = 2;
const SCORE_SHARED_TAG = 1;

export interface StoryNeighbors {
  /** Up to RELATED_LIMIT stories ranked by similarity (never the current one). */
  related: StorySummary[];
  /** Deterministic next story in the same mood (wraps), for linear reading. */
  next: StorySummary | null;
}

function publishedTime(story: StorySummary): number {
  return story.publishedAt ? Date.parse(story.publishedAt) : 0;
}

/**
 * Computes related stories and the next-to-read neighbor for a story detail
 * page. Works off the cached full published list, so no extra DB round-trips —
 * scoring and ordering happen in memory.
 */
export async function getStoryNeighbors(
  slug: string,
  mood: Mood,
  categories: Category[],
  tags: string[]
): Promise<StoryNeighbors> {
  const all = await getAllPublishedStories();
  const others = all.filter((story) => story.slug !== slug);

  const categorySet = new Set(categories);
  const tagSet = new Set(tags);

  const ranked = others
    .map((story) => {
      let score = story.mood === mood ? SCORE_SAME_MOOD : 0;
      for (const category of story.categories) {
        if (categorySet.has(category)) score += SCORE_SAME_CATEGORY;
      }
      for (const tag of story.tags) {
        if (tagSet.has(tag)) score += SCORE_SHARED_TAG;
      }
      return { story, score };
    })
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : publishedTime(b.story) - publishedTime(a.story)
    );

  // Prefer genuinely similar stories; backfill with the newest others so the
  // section is never empty when there are at least a few stories.
  const related: StorySummary[] = [];
  for (const { story, score } of ranked) {
    if (related.length >= RELATED_LIMIT) break;
    if (score > 0) related.push(story);
  }
  if (related.length < RELATED_LIMIT) {
    for (const { story } of ranked) {
      if (related.length >= RELATED_LIMIT) break;
      if (!related.includes(story)) related.push(story);
    }
  }

  // `all` is already sorted newest-first; step forward within the same mood and
  // wrap, so "Next story" keeps the reader moving without dead ends.
  const moodList = all.filter((story) => story.mood === mood);
  const moodIndex = moodList.findIndex((story) => story.slug === slug);

  let next: StorySummary | null = null;
  if (moodList.length > 1 && moodIndex !== -1) {
    next = moodList[(moodIndex + 1) % moodList.length];
  } else {
    const globalIndex = all.findIndex((story) => story.slug === slug);
    if (all.length > 1 && globalIndex !== -1) {
      next = all[(globalIndex + 1) % all.length];
    }
  }

  return { related, next };
}
