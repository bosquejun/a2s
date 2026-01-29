import { Mood } from "@/lib/database/generated/prisma/enums";
import { getRandomStoryByMood } from "@/lib/services/stories/get-random-story-by-mood";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moodParam = searchParams.get("mood") as Mood;


  if (!moodParam) {
    return NextResponse.json(
      { error: "Mood parameter is required" },
      { status: 400 }
    );
  }

  
  if (!Object.values(Mood).includes(moodParam)) {
    return NextResponse.redirect(new URL("/404", request.url), { status: 404 });
  }

  try {
    const story = await getRandomStoryByMood(moodParam as Mood);

    if (!story) {
      // Redirect to 404 page
      return NextResponse.redirect(new URL("/404", request.url), { status: 404 });
    }

    // Redirect to the story with mood query parameter
    const redirectUrl = `/story/${story.slug}?mood=${encodeURIComponent(moodParam)}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Error fetching random story by mood:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

