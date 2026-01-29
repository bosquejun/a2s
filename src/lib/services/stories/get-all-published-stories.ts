import prisma from "@/lib/database/prisma";

export async function getAllPublishedStories() {
  const stories = await prisma.story.findMany({
    where: {
      publishedAt: {
        not: null,
      },
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return stories;
}

