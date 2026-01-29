import { Mood } from "@/lib/database/generated/prisma/enums";
import { getRandomStoryByMood } from "@/lib/services/stories/get-random-story-by-mood";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest, ctx: RouteContext<'/api/stories/mood/[mood]'>) {
  const { mood: moodParam } = await ctx.params;
  const searchParams = request.nextUrl.searchParams;
  const exclude = searchParams.get("exclude");

  const mood = moodParam.toUpperCase() as Mood;
  if (!Object.values(Mood).includes(mood)) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  try {
    const story = await getRandomStoryByMood(mood, exclude);

    if (!story) {
      // Redirect to 404 page
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Redirect to the story with mood query parameter
    const redirectUrl = `/story/${story.slug}?mood=${encodeURIComponent(mood.toLowerCase())}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url), {status: 301});
  } catch (error) {
    console.error("Error fetching random story by mood:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

