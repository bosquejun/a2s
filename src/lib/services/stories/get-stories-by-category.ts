import type { Category } from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";
import { getAllPublishedStories } from "./get-all-published-stories";
import { matchesStoryFilter } from "./story-filter";

/** Published stories in a category (newest first), sliced from the cached list. */
export async function getStoriesByCategory(
  category: Category
): Promise<StorySummary[]> {
  const all = await getAllPublishedStories();
  return all.filter((story) => matchesStoryFilter(story, { category }));
}
