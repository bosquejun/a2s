import { StoryReaderSkeleton } from "@/components/skeletons/story-reader-skeleton";
import { StoryReader } from "@/components/story-reader";
import type { Category } from "@/lib/content/taxonomy";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { getStoryNeighbors } from "@/lib/services/stories/get-story-neighbors";
import { Story } from "@/lib/types";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import {
  breadcrumbList,
  ORGANIZATION_ID,
  serializeJsonLd,
} from "@/lib/utils/json-ld";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function buildStoryMetadata(story: Story): Metadata {
  // Prefer the SEO description (120–160 chars, written as the SERP snippet)
  // over the shorter excerpt so Google has a fuller, more clickable snippet.
  const description = story.seo?.description || story.excerpt || "";
  const url = absoluteUrl(`/story/${story.slug}`);
  const title = story.seo?.title || story.title;
  const ogImage = {
    url: `${url}/og`,
    width: 1200,
    height: 630,
    alt: title,
  };

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
      description,
      type: "article",
      url,
      siteName: SITE_NAME,
      publishedTime: story.publishedAt ?? undefined,
      modifiedTime: story.updatedAt ?? undefined,
      authors: story.author ? [story.author] : undefined,
      section: story.categories[0]?.toLowerCase(),
      tags: story.tags,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: { "x-default": url, en: url },
    },
  };
}

// Cap how many story pages get prerendered at build time. Newest stories are
// prerendered to static HTML (instant, CDN-served); any beyond the cap — and
// stories published later — render on demand the first time, then cache.
// Defaults to 200; set STORY_PRERENDER_LIMIT=0 to prerender every published story.
const parsedLimit = Number(process.env.STORY_PRERENDER_LIMIT ?? 200);
// Fall back to the default on a non-numeric value so a typo doesn't silently
// prerender the entire catalog. Only an explicit 0 means "all".
const STORY_PRERENDER_LIMIT = Number.isFinite(parsedLimit) ? parsedLimit : 200;

export async function generateStaticParams() {
  const stories = await getAllPublishedStories(
    STORY_PRERENDER_LIMIT > 0 ? STORY_PRERENDER_LIMIT : undefined
  );
  return stories.map((story) => ({ slug: story.slug }));
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

  const { related, next } = await getStoryNeighbors(
    story.slug,
    story.mood,
    story.categories,
    story.tags
  );

  const storyUrl = absoluteUrl(`/story/${story.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: story.title,
        description: story.hook || story.excerpt || "",
        image: {
          "@type": "ImageObject",
          url: `${storyUrl}/og`,
          width: 1200,
          height: 630,
        },
        author: story.author
          ? { "@type": "Person", name: story.author }
          : { "@type": "Organization", name: SITE_NAME },
        articleSection: story.categories[0] ?? undefined,
        keywords: story.tags.join(", "),
        wordCount: story.wordCount || undefined,
        timeRequired: story.readTime ? `PT${story.readTime}M` : undefined,
        isAccessibleForFree: true,
        inLanguage: "en-US",
        mainEntityOfPage: { "@type": "WebPage", "@id": storyUrl },
        datePublished: story.publishedAt ?? undefined,
        dateModified: story.updatedAt ?? story.publishedAt ?? undefined,
        publisher: { "@id": ORGANIZATION_ID },
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Stories", path: "/stories" },
        { name: story.title, path: `/story/${story.slug}` },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense fallback={<StoryReaderSkeleton />}>
        <StoryReader story={story} related={related} next={next} />
      </Suspense>
    </>
  );
}
