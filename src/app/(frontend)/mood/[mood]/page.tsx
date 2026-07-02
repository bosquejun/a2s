import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ArchiveIntro } from "@/components/archive-intro";
import { RelatedCollections } from "@/components/related-collections";
import { SiteFooter } from "@/components/site-footer";
import { StoryFeed } from "@/components/story-feed";
import { MOOD_ARCHIVE_COPY } from "@/lib/content/archive-copy";
import {
  MOOD_LABELS,
  MOOD_WHISPERS,
  MOODS,
  type Mood,
} from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { getCollectionsForMood } from "@/lib/services/collections/get-collections";
import {
  breadcrumbList,
  serializeJsonLd,
  storyItemList,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

interface PageProps {
  params: Promise<{ mood: string }>;
}

function parseMood(param: string): Mood | null {
  const candidate = param.toUpperCase() as Mood;
  return MOODS.includes(candidate) ? candidate : null;
}

export function generateStaticParams() {
  return MOODS.map((mood) => ({ mood: mood.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { mood: moodParam } = await params;
  const mood = parseMood(moodParam);
  if (!mood) return {};

  const title = `${MOOD_LABELS[mood]} — Stories ${MOOD_WHISPERS[mood]}`;
  const description = MOOD_ARCHIVE_COPY[mood].seoDescription;
  const url = absoluteUrl(`/mood/${mood.toLowerCase()}`);

  return {
    title,
    description,
    keywords: [
      `${MOOD_LABELS[mood].toLowerCase()} stories`,
      MOOD_LABELS[mood].toLowerCase(),
      ...SITE_KEYWORDS,
    ],
    alternates: { canonical: `/mood/${mood.toLowerCase()}` },
    openGraph: {
      title: `${MOOD_LABELS[mood]} | ${SITE_NAME}`,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${MOOD_LABELS[mood]} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function MoodPage({ params }: PageProps) {
  const { mood: moodParam } = await params;
  const mood = parseMood(moodParam);
  if (!mood) {
    notFound();
  }

  const [all, collections] = await Promise.all([
    getAllPublishedStories(),
    getCollectionsForMood(mood),
  ]);
  const stories = all.filter((story) => story.mood === mood);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${MOOD_LABELS[mood]} — After 2AM Stories`,
        description: MOOD_ARCHIVE_COPY[mood].seoDescription,
        url: absoluteUrl(`/mood/${mood.toLowerCase()}`),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: storyItemList(stories),
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Stories", path: "/stories" },
        { name: MOOD_LABELS[mood], path: `/mood/${mood.toLowerCase()}` },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="relative min-h-screen text-foreground font-sans">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-12 flex flex-col items-center gap-5 text-center animate-fade-up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
            >
              <ArrowLeft size={12} />
              Home
            </Link>
            <h1 className="font-serif text-3xl italic text-foreground/90 text-glow sm:text-4xl md:text-5xl">
              {MOOD_LABELS[mood]}
            </h1>
            <p className="font-serif italic text-sm text-muted-foreground/60">
              {MOOD_WHISPERS[mood]}
            </p>
            <Link
              href={`/mood/${mood.toLowerCase()}/random`}
              className="group mt-2 inline-flex items-center gap-2.5 rounded-full bg-indigo-600 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] active:scale-95"
            >
              <Sparkles
                size={13}
                className="opacity-80 transition-transform group-hover:rotate-12"
              />
              Read one at random
            </Link>
          </header>

          <ArchiveIntro copy={MOOD_ARCHIVE_COPY[mood]} />

          <RelatedCollections collections={collections} />

          <StoryFeed
            stories={stories}
            emptyMessage="Nothing here yet for this feeling. Check back after 2am."
          />
        </div>

        <SiteFooter />

        <div className="grain-overlay" aria-hidden="true" />
        <div className="pointer-events-none fixed left-[-10%] top-[-12%] h-[45%] w-[45%] rounded-full bg-indigo-500/8 blur-[130px] animate-drift" />
      </div>
    </>
  );
}
