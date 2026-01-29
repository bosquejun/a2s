import { Prisma } from "@/lib/database/generated/prisma/client";
import { Mood } from "@/lib/database/generated/prisma/enums";
import prisma from "@/lib/database/prisma";

export async function getRandomStoryByMood(mood: Mood, exclude?: string | null) {
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
}

