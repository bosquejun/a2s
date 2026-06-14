import { Mood, MOODS } from "@/lib/content/taxonomy";
import {
  getRandomStory,
  getRandomStoryByMood,
} from "@/lib/services/stories/get-random-story-by-mood";
import { NextRequest, NextResponse } from "next/server";

/**
 * The one-click ritual: send the visitor straight to a random published
 * story for this mood. Temporary redirect + no-store, so browsers never
 * pin a "random" story the way a cached 301 would.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ mood: string }> }
) {
  const { mood: moodParam } = await ctx.params;
  const exclude = request.nextUrl.searchParams.get("exclude");

  const mood = moodParam.toUpperCase() as Mood;
  if (!MOODS.includes(mood)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Prefer an unread story in the chosen mood; once that mood is exhausted,
    // keep the reader moving with an unread story from any mood before finally
    // dead-ending at the archive. The `exclude` list carries their read history.
    const story =
      (await getRandomStoryByMood(mood, exclude)) ??
      (await getRandomStory(exclude));

    if (!story) {
      // Nothing left to serve (everything read, or nothing published yet) —
      // fall back to the mood archive.
      return NextResponse.redirect(
        new URL(`/mood/${mood.toLowerCase()}`, request.url),
        { status: 302 }
      );
    }

    // Forward the accumulated exclude list so repeated "Surprise me" hops keep
    // skipping everything already seen instead of resetting each redirect.
    let redirectUrl = `/story/${story.slug}?mood=${encodeURIComponent(mood.toLowerCase())}`;
    if (exclude) {
      redirectUrl += `&exclude=${encodeURIComponent(exclude)}`;
    }
    const response = NextResponse.redirect(new URL(redirectUrl, request.url), {
      status: 302,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error fetching random story by mood:", error);
    return NextResponse.redirect(
      new URL(`/mood/${mood.toLowerCase()}`, request.url),
      { status: 302 }
    );
  }
}
