import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";
import {
  matchesStoryFilter,
  STORIES_PAGE_SIZE,
  type StoryFilter,
} from "./story-filter";

export {
  resolveStoryFilter,
  STORIES_PAGE_SIZE,
  type RawStoryFilter,
  type StoryFilter,
} from "./story-filter";

export interface StoriesPage {
  stories: StorySummary[];
  /** Total matching stories (across all batches) for the active filter. */
  total: number;
}

/**
 * Returns one batch of published stories starting at `offset`, optionally
 * filtered by mood, category, or tag. Slices the cached full list, so paging is
 * cheap and every batch is served from the same `getAllPublishedStories` cache.
 */
export async function getPublishedStoriesPage(
  offset: number,
  filter: StoryFilter = {}
): Promise<StoriesPage> {
  const all = await getAllPublishedStories();
  const filtered = all.filter((story) => matchesStoryFilter(story, filter));

  return {
    stories: filtered.slice(offset, offset + STORIES_PAGE_SIZE),
    total: filtered.length,
  };
}
