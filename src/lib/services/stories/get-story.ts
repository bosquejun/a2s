import prisma from "@/lib/database/prisma";
import { storySchema } from "@/validations/story.validation";



export async function getStoryBySlug(slug: string){
  const story = await prisma.story.findUnique({
    where: { slug },
  });

  if(!story) {
    return null;
  }

  return storySchema.parse(story);
}