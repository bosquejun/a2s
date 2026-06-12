import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { normalizeStory, type StoryDoc } from "@/lib/content/normalize";
import { getPayloadClient } from "@/lib/payload";

/**
 * Get a published story by slug.
 * React.cache() dedupes within a request; 'use cache' caches across requests.
 */
const getStoryBySlugCached = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag("stories", `story-${slug}`);

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "stories",
    where: {
      slug: { equals: slug },
      _status: { equals: "published" },
    },
    depth: 1,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) return null;

  return normalizeStory(doc as unknown as StoryDoc);
});

export async function getStoryBySlug(slug: string) {
  return getStoryBySlugCached(slug);
}
