import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
import { getStoryById } from "@/lib/data";
import prisma from "@/lib/database/prisma";
import type { After2AmStory } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function buildStoryMetadata(story: After2AmStory): Metadata {
  const title = `${story.title} | After 2AM Stories`;
  const description = story.excerpt;
  const url = `https://after2am.stories/story/${story.id}`; // Update with your actual domain

  return {
    title,
    description,
    keywords: [
      ...story.tags,
      story.category.toLowerCase(),
      story.mood.toLowerCase(),
      "after 2am",
      "stories",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "After 2AM Stories",
      publishedTime: new Date().toISOString(), // You may want to add actual publish dates to stories
      authors: story.author ? [story.author] : undefined,
      section: story.category,
      tags: story.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const story = getStoryById(id);

  if (!story) {
    return {};
  }

  return buildStoryMetadata(story);
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = getStoryById(id);

  if (!story) {
    notFound();
  }

  const storyFetched = await prisma.story.findUnique({
    where: {
      id,
    },
  });

  console.log({storyFetched});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.excerpt,
    articleBody: story.content,
    author: story.author
      ? {
          "@type": "Person",
          name: story.author,
        }
      : undefined,
    articleSection: story.category,
    keywords: story.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://after2am.stories/story/${story.id}`, // Update with your actual domain
    },
    datePublished: new Date().toISOString(), // You may want to add actual publish dates to stories
    dateModified: new Date().toISOString(),
    publisher: {
      "@type": "Organization",
      name: "After 2AM Stories",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<StoryReaderSkeleton />}>
        <StoryReader story={story} />
      </Suspense>
    </>
  );
}

