import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
import type { Category } from "@/lib/content/taxonomy";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { Story } from "@/lib/types";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/utils/json-ld";
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
  const url = absoluteUrl(`/story/${story.slug}`);
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
      siteName: SITE_NAME,
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

  const storyUrl = absoluteUrl(`/story/${story.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: story.title,
        description: story.hook || story.excerpt || "",
        image: `${storyUrl}/opengraph-image`,
        author: story.author
          ? { "@type": "Person", name: story.author }
          : { "@type": "Organization", name: SITE_NAME },
        articleSection: story.categories[0] ?? undefined,
        keywords: story.tags.join(", "),
        wordCount: story.wordCount || undefined,
        inLanguage: "en-US",
        mainEntityOfPage: { "@type": "WebPage", "@id": storyUrl },
        datePublished: story.publishedAt ?? undefined,
        dateModified: story.updatedAt ?? story.publishedAt ?? undefined,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Stories",
            item: absoluteUrl("/stories"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: story.title,
            item: storyUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense fallback={<StoryReaderSkeleton />}>
        <StoryReader story={story} />
      </Suspense>
    </>
  );
}
