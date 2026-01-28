"use cache";

import { cacheLife, cacheTag } from "next/cache";
import type { After2AmStory, Mood } from "./types";
import { STORIES } from "./data";

/**
 * Cached story data fetching with Next.js 16 Cache Components.
 * Uses 'use cache' directive for cross-request caching.
 */

// Cache stories for 1 hour, revalidate every 2 hours
export async function getCachedStoryById(
  id: string,
): Promise<After2AmStory | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("stories", `story-${id}`);

  return STORIES.find((story) => story.id === id);
}

export async function getCachedStoriesForMood(
  baseMood: Mood,
): Promise<After2AmStory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("stories", `mood-${baseMood}`);

  if (baseMood === "Eerie") {
    return STORIES;
  }

  return STORIES.filter(
    (story) => story.mood === baseMood || story.mood === "Confessional",
  );
}

export async function getCachedRandomStoryForMood(
  baseMood: Mood,
): Promise<After2AmStory> {
  "use cache";
  cacheLife("hours");
  cacheTag("stories", `mood-${baseMood}`);

  const options = await getCachedStoriesForMood(baseMood);
  const list = options.length > 0 ? options : STORIES;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

