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
        ...(excludeSlugs.length ? { slug: { not_in: excludeSlugs } } : {}),
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

/**
 * Get a random published story across every mood, skipping anything in
 * `exclude`. Used as the cross-mood fallback so a reader who has exhausted one
 * mood keeps moving instead of dead-ending at an archive.
 */
const getRandomStoryCached = cache(async (exclude?: string | null) => {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 1800 });
  cacheTag("stories", "stories-list");

  const excludeSlugs = (exclude ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "stories",
    where: {
      _status: { equals: "published" },
      ...(excludeSlugs.length ? { slug: { not_in: excludeSlugs } } : {}),
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
});

export async function getRandomStory(exclude?: string | null) {
  return getRandomStoryCached(exclude);
}
