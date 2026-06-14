import { StoryFeed } from "@/components/story-feed";
import { getMostReadStories } from "@/lib/services/stories/get-most-read-stories";

/**
 * "Most read after dark" lane for the landing page — a serendipity surface
 * distinct from the recency feed. Renders nothing until at least `limit`
 * stories have real view counts, so it never just mirrors "Recent whispers"
 * on a quiet catalog.
 */
export async function MostReadStories({ limit = 3 }: { limit?: number }) {
  const stories = await getMostReadStories(limit);
  if (stories.length < limit) return null;

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground/50">
          What others read
        </span>
        <h2 className="font-serif text-2xl italic text-foreground/90 sm:text-3xl">
          Most read after dark
        </h2>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <StoryFeed stories={stories} />
    </section>
  );
}
