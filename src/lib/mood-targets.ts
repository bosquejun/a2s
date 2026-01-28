import { connection } from "next/server";
import { MOOD_CONFIG, getRandomStoryForMood } from "@/lib/data";
import type { Mood } from "@/lib/types";

/**
 * Server-side mood targets builder.
 * Uses `connection()` to defer Math.random() to request time (Next.js 16 best practice).
 */
export async function getMoodTargets(): Promise<Record<Mood, string>> {
  // Defer to request time to allow Math.random() in server components
  await connection();

  return MOOD_CONFIG.reduce(
    (accumulator, mood) => {
      const story = getRandomStoryForMood(mood.id);
      // Preserve mood in query for reader context.
      accumulator[mood.id] = `/story/${story.id}?mood=${encodeURIComponent(
        mood.id,
      )}`;
      return accumulator;
    },
    {} as Record<Mood, string>,
  );
}

