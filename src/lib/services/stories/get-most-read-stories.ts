import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";

function publishedTime(story: StorySummary): number {
  return story.publishedAt ? Date.parse(story.publishedAt) : 0;
}

/**
 * Most-read published stories, ranked by view count (newest wins ties). Only
 * returns stories that actually have views, so this stays a genuine "what
 * others are reading" signal rather than a second recency feed when the site
 * has no traffic yet. Derived from the cached full list — no extra query.
 */
export async function getMostReadStories(
  limit = 3
): Promise<StorySummary[]> {
  const all = await getAllPublishedStories();

  return all
    .filter((story) => story.viewCount > 0)
    .sort(
      (a, b) =>
        b.viewCount - a.viewCount || publishedTime(b) - publishedTime(a)
    )
    .slice(0, limit);
}
