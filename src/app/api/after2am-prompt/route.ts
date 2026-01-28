import { NextResponse } from "next/server";
import type { Mood } from "@/lib/types";

const BASE_PROMPTS: string[] = [
  "Describe the quiet moment when you realized something was terribly wrong.",
  "Write about a memory that only returns after midnight.",
  "Someone you thought was gone leaves a new message at 2:13 AM.",
  "A familiar room feels slightly rearranged every night you wake up.",
  "The city sounds different when you decide not to sleep.",
];

const MOOD_SUFFIX: Record<Mood, string> = {
  Haunting: " Let it feel dark, slow, and a little unsettling.",
  Emotional: " Let it ache with missing someone or something you can’t name.",
  Confessional:
    " Let it read like a secret you’ve never said out loud to anyone.",
  Thoughtful:
    " Let it wander, reflective and distant, like thoughts you only have when the world is quiet.",
  Eerie: " Let it feel uncanny, like reality is slightly misaligned.",
};

function buildPrompt(mood: Mood | null): string {
  const base =
    BASE_PROMPTS[Math.floor(Math.random() * BASE_PROMPTS.length)] ??
    BASE_PROMPTS[0];

  if (!mood) {
    return base;
  }

  const suffix = MOOD_SUFFIX[mood];
  return suffix ? `${base}${suffix}` : base;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mood?: Mood | null } | null;
    const mood = body?.mood ?? null;
    const prompt = buildPrompt(mood);
    return NextResponse.json({ prompt });
  } catch {
    const fallback = buildPrompt(null);
    return NextResponse.json({ prompt: fallback }, { status: 200 });
  }
}


