import prisma from "@/lib/database/prisma";
import { Mood } from "@/lib/database/generated/prisma/enums";

export async function getStoriesByMood(mood: Mood) {
  const stories = await prisma.story.findMany({
    where: {
      mood,
      publishedAt: {
        not: null,
      },
    },
    select: {
      slug: true,
      id: true,
    },
  });

  return stories;
}
