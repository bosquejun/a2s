import type { Mood } from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";

/** Stories shown per infinite-scroll batch on the stories hub. */
export const STORIES_PAGE_SIZE = 12;

export interface StoriesPage {
  stories: StorySummary[];
  /** Total matching stories (across all batches) for the active filter. */
  total: number;
}

/**
 * Returns one batch of published stories starting at `offset`, optionally
 * filtered by mood. Slices the cached full list, so paging is cheap and every
 * batch is served from the same `getAllPublishedStories` cache entry.
 */
export async function getPublishedStoriesPage(
  offset: number,
  mood?: Mood
): Promise<StoriesPage> {
  const all = await getAllPublishedStories();
  const filtered = mood ? all.filter((story) => story.mood === mood) : all;

  return {
    stories: filtered.slice(offset, offset + STORIES_PAGE_SIZE),
    total: filtered.length,
  };
}
