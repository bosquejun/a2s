import { StoryCard } from "@/components/story-card";
import type { StorySummary } from "@/lib/types";

interface StoryFeedProps {
  stories: StorySummary[];
  emptyMessage?: string;
}

export function StoryFeed({
  stories,
  emptyMessage = "No stories yet. The night is still young.",
}: StoryFeedProps) {
  if (!stories.length) {
    return (
      <p className="py-16 text-center font-serif italic text-slate-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
