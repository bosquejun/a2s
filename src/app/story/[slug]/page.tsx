import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
import { Category } from "@/lib/database/generated/prisma/enums";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { Story } from "@/validations/story.validation";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// export async function generateStaticParams() {
//   const posts = await getAllPublishedStories(100);
 
//   return posts.map((post) => ({
//     slug: post.slug,
//   }))
// }

function buildStoryMetadata(story: Story): Metadata {
  const description = story.excerpt;
  const url = `https://after2amstories.com/story/${story.slug}`;

  return {
    title: story.seo.title || '',
    description,
    keywords: [
      ...story.tags,
      story.categories.map((category: Category) => category.toLowerCase()).join(", "),
      story.mood.toLowerCase(),
      "after 2am",
      "stories",
    ],
    openGraph: {
      title: story.seo.title || '',
      description: story.seo.description || '',
      type: "article",
      url,
      siteName: "After 2AM Stories",
      publishedTime: story.publishedAt?.toISOString() || '', // You may want to add actual publish dates to stories
      modifiedTime: story.updatedAt?.toISOString() || '',
      authors: story.author ? [story.author] : undefined,
      section: story.categories[0].toLowerCase(),
      tags: story.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: story.seo.title || '',
      description: story.seo.description || '',
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
    description: story.excerpt || '',
    articleBody: story.content,
    author: story.author,
    articleSection: story.categories[0],
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

