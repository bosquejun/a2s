import "server-only";

import slugify from "slugify";
import type { Payload } from "payload";
import { getPayloadClient } from "@/lib/payload";
import { htmlToLexical } from "@/lib/content/html-to-lexical";
import type { Category, Mood } from "@/lib/content/taxonomy";

export interface StoryIngestInput {
  title: string;
  htmlBody: string;
  excerpt: string;
  author: string;
  mood: Mood;
  categories: Category[];
  tags: string[];
  intensity: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  notes?: string | null;
  storyRequestId?: string | number | null;
}

/** Find-or-create Tag docs by name, returning their IDs for relationships. */
async function ensureTags(
  payload: Payload,
  names: string[]
): Promise<(string | number)[]> {
  const ids: (string | number)[] = [];

  for (const name of names) {
    const slug = slugify(name, { lower: true, strict: true });
    const existing = await payload.find({
      collection: "tags",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs[0]) {
      ids.push(existing.docs[0].id);
    } else {
      const created = await payload.create({
        collection: "tags",
        data: { name, slug },
      });
      ids.push(created.id);
    }
  }

  return ids;
}

/**
 * Create a Story in Payload from AI (or imported) content. Handles HTML →
 * Lexical conversion and tag upserts. `publish: false` leaves it as a draft
 * for editorial review.
 */
export async function ingestStory(
  input: StoryIngestInput,
  { publish }: { publish: boolean }
) {
  const payload = await getPayloadClient();

  const content = await htmlToLexical(input.htmlBody || "<p></p>");
  const tagIds = await ensureTags(payload, input.tags ?? []);

  const story = await payload.create({
    collection: "stories",
    draft: !publish,
    data: {
      title: input.title,
      author: input.author,
      excerpt: input.excerpt,
      content,
      mood: input.mood,
      categories: input.categories,
      tags: tagIds,
      intensity: input.intensity,
      notes: input.notes ?? undefined,
      storyRequest: input.storyRequestId ?? undefined,
      _status: publish ? "published" : "draft",
      ...(input.seo
        ? {
            meta: {
              title: input.seo.title,
              description: input.seo.description,
            },
          }
        : {}),
    } as Record<string, unknown>,
  });

  return story;
}
