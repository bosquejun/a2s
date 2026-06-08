import {
  createUserPrompt,
  nightWriterAgent,
} from "@/lib/agents/night-writer.agent";
import { ingestStory } from "@/lib/services/stories/ingest-story";
import { GenerateStoryWorkflowInput } from "@/validations/story.validation";
import { serve } from "@upstash/workflow/nextjs";

/**
 * Mood-driven generation. Per product decision these auto-publish: the
 * night-writer agent produces a story that is created in Payload as published.
 * Cache revalidation happens in the collection's afterChange hook.
 */
export const { POST } = serve<GenerateStoryWorkflowInput>(async (context) => {
  const { mood, category, intensity } = context.requestPayload;

  const generatedStory = await context.run("night-writer-agent", async () => {
    const { output } = await nightWriterAgent.generate({
      prompt: createUserPrompt({
        mood,
        category,
        intensity: intensity ?? 3,
      }),
    });
    return output;
  });

  const story = await context.run("store-story", async () => {
    const created = await ingestStory(
      {
        title: generatedStory.title,
        htmlBody: generatedStory.htmlBody,
        excerpt: generatedStory.excerpt,
        hook: generatedStory.hook,
        author: generatedStory.author,
        mood: generatedStory.mood,
        categories: [category],
        tags: generatedStory.tags,
        intensity: intensity ?? 3,
        seo: generatedStory.seo,
      },
      { publish: true }
    );
    return { id: String(created.id), slug: created.slug };
  });

  return story;
});
