import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { StoryCardSkeleton } from "@/components/skeletons/story-card-skeleton";
import { StoryFeed } from "@/components/story-feed";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
import { MOODS, MOOD_LABELS, type Mood } from "@/lib/content/taxonomy";

export const metadata: Metadata = {
  title: "All Stories",
  description:
    "Browse every story written after 2am — sorted by the feeling that brought you here.",
  alternates: { canonical: "/stories" },
};

interface PageProps {
  searchParams: Promise<{ mood?: string }>;
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
  const { mood } = await searchParams;
  const requested = mood?.toUpperCase() as Mood | undefined;
  const activeMood =
    requested && MOODS.includes(requested) ? requested : undefined;

  const all = await getAllPublishedStories();
  const stories = activeMood
    ? all.filter((story) => story.mood === activeMood)
    : all;

  return (
    <>
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

      <StoryFeed
        stories={stories}
        emptyMessage="Nothing here yet for this feeling."
      />
    </>
  );
}

function StoriesListFallback() {
  return (
    <>
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-slate-900 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Loading…
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
