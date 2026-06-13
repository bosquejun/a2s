import { MetadataRoute } from "next";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { MOODS } from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getAllPublishedStories();

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
  ];

  const moodRoutes: MetadataRoute.Sitemap = MOODS.map((mood) => ({
    url: absoluteUrl(`/mood/${mood.toLowerCase()}`),
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: absoluteUrl(`/story/${story.slug}`),
    lastModified: story.updatedAt || story.publishedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    images: [absoluteUrl(`/story/${story.slug}/opengraph-image`)],
  }));

  return [...staticRoutes, ...moodRoutes, ...storyRoutes];
}
