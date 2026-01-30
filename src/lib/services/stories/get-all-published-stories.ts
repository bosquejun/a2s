"use cache";

import prisma from "@/lib/database/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

/**
 * Get all published stories with Next.js caching.
 * Uses React.cache() for request-level deduplication and 'use cache' for cross-request caching.
 */
const getAllPublishedStoriesCached = cache(async (limit?: number) => {
  "use cache";
  cacheLife("hours"); // Cache for 1 hour, revalidate every 2 hours
  cacheTag("stories", "stories-list"); // Tag for cache invalidation

  const stories = await prisma.story.findMany({
    where: {
      publishedAt: {
        not: null,
      },
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });

  return stories;
});

export async function getAllPublishedStories(limit?: number) {
  return getAllPublishedStoriesCached(limit);
}
