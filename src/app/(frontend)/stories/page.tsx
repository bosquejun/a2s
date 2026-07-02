import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { InfiniteStoryFeed } from "@/components/infinite-story-feed";
import { StoryCardSkeleton } from "@/components/skeletons/story-card-skeleton";
import {
  getPublishedStoriesPage,
  resolveStoryFilter,
} from "@/lib/services/stories/get-published-stories-page";
import { tagToSlug } from "@/lib/content/tags";
import { MOODS, MOOD_LABELS } from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_NAME, SITE_KEYWORDS } from "@/lib/seo";
import {
  breadcrumbList,
  serializeJsonLd,
  storyItemList,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

const STORIES_DESCRIPTION =
  "Browse every story written after 2am — sorted by the feeling that brought you here.";

export const metadata: Metadata = {
  title: "All Stories",
  description: STORIES_DESCRIPTION,
  keywords: [
    ...SITE_KEYWORDS,
    "all stories",
    "browse stories",
    ...MOODS.map((m) => `${MOOD_LABELS[m].toLowerCase()} stories`),
  ],
  alternates: { canonical: "/stories" },
  openGraph: {
    title: `All Stories | ${SITE_NAME}`,
    description: STORIES_DESCRIPTION,
    type: "website",
    url: absoluteUrl("/stories"),
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `All Stories | ${SITE_NAME}`,
    description: STORIES_DESCRIPTION,
  },
};

interface PageProps {
  searchParams: Promise<{ mood?: string; category?: string; tag?: string }>;
}

export default function StoriesPage({ searchParams }: PageProps) {
  return (
    <div className="relative min-h-screen text-foreground font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 flex flex-col items-center gap-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-600 transition-colors hover:text-slate-300"
          >
            <ArrowLeft size={12} />
            Home
          </Link>
          <h1 className="font-serif text-3xl italic text-slate-100 sm:text-4xl">
            All Stories
          </h1>
          <p className="max-w-md text-sm text-slate-500">
            Everything written after 2am. Filter by the feeling that brought
            you here.
          </p>
        </header>

        <Suspense fallback={<StoriesListFallback />}>
          <StoriesList searchParams={searchParams} />
        </Suspense>
      </div>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}

/**
 * Reads the request-time `mood` filter and the cached story list. Kept inside a
 * <Suspense> boundary so the static page shell can prerender under Cache
 * Components while this dynamic section streams.
 */
async function StoriesList({ searchParams }: PageProps) {
  const filter = resolveStoryFilter(await searchParams);

  // Tag/category browsing has its own canonical, indexable pages — funnel any
  // legacy ?tag=/?category= query URLs there so there's a single home per axis.
  if (filter.tag) redirect(`/tag/${tagToSlug(filter.tag)}`);
  if (filter.category) redirect(`/category/${filter.category.toLowerCase()}`);

  const activeMood = filter.mood;
  const { stories, total } = await getPublishedStoriesPage(0, filter);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: activeMood ? `${MOOD_LABELS[activeMood]} Stories` : "All Stories",
        description: STORIES_DESCRIPTION,
        url: absoluteUrl("/stories"),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: storyItemList(stories),
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Stories", path: "/stories" },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {/* Mood filter */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        <FilterChip href="/stories" active={!activeMood}>
          All
        </FilterChip>
        {MOODS.map((m) => (
          <FilterChip
            key={m}
            href={`/stories?mood=${m.toLowerCase()}`}
            active={activeMood === m}
          >
            {MOOD_LABELS[m]}
          </FilterChip>
        ))}
      </div>

      <InfiniteStoryFeed
        key={activeMood ?? "all"}
        initialStories={stories}
        total={total}
        mood={activeMood?.toLowerCase()}
        emptyMessage="Nothing here yet for this feeling."
      />
    </>
  );
}

function StoriesListFallback() {
  return (
    <>
      {/* Mood filter chips */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-[1.875rem] w-20 rounded-full border border-slate-900 bg-slate-900/40 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all ${
        active
          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
          : "border-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300"
      }`}
    >
      {children}
    </Link>
  );
}
