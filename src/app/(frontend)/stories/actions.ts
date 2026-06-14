"use server";

import {
  getPublishedStoriesPage,
  resolveStoryFilter,
  type RawStoryFilter,
  type StoriesPage,
} from "@/lib/services/stories/get-published-stories-page";

/**
 * Server action backing the infinite-scroll feed on /stories. Validates the
 * browse filter the same way the page does, then returns the next batch
 * starting at `offset`.
 */
export async function loadMoreStories(
  offset: number,
  filter?: RawStoryFilter
): Promise<StoriesPage> {
  return getPublishedStoriesPage(
    Math.max(0, offset),
    resolveStoryFilter(filter ?? {})
  );
}
