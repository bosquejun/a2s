import {
  CATEGORIES,
  MOODS,
  type Category,
  type Mood,
} from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";

/** Stories shown per infinite-scroll batch on the stories hub. */
export const STORIES_PAGE_SIZE = 12;

/** A validated, mutually-exclusive browse filter for the stories hub. */
export interface StoryFilter {
  mood?: Mood;
  category?: Category;
  tag?: string;
}

/** Raw, untrusted filter params (from search params or a client action). */
export interface RawStoryFilter {
  mood?: string;
  category?: string;
  tag?: string;
}

/**
 * Validate raw browse params into a single active filter. Precedence is
 * tag → category → mood, so a story-page tag/category link wins over a stray
 * mood param; unknown moods/categories are dropped. Shared by the page and the
 * load-more action so both filter identically.
 */
export function resolveStoryFilter(raw: RawStoryFilter): StoryFilter {
  const tag = raw.tag?.trim();
  if (tag) return { tag };

  const category = raw.category?.toUpperCase() as Category | undefined;
  if (category && CATEGORIES.includes(category)) return { category };

  const mood = raw.mood?.toUpperCase() as Mood | undefined;
  if (mood && MOODS.includes(mood)) return { mood };

  return {};
}

/** True when a story satisfies the active (single-axis) browse filter. */
export function matchesStoryFilter(
  story: StorySummary,
  filter: StoryFilter
): boolean {
  if (filter.mood) return story.mood === filter.mood;
  if (filter.category) return story.categories.includes(filter.category);
  if (filter.tag) {
    const wanted = filter.tag.toLowerCase();
    return story.tags.some((tag) => tag.toLowerCase() === wanted);
  }
  return true;
}
