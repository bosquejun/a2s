import { MetadataRoute } from "next";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://after2amstories.com";

  // Get all published stories
  const stories = await getAllPublishedStories();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/write`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic story routes
  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${baseUrl}/story/${story.slug}`,
    lastModified: story.updatedAt || story.publishedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...storyRoutes];
}
