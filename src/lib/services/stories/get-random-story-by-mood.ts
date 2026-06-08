import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { getPayloadClient } from "@/lib/payload";
import type { Mood } from "@/lib/content/taxonomy";

/**
 * Get a random published story slug by mood.
 * Cached per mood+exclude combination (short TTL) to keep some variety.
 */
const getRandomStoryByMoodCached = cache(
  async (mood: Mood, exclude?: string | null) => {
    "use cache";
    cacheLife({ stale: 300, revalidate: 600, expire: 1800 });
    cacheTag("stories", `stories-mood-${mood}`);

    const excludeSlugs = (exclude ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "stories",
      where: {
        mood: { equals: mood },
        _status: { equals: "published" },
        ...(excludeSlugs.length
          ? { slug: { not_in: excludeSlugs } }
          : {}),
      },
      depth: 0,
      pagination: false,
      select: { slug: true },
    });

    if (!docs.length) return null;

    const pick = docs[Math.floor(Math.random() * docs.length)] as {
      slug: string;
    };
    return { slug: pick.slug };
  }
);

export async function getRandomStoryByMood(
  mood: Mood,
  exclude?: string | null
) {
  return getRandomStoryByMoodCached(mood, exclude);
}
