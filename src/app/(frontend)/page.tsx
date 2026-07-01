import { serializeJsonLd } from "@/lib/utils/json-ld";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AmbientSound } from "@/components/ambient-sound";
import { LandingPage } from "@/components/landing-page";
import { MostReadStories } from "@/components/most-read-stories";
import { NightGate } from "@/components/night-gate";
import { RecentStories } from "@/components/recent-stories";
import { SiteFooter } from "@/components/site-footer";
import { LandingSkeleton } from "@/components/skeletons/landing-skeleton";
import { StoryCardSkeleton } from "@/components/skeletons/story-card-skeleton";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives. Choose your mood and discover stories written after 2AM.",
  // Page-level `alternates` replaces the layout's object wholesale, so the
  // hreflang and RSS alternates must be restated here or the homepage loses them.
  alternates: {
    canonical: "/",
    languages: { "x-default": "/", en: "/" },
    types: { "application/rss+xml": "/feed.xml" },
  },
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: SITE_NAME,
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
  url: SITE_URL,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Haunting Stories",
        description: "Dark and haunting narratives",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Emotional Stories",
        description: "Stories about missing someone",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Confessional Stories",
        description: "Stories for when you can't sleep",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Thoughtful Stories",
        description: "Stories for when you feel empty",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Eerie Stories",
        description: "Surprising and eerie narratives",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionPageSchema),
        }}
      />
      <NightGate>
        <div className="relative min-h-screen text-foreground font-sans">
          {/* Hero — mood entry */}
          <section className="relative flex min-h-[88vh] flex-col items-center justify-center px-4 py-20">
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPage />
            </Suspense>

            {/* Scroll cue — the feed lives below the fold */}
            <a
              href="#lately"
              className="group absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground/80 animate-fade-in"
              style={{ animationDelay: "1400ms" }}
            >
              <span className="font-serif italic text-xs">or just read</span>
              <ChevronDown
                size={14}
                className="animate-bounce [animation-duration:2.5s]"
              />
            </a>
          </section>

          {/* Recent whispers feed */}
          <section
            id="lately"
            className="relative z-10 mx-auto w-full max-w-6xl scroll-mt-10 px-4 pb-20 sm:px-6"
          >
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <span className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground/50">
                Lately
              </span>
              <h2 className="font-serif text-2xl italic text-foreground/90 sm:text-3xl">
                Recent whispers
              </h2>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-border/80 to-transparent" />
            </div>

            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <StoryCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <RecentStories limit={6} />
            </Suspense>

            <div className="mt-12 flex justify-center">
              <Link
                href="/stories"
                className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-all hover:border-indigo-400/30 hover:text-foreground"
              >
                Browse all stories
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </section>

          {/* Most read — a serendipity lane; self-hides until there's signal */}
          <Suspense fallback={null}>
            <MostReadStories limit={3} />
          </Suspense>

          <SiteFooter />

          <AmbientSound />

          <div className="grain-overlay" aria-hidden="true" />
          <div className="pointer-events-none fixed left-[-10%] top-[-12%] h-[45%] w-[45%] rounded-full bg-indigo-500/8 blur-[130px] animate-drift" />
          <div
            className="pointer-events-none fixed bottom-[-12%] right-[-10%] h-[45%] w-[45%] rounded-full bg-violet-500/6 blur-[130px] animate-drift"
            style={{ animationDelay: "-9s" }}
          />
        </div>
      </NightGate>
    </>
  );
}
