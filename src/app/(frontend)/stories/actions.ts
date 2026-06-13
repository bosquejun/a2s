"use server";

import { MOODS, type Mood } from "@/lib/content/taxonomy";
import {
  getPublishedStoriesPage,
  type StoriesPage,
} from "@/lib/services/stories/get-published-stories-page";

/**
 * Server action backing the infinite-scroll feed on /stories. Validates the
 * mood param the same way the page does, then returns the next batch starting
 * at `offset`.
 */
export async function loadMoreStories(
  offset: number,
  moodParam?: string
): Promise<StoriesPage> {
  const requested = moodParam?.toUpperCase() as Mood | undefined;
  const mood = requested && MOODS.includes(requested) ? requested : undefined;

  return getPublishedStoriesPage(Math.max(0, offset), mood);
}
