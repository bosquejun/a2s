"use client";

import { Mood } from "@/lib/database/generated/prisma/enums";
import { PenSquare } from "lucide-react";
import Link from "next/link";

const MOOD_LABELS: Record<Mood, string> = {
  [Mood.CANT_SLEEP]: "I can't sleep",
  [Mood.DARK]: "I want something dark",
  [Mood.MISS_SOMEONE]: "I miss someone",
  [Mood.EMPTY]: "I feel empty",
  [Mood.REFLECTIVE]: "I feel reflective",
  [Mood.UNSETTLING]: "I feel uneasy",
};

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-4 sm:px-6 text-center animate-fade-in">
      <div className="space-y-12 sm:space-y-16 w-full">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-slate-400 font-serif italic text-2xl sm:text-3xl md:text-4xl tracking-tight">
            It&lsquo;s late.
          </h1>
          <p className="text-slate-600 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]">
            How do you feel right now?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {Object.keys(MOOD_LABELS).map((moodKey) => (
            <Link
              key={moodKey}
              href={`/mood/${moodKey.toLowerCase()}`}
              className="group relative w-full justify-center py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-slate-500 bg-slate-900/10 border border-slate-900 rounded-lg sm:rounded-xl hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/30 transition-all duration-300 active:scale-[0.98] inline-flex items-center touch-manipulation"
            >
              <span className="relative z-10">
                {MOOD_LABELS[moodKey as Mood]}
              </span>
            </Link>
          ))}
        </div>

        <div className="pt-3 sm:pt-4">
          <Link
            href="/write"
            className="group flex items-center justify-center space-x-2 sm:space-x-3 mx-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-slate-900 hover:border-indigo-500/30 transition-all duration-500 touch-manipulation"
          >
            <PenSquare
              size={13}
              className="sm:w-[14px] sm:h-[14px] text-slate-700 group-hover:text-indigo-400 transition-colors"
            />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-700 group-hover:text-slate-300 transition-colors">
              Whisper a story
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
