import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "After 2AM Stories is a quiet place for late-night thoughts, confessions, and the things we only say when the world is asleep.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-600 transition-colors hover:text-slate-300"
        >
          <ArrowLeft size={12} />
          Home
        </Link>

        <h1 className="mt-12 font-serif text-3xl italic text-slate-100 sm:text-4xl">
          About
        </h1>

        <div className="mt-10 space-y-6 font-serif text-lg leading-relaxed text-slate-300/90 sm:text-xl">
          <p>
            After 2am is when the noise finally stops. The replies have dried
            up, the timeline has gone still, and what&rsquo;s left is whatever
            you were avoiding all day.
          </p>
          <p>
            This is a small, quiet place for those hours — late-night thoughts,
            confessions, and the kind of honesty that only shows up when the
            world is asleep. Some stories are written here; some are whispered
            in by people who couldn&rsquo;t sleep either.
          </p>
          <p>
            Nothing here is loud. No twists for the sake of twists. Just the
            ordinary, true-feeling weight of being awake when you shouldn&rsquo;t
            be.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <Link
            href="/stories"
            className="rounded-full border border-slate-900 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-slate-500 transition-all hover:border-indigo-500/30 hover:text-slate-200"
          >
            Read the stories
          </Link>
          <Link
            href="/write"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-900 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-slate-500 transition-all hover:border-indigo-500/30 hover:text-slate-200"
          >
            <PenSquare size={13} className="text-slate-700 group-hover:text-indigo-400" />
            Whisper a story
          </Link>
        </div>
      </div>
    </div>
  );
}
