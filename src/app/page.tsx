import type { Metadata } from "next";
import { AmbientSound } from "@/components/ambient-sound";
import { LandingPage } from "@/components/landing-page";
import { NightGate } from "@/components/night-gate";
import { LandingSkeleton } from "@/components/skeletons/landing-skeleton";
import { getMoodTargets } from "@/lib/mood-targets";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "After 2AM Stories – Midnight Whispers & Late Night Confessions",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives. Choose your mood and discover stories written after 2AM.",
  alternates: {
    canonical: "https://after2am.stories", // Update with your actual domain
  },
};

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "After 2AM Stories",
  description:
    "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
  url: "https://after2am.stories", // Update with your actual domain
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

async function LandingPageWithTargets() {
  const moodTargets = await getMoodTargets();
  return <LandingPage moodTargets={moodTargets} />;
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <NightGate>
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
          <main className="grow flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out">
            <Suspense fallback={<LandingSkeleton />}>
              <LandingPageWithTargets />
            </Suspense>
          </main>

          <AmbientSound />

          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
      </NightGate>
    </>
  );
}