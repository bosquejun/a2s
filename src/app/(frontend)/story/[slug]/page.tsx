import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
import type { Category } from "@/lib/content/taxonomy";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { Story } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPublishedStories(100);

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

function buildStoryMetadata(story: Story): Metadata {
  const description = story.excerpt ?? story.seo?.description ?? "";
  const url = `https://after2amstories.com/story/${story.slug}`;
  const title = story.seo?.title || story.title;

  return {
    title,
    description,
    keywords: [
      ...story.tags,
      story.categories
        .map((category: Category) => category.toLowerCase())
        .join(", "),
      story.mood.toLowerCase(),
      "after 2am",
      "stories",
    ],
    openGraph: {
      title,
      description: story.seo?.description || description,
      type: "article",
      url,
      siteName: "After 2AM Stories",
      publishedTime: story.publishedAt ?? undefined,
      modifiedTime: story.updatedAt ?? undefined,
      authors: story.author ? [story.author] : undefined,
      section: story.categories[0]?.toLowerCase(),
      tags: story.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: story.seo?.description || description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {};
  }

  return buildStoryMetadata(story);
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;

  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.excerpt || "",
    articleBody: story.content,
    author: story.author,
    articleSection: story.categories[0] ?? undefined,
    keywords: story.tags.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://after2amstories.com/story/${story.slug}`,
    },
    datePublished: story.publishedAt, // You may want to add actual publish dates to stories
    dateModified: story.updatedAt,
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
