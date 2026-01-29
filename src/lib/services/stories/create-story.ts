import { updateTag } from "next/cache";
import prisma from "@/lib/database/prisma";
import { CreateStoryData } from "@/validations/story.validation";

export async function createStory(data: CreateStoryData) {
  const newStory = await prisma.story.create({
    data
  });

  // Invalidate cache tags when a new story is created
  // Only invalidate if the story is published
  if (newStory.publishedAt) {
    updateTag("stories"); // General stories tag
    updateTag("stories-list"); // Published stories list
    updateTag(`story-${newStory.slug}`); // Specific story
    updateTag(`stories-mood-${newStory.mood}`); // Stories by mood
  }

  return newStory;
}