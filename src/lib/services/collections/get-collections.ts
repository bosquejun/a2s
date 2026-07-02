import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import {
  normalizeStoryCollection,
  type CollectionDoc,
} from "@/lib/content/normalize";
import type { Category, Mood } from "@/lib/content/taxonomy";
import { getPayloadClient } from "@/lib/payload";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import type { StoryCollection } from "@/lib/types";

/**
 * How many member stories must share a mood/category for a collection to be
 * cross-linked from that archive page.
 */
const ARCHIVE_LINK_MIN = 2;

/** All published collections (newest first) with member stories resolved. */
const getAllPublishedCollectionsCached = cache(
  async (): Promise<StoryCollection[]> => {
    "use cache";
    cacheLife("hours");
    cacheTag("collections");

    const payload = await getPayloadClient();
    const [{ docs }, stories] = await Promise.all([
      payload.find({
        collection: "collections",
        where: { _status: { equals: "published" } },
        sort: "-publishedAt",
        depth: 0,
        limit: 0,
        pagination: false,
      }),
      getAllPublishedStories(),
    ]);

    const storiesById = new Map(stories.map((story) => [story.id, story]));
    return docs.map((doc) =>
      normalizeStoryCollection(doc as unknown as CollectionDoc, storiesById)
    );
  }
);

export async function getAllPublishedCollections() {
  return getAllPublishedCollectionsCached();
}

export async function getCollectionBySlug(
  slug: string
): Promise<StoryCollection | null> {
  const all = await getAllPublishedCollections();
  return all.find((collection) => collection.slug === slug) ?? null;
}

/** Published collections a story appears in (for reader backlinks). */
export async function getCollectionsForStorySlug(
  slug: string
): Promise<StoryCollection[]> {
  const all = await getAllPublishedCollections();
  return all.filter((collection) =>
    collection.stories.some((story) => story.slug === slug)
  );
}

/** Collections worth linking from a mood archive (see ARCHIVE_LINK_MIN). */
export async function getCollectionsForMood(
  mood: Mood
): Promise<StoryCollection[]> {
  const all = await getAllPublishedCollections();
  return all.filter(
    (collection) =>
      collection.stories.filter((story) => story.mood === mood).length >=
      ARCHIVE_LINK_MIN
  );
}

/** Collections worth linking from a category archive (see ARCHIVE_LINK_MIN). */
export async function getCollectionsForCategory(
  category: Category
): Promise<StoryCollection[]> {
  const all = await getAllPublishedCollections();
  return all.filter(
    (collection) =>
      collection.stories.filter((story) => story.categories.includes(category))
        .length >= ARCHIVE_LINK_MIN
  );
}
