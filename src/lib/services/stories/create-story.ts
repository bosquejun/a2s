import prisma from "@/lib/database/prisma";
import { CreateStoryData } from "@/validations/story.validation";

export async function createStory(data: CreateStoryData) {
  const newStory = await prisma.story.create({
    data
  });
  return newStory;
}