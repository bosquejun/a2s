import prisma from "@/lib/database/prisma";
import { CreateStoryData } from "@/validations/story.validation";
import { revalidateTag } from "next/cache";

export async function createStory(data: CreateStoryData) {
  const newStory = await prisma.story.create({
    data,
  });

  // Invalidate cache tags when a new story is created
  // Only invalidate if the story is published
  if (newStory.publishedAt) {
    revalidateTag("stories", "max"); // General stories tag
    revalidateTag("stories-list", "max"); // Published stories list
    revalidateTag(`story-${newStory.slug}`, "max"); // Specific story
    revalidateTag(`stories-mood-${newStory.mood}`, "max"); // Stories by mood
  }

  return newStory;
}
