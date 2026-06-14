import { tagToSlug } from "@/lib/content/tags";
import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";

/**
 * Minimum published stories a tag needs before it is treated as index-worthy:
 * below this it still renders (reachable from a story), but is left out of the
 * sitemap and marked noindex so we don't flood search with thin pages.
 */
export const TAG_INDEX_MIN = 3;

export interface TagListing {
  /** Display form of the tag (first occurrence wins for shared slugs). */
  tag: string;
  /** Normalized slug used in the URL. */
  slug: string;
  stories: StorySummary[];
}

export interface TagIndexEntry {
  tag: string;
  slug: string;
  count: number;
}

/** Resolve a tag slug to its display tag and matching stories, or null. */
export async function getStoriesByTagSlug(
  slug: string
): Promise<TagListing | null> {
  const normalized = tagToSlug(slug);
  if (!normalized) return null;

  const all = await getAllPublishedStories();

  let displayTag: string | null = null;
  const stories = all.filter((story) =>
    story.tags.some((tag) => {
      if (tagToSlug(tag) !== normalized) return false;
      if (!displayTag) displayTag = tag;
      return true;
    })
  );

  if (!stories.length || !displayTag) return null;
  return { tag: displayTag, slug: normalized, stories };
}

/**
 * All distinct tags across published stories with their story counts, newest
 * display form preserved. Used for sitemap + static params and to decide which
 * tag pages are index-worthy (see TAG_INDEX_MIN).
 */
export async function getTagIndex(): Promise<TagIndexEntry[]> {
  const all = await getAllPublishedStories();
  const bySlug = new Map<string, TagIndexEntry>();

  for (const story of all) {
    for (const tag of story.tags) {
      const slug = tagToSlug(tag);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { tag, slug, count: 1 });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => b.count - a.count);
}

/** Index-worthy tags only (count ≥ TAG_INDEX_MIN). */
export async function getIndexableTags(): Promise<TagIndexEntry[]> {
  const index = await getTagIndex();
  return index.filter((entry) => entry.count >= TAG_INDEX_MIN);
}
