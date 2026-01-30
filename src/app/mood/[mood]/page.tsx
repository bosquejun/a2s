"use client";

import { Mood } from "@/lib/database/generated/prisma/enums";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const MOOD_LABELS: Record<Mood, string> = {
  [Mood.CANT_SLEEP]: "I can't sleep",
  [Mood.DARK]: "I want something dark",
  [Mood.MISS_SOMEONE]: "I miss someone",
  [Mood.EMPTY]: "I feel empty",
  [Mood.REFLECTIVE]: "I feel reflective",
  [Mood.UNSETTLING]: "I feel uneasy",
};

function MoodRedirectContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const moodParam = params.mood as string;
  const exclude = searchParams.get("exclude");

  useEffect(() => {
    // Validate mood before redirecting
    const mood = moodParam?.toUpperCase();
    if (!mood || !Object.values(Mood).includes(mood as Mood)) {
      // Invalid mood, redirect to home
      window.location.href = "/";
      return;
    }

    // Build API URL with query params
    const apiUrl = `/api/stories/mood/${moodParam.toLowerCase()}${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ""}`;
    
    // Call API - the API will handle the redirect server-side
    try {
      window.location.href = apiUrl;
    } catch (error) {
      console.error("Error redirecting to API:", error);
      // Fallback: redirect to home if redirect fails
      window.location.href = "/";
    }
  }, [moodParam, exclude]);

  const mood = moodParam?.toUpperCase() as Mood;
  const moodLabel =
    mood && Object.values(Mood).includes(mood)
      ? MOOD_LABELS[mood]
      : "Finding your story";

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-6 sm:pt-8 pb-24 sm:pb-32 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-5 sm:space-y-6">
          <Loader2 className="size-7 sm:size-8 animate-spin text-indigo-400 mx-auto" />
          <div className="space-y-2">
            <p className="text-slate-400 font-serif italic text-lg sm:text-xl">
              {moodLabel}
            </p>
            <p className="text-slate-600 text-[10px] sm:text-xs uppercase tracking-widest">
              Finding your story...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoodRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pt-6 sm:pt-8 pb-24 sm:pb-32 px-4 sm:px-6 animate-fade-in">
          <div className="max-w-3xl mx-auto space-y-12 flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-6">
              <Loader2 className="size-7 sm:size-8 animate-spin text-indigo-400 mx-auto" />
              <p className="text-slate-600 text-[10px] sm:text-xs uppercase tracking-widest">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <MoodRedirectContent />
    </Suspense>
  );
}

