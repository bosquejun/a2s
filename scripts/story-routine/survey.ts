// `survey` — fetch the variety + engagement context the routine needs before
// authoring, and print it as compact JSON on stdout. This is steps 1–2 of
// docs/routines/story-generation.md, so the agent spends its tokens writing
// rather than parsing raw Payload list responses.

import { loadEnv, payloadList } from "./lib";

/** Subset of Story fields relevant to variety + engagement decisions. */
type StoryDoc = {
  title?: string;
  slug?: string;
  mood?: string;
  categories?: string[];
  intensity?: number;
  viewCount?: number;
  publishedAt?: string;
};

type RecentEntry = Pick<
  StoryDoc,
  "title" | "slug" | "mood" | "categories" | "intensity" | "publishedAt"
>;
type MostReadEntry = Pick<
  StoryDoc,
  "title" | "slug" | "mood" | "categories" | "intensity" | "viewCount"
>;

const RECENT_LIMIT = 20;
const MOST_READ_LIMIT = 15;

export async function survey(): Promise<void> {
  const env = loadEnv({ requireSecret: false });

  const [recent, mostRead] = await Promise.all([
    payloadList<StoryDoc>(
      env,
      `/stories?sort=-publishedAt&limit=${RECENT_LIMIT}&depth=0`
    ),
    payloadList<StoryDoc>(
      env,
      `/stories?sort=-viewCount&limit=${MOST_READ_LIMIT}&depth=0`
    ),
  ]);

  const out = {
    recent: recent.map(
      (s): RecentEntry => ({
        title: s.title,
        slug: s.slug,
        mood: s.mood,
        categories: s.categories,
        intensity: s.intensity,
        publishedAt: s.publishedAt,
      })
    ),
    mostRead: mostRead.map(
      (s): MostReadEntry => ({
        title: s.title,
        slug: s.slug,
        mood: s.mood,
        categories: s.categories,
        intensity: s.intensity,
        viewCount: s.viewCount,
      })
    ),
  };

  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}
