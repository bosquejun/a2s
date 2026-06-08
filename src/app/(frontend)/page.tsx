import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AmbientSound } from "@/components/ambient-sound";
import { LandingPage } from "@/components/landing-page";
import { NightGate } from "@/components/night-gate";
import { RecentStories } from "@/components/recent-stories";
import { LandingSkeleton } from "@/components/skeletons/landing-skeleton";
import { StoryCardSkeleton } from "@/components/skeletons/story-card-skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives. Choose your mood and discover stories written after 2AM.",
  alternates: {
    canonical: "https://after2amstories.com",
  },
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "After 2AM Stories",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
  url: "https://after2amstories.com",
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
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <NightGate>
        <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
          {/* Hero — mood entry */}
          <section className="flex min-h-[88vh] flex-col items-center justify-center px-4 py-20">
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPage />
            </Suspense>
          </section>

          {/* Recent whispers feed */}
          <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-32 sm:px-6">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <span className="text-[9px] uppercase tracking-[0.5em] text-slate-700">
                Lately
              </span>
              <h2 className="font-serif text-2xl italic text-slate-300 sm:text-3xl">
                Recent whispers
              </h2>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-800/60 to-transparent" />
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
                className="group inline-flex items-center gap-2 rounded-full border border-slate-900 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-slate-500 transition-all hover:border-indigo-500/30 hover:text-slate-200"
              >
                Browse all stories
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </section>

          <AmbientSound />

          <div className="pointer-events-none fixed left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-slate-500/5 blur-[120px]" />
        </div>
      </NightGate>
    </>
  );
}
