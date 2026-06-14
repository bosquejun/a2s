"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadMoreStories } from "@/app/(frontend)/stories/actions";
import { StoryCard } from "@/components/story-card";
import { StoryCardSkeleton } from "@/components/skeletons/story-card-skeleton";
import type { StorySummary } from "@/lib/types";

interface InfiniteStoryFeedProps {
  /** First batch rendered on the server for fast paint + SEO. */
  initialStories: StorySummary[];
  /** Total matching stories, used to know when to stop loading. */
  total: number;
  /** Active mood filter (lowercase slug), forwarded to the server action. */
  mood?: string;
  /** Active category filter (lowercase slug), forwarded to the server action. */
  category?: string;
  /** Active tag filter (raw value), forwarded to the server action. */
  tag?: string;
  emptyMessage?: string;
}

/**
 * Infinite-scroll story grid. Renders the server-provided first batch, then
 * appends further batches via the `loadMoreStories` action whenever a sentinel
 * near the bottom of the list scrolls into view. Remount (via a `key` keyed on
 * the active mood) resets the accumulated list when the filter changes.
 */
export function InfiniteStoryFeed({
  initialStories,
  total,
  mood,
  category,
  tag,
  emptyMessage = "No stories yet. The night is still young.",
}: InfiniteStoryFeedProps) {
  const [stories, setStories] = useState(initialStories);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Guards against the observer firing again before state settles.
  const loadingRef = useRef(false);

  const hasMore = stories.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { stories: next } = await loadMoreStories(stories.length, {
        mood,
        category,
        tag,
      });
      setStories((prev) => [...prev, ...next]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [stories.length, mood, category, tag]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!stories.length) {
    return (
      <p className="py-16 text-center font-serif italic text-slate-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <StoryCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      )}
    </>
  );
}
