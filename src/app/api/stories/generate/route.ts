import {
  createUserPrompt,
  nightWriterAgent,
} from "@/lib/agents/night-writer.agent";
import prisma from "@/lib/database/prisma";
import { GenerateStoryWorkflowInput } from "@/validations/story.validation";
import { serve } from "@upstash/workflow/nextjs";
import { revalidateTag } from "next/cache";
import slugify from "slugify";

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
    return await prisma.story.create({
      data: {
        content: generatedStory.htmlBody,
        title: generatedStory.title,
        excerpt: generatedStory.excerpt,
        slug: slugify(generatedStory.title, { lower: true, strict: true, locale: "en" }),
        author: generatedStory.author,
        mood: generatedStory.mood,
        categories: [category],
        tags: generatedStory.tags,
        intensity: intensity ?? 3,
        seo: generatedStory.seo,
        readTime: generatedStory.readTime,
        wordCount: generatedStory.wordCount,
        notes: null,
        publishedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        storyRequestId: null,
      },
    });

  });

  await context.run("invalidate-cache", async () => {
    revalidateTag("stories", "max");
    revalidateTag("stories-list", "max");
    revalidateTag(`story-${story.slug}`, "max");
    revalidateTag(`stories-mood-${story.mood}`, "max");
  });

  return story;
});
