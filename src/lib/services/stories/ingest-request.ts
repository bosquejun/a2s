import type { StoryIngestInput } from "@/lib/services/stories/ingest-story";
import { nightWriterStoryWorkflowOutputSchema } from "@/validations/story.validation";

export type ParseIngestResult =
  | { ok: true; input: StoryIngestInput }
  | { ok: false; errors: string[] };

/**
 * Validate an ingest request body against the same schema the night-writer
 * agent used, then map it to the ingestStory input shape. Pure: no DB/network,
 * so it stays unit-testable. Importing StoryIngestInput as a type avoids
 * pulling ingest-story.ts's "server-only" guard into test/runtime graphs.
 */
export function parseIngestRequest(body: unknown): ParseIngestResult {
  const parsed = nightWriterStoryWorkflowOutputSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`
      ),
    };
  }

  const story = parsed.data;
  const input: StoryIngestInput = {
    title: story.title,
    htmlBody: story.htmlBody,
    excerpt: story.excerpt,
    hook: story.hook,
    author: story.author,
    mood: story.mood,
    categories: story.categories,
    tags: story.tags,
    intensity: story.intensity,
    seo: story.seo,
  };

  return { ok: true, input };
}
