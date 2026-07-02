import {
  normalizeStorySummary,
  type StoryDoc,
} from "@/lib/content/normalize";
import { getPayloadClient } from "@/lib/payload";
import type { Mood } from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";

export async function getStoriesByMood(mood: Mood): Promise<StorySummary[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "stories",
    where: {
      mood: { equals: mood },
      _status: { equals: "published" },
    },
    sort: "-publishedAt",
    depth: 1,
    pagination: false,
  });

  return docs.map((doc) => normalizeStorySummary(doc as unknown as StoryDoc));
}
