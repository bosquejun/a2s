import { MetadataRoute } from "next";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getIndexableTags } from "@/lib/services/stories/get-stories-by-tag";
import { CATEGORIES, MOODS } from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stories, indexableTags] = await Promise.all([
    getAllPublishedStories(),
    getIndexableTags(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/stories"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const moodRoutes: MetadataRoute.Sitemap = MOODS.map((mood) => ({
    url: absoluteUrl(`/mood/${mood.toLowerCase()}`),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: absoluteUrl(`/category/${category.toLowerCase()}`),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Only tags with enough stories to be worth indexing (see TAG_INDEX_MIN).
  const tagRoutes: MetadataRoute.Sitemap = indexableTags.map((entry) => ({
    url: absoluteUrl(`/tag/${entry.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: absoluteUrl(`/story/${story.slug}`),
    lastModified: story.updatedAt || story.publishedAt || new Date(),
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
