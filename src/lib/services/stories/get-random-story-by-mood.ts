"use cache";

import { Prisma } from "@/lib/database/generated/prisma/client";
import { Mood } from "@/lib/database/generated/prisma/enums";
import prisma from "@/lib/database/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

/**
 * Get a random story by mood with Next.js caching.
 * Uses React.cache() for request-level deduplication and 'use cache' for cross-request caching.
 * Note: Random selection is cached per mood+exclude combination to ensure variety.
 */
const getRandomStoryByMoodCached = cache(async (mood: Mood, exclude?: string | null) => {
  "use cache";
  // Shorter cache for random selection to ensure variety (5 minutes stale, 10 minutes revalidate)
  cacheLife({
    stale: 300, // 5 minutes - serve stale while revalidating
    revalidate: 600, // 10 minutes - background revalidation interval
    expire: 1800, // 30 minutes - hard expiration
  });
  cacheTag("stories", `stories-mood-${mood}`); // Tag for cache invalidation

  // Use raw SQL with ORDER BY RANDOM() for efficient random selection
  // This is much more efficient than fetching all stories and selecting in JavaScript
  let query: Prisma.Sql;

  if (exclude) {
    const excludeSlugs = exclude.split(",").filter(Boolean);
    if (excludeSlugs.length > 0) {
      // Build query with exclusions using Prisma.sql for safe SQL construction
      const excludeValues = excludeSlugs.map((s) => Prisma.raw(`'${s.replace(/'/g, "''")}'`));
      query = Prisma.sql`
        SELECT slug
        FROM "Story"
        WHERE mood = ${mood}::"Mood"
          AND "publishedAt" IS NOT NULL
          AND slug NOT IN (${Prisma.join(excludeValues, ", ")})
        ORDER BY RANDOM()
        LIMIT 1
      `;
    } else {
      query = Prisma.sql`
        SELECT slug
        FROM "Story"
        WHERE mood = ${mood}::"Mood"
          AND "publishedAt" IS NOT NULL
        ORDER BY RANDOM()
        LIMIT 1
      `;
    }
  } else {
    query = Prisma.sql`
      SELECT slug
      FROM "Story"
      WHERE mood = ${mood}::"Mood"
        AND "publishedAt" IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 1
    `;
  }

  const result = await prisma.$queryRaw<Array<{ slug: string }>>(query);

  if (!result || result.length === 0) {
    return null;
  }

  return result[0];
});

export async function getRandomStoryByMood(mood: Mood, exclude?: string | null) {
  return getRandomStoryByMoodCached(mood, exclude);
}

