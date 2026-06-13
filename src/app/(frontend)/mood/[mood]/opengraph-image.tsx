import {
  MOOD_LABELS,
  MOOD_WHISPERS,
  MOODS,
  type Mood,
} from "@/lib/content/taxonomy";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  pageOgImage,
  siteOgImage,
} from "@/lib/og/og-kit";

export const alt = "After 2AM Stories";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Pre-render one card per mood at build time. */
export function generateStaticParams() {
  return MOODS.map((mood) => ({ mood: mood.toLowerCase() }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ mood: string }>;
}) {
  const { mood: moodParam } = await params;
  const mood = moodParam.toUpperCase() as Mood;

  // Unknown mood → fall back to the brand card.
  if (!MOODS.includes(mood)) {
    return siteOgImage();
  }

  return pageOgImage({
    title: MOOD_LABELS[mood],
    subtitle: MOOD_WHISPERS[mood],
  });
}
