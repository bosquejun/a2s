import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import {
  normalizeStorySummary,
  type StoryDoc,
} from "@/lib/content/normalize";
import { getPayloadClient } from "@/lib/payload";
import type { StorySummary } from "@/lib/types";

/** Get all published stories (newest first) as lightweight summaries. */
const getAllPublishedStoriesCached = cache(
  async (limit?: number): Promise<StorySummary[]> => {
    "use cache";
    cacheLife("hours");
    cacheTag("stories", "stories-list");

    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "stories",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      depth: 1,
      limit: limit ?? 0,
      pagination: limit ? true : false,
    });

    return docs.map((doc) => normalizeStorySummary(doc as unknown as StoryDoc));
  }
);

export async function getAllPublishedStories(limit?: number) {
  return getAllPublishedStoriesCached(limit);
}
