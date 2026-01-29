import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
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

function buildStoryMetadata(story: Story): Metadata {
  const description = story.excerpt;
  const url = `https://after2am.stories/story/${story.id}`; // Update with your actual domain
  ;

  return {
    title: story.seo.title || '',
    description,
    keywords: [
      ...story.tags,
      story.categories.map(category => category.toLowerCase()).join(", "),
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
      publishedTime: new Date().toISOString(), // You may want to add actual publish dates to stories
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
        <StoryReader story={{
          ...story,
          content: story.content,
          excerpt: story.excerpt || '',
          author: story.author,
          category: story.categories[0],
          mood: story.mood,
          timestamp: new Date().toISOString(),
          readTime: story.readTime + ' min read',
          tags: story.tags,
          likes: 0,
          commentsCount: 0,
          // category: story.categories[0],
          // mood: story.mood,
        }} />
      </Suspense>
    </>
  );
}

