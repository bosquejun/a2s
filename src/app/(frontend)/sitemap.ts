import { MetadataRoute } from "next";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getIndexableTags } from "@/lib/services/stories/get-stories-by-tag";
import { tagToSlug } from "@/lib/content/tags";
import { CATEGORIES, MOODS } from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import type { StorySummary } from "@/lib/types";

/** A story's last meaningful change, if it parses to a valid date. */
function storyDate(story: StorySummary): Date | undefined {
  const raw = story.updatedAt || story.publishedAt;
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * `lastmod` must reflect real content changes: Google ignores the field
 * site-wide once it catches entries that claim to change on every fetch, so
 * archive routes derive it from the newest story they contain instead of
 * `new Date()`, and evergreen pages omit it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stories, indexableTags] = await Promise.all([
    getAllPublishedStories(),
    getIndexableTags(),
  ]);

  const newestByMood = new Map<string, Date>();
  const newestByCategory = new Map<string, Date>();
  const newestByTag = new Map<string, Date>();
  let newestOverall: Date | undefined;

  const bump = (map: Map<string, Date>, key: string, date: Date) => {
    const current = map.get(key);
    if (!current || date > current) map.set(key, date);
  };

  for (const story of stories) {
    const date = storyDate(story);
    if (!date) continue;
    if (!newestOverall || date > newestOverall) newestOverall = date;
    bump(newestByMood, story.mood.toLowerCase(), date);
    for (const category of story.categories) {
      bump(newestByCategory, category.toLowerCase(), date);
    }
    for (const tag of story.tags) {
      const slug = tagToSlug(tag);
      if (slug) bump(newestByTag, slug, date);
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: newestOverall,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/stories"),
      lastModified: newestOverall,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Archives with no published stories yet are left out: an empty feed page
  // is thin content and would carry a fabricated lastmod.
  const moodRoutes: MetadataRoute.Sitemap = MOODS.filter((mood) =>
    newestByMood.has(mood.toLowerCase())
  ).map((mood) => ({
    url: absoluteUrl(`/mood/${mood.toLowerCase()}`),
    lastModified: newestByMood.get(mood.toLowerCase()),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter((category) =>
    newestByCategory.has(category.toLowerCase())
  ).map((category) => ({
    url: absoluteUrl(`/category/${category.toLowerCase()}`),
    lastModified: newestByCategory.get(category.toLowerCase()),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Only tags with enough stories to be worth indexing (see TAG_INDEX_MIN).
  const tagRoutes: MetadataRoute.Sitemap = indexableTags.map((entry) => ({
    url: absoluteUrl(`/tag/${entry.slug}`),
    lastModified: newestByTag.get(entry.slug),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: absoluteUrl(`/story/${story.slug}`),
    lastModified: storyDate(story),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: [absoluteUrl(`/story/${story.slug}/og`)],
  }));

  return [
    ...staticRoutes,
    ...moodRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...storyRoutes,
  ];
}
