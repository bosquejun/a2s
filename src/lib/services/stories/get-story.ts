"use cache";

import prisma from "@/lib/database/prisma";
import { storySchema } from "@/validations/story.validation";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

/**
 * Get a story by slug with Next.js caching.
 * Uses React.cache() for request-level deduplication and 'use cache' for cross-request caching.
 */
const getStoryBySlugCached = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours"); // Cache for 1 hour, revalidate every 2 hours
  cacheTag("stories", `story-${slug}`); // Tag for cache invalidation

  const story = await prisma.story.findUnique({
    where: { slug },
  });

  if (!story) {
    return null;
  }

  return storySchema.parse(story);
});

export async function getStoryBySlug(slug: string) {
  return getStoryBySlugCached(slug);
}