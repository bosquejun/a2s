import { StoryFeed } from "@/components/story-feed";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";

export async function RecentStories({ limit = 6 }: { limit?: number }) {
  const stories = await getAllPublishedStories(limit);
  return <StoryFeed stories={stories} />;
}
