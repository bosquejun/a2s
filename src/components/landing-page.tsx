"use client";

import { Mood } from "@/lib/content/taxonomy";
import { MoonStar, PenLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MOODS: Array<{
  mood: Mood;
  label: string;
  whisper: string;
  hoverClass: string;
}> = [
  {
    mood: Mood.CANT_SLEEP,
    label: "I can't sleep",
    whisper: "for the restless",
    hoverClass:
      "hover:border-indigo-400/40 hover:shadow-[0_0_40px_-12px_rgba(129,140,248,0.35)]",
  },
  {
    mood: Mood.DARK,
    label: "I want something dark",
    whisper: "for the curious",
    hoverClass:
      "hover:border-rose-400/30 hover:shadow-[0_0_40px_-12px_rgba(251,113,133,0.3)]",
  },
  {
    mood: Mood.MISS_SOMEONE,
    label: "I miss someone",
    whisper: "for the longing",
    hoverClass:
      "hover:border-amber-300/30 hover:shadow-[0_0_40px_-12px_rgba(252,211,77,0.25)]",
  },
  {
    mood: Mood.EMPTY,
    label: "I feel empty",
    whisper: "for the hollow",
    hoverClass:
      "hover:border-slate-300/30 hover:shadow-[0_0_40px_-12px_rgba(203,213,225,0.25)]",
  },
  {
    mood: Mood.REFLECTIVE,
    label: "I feel reflective",
    whisper: "for the quiet",
    hoverClass:
      "hover:border-sky-300/30 hover:shadow-[0_0_40px_-12px_rgba(125,211,252,0.3)]",
  },
  {
    mood: Mood.UNSETTLING,
    label: "I feel uneasy",
    whisper: "for the unsettled",
    hoverClass:
      "hover:border-violet-400/40 hover:shadow-[0_0_40px_-12px_rgba(167,139,250,0.35)]",
  },
];

function useClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return time;
}

export function LandingPage() {
  const time = useClock();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 sm:px-6 text-center">
      <div className="space-y-10 sm:space-y-14 w-full">
        <div className="space-y-4 sm:space-y-5 animate-fade-up">
          <div className="flex items-center justify-center gap-2 text-muted-foreground/50">
            <MoonStar size={12} aria-hidden="true" />
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] tabular-nums min-h-[1em]">
              {time ? `it's ${time}` : " "}
            </span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground/90 text-glow">
            It&lsquo;s late.
          </h1>
          <p className="text-muted-foreground/70 text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em]">
            How do you feel right now?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {MOODS.map(({ mood, label, whisper, hoverClass }, index) => (
            <Link
              key={mood}
              href={`/mood/${mood.toLowerCase()}`}
              style={{ animationDelay: `${120 + index * 70}ms` }}
              className={`group relative w-full py-4 sm:py-5 px-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm text-muted-foreground transition-all duration-300 active:scale-[0.98] touch-manipulation animate-fade-up hover:bg-card/60 hover:text-foreground ${hoverClass}`}
            >
              <span className="block text-[11px] sm:text-xs tracking-[0.2em] uppercase">
                {label}
              </span>
              <span
                aria-hidden="true"
                className="block h-0 overflow-hidden font-serif italic normal-case tracking-normal text-[11px] text-muted-foreground/0 transition-all duration-300 group-hover:h-4 group-hover:mt-1 group-hover:text-muted-foreground/60"
              >
                {whisper}
              </span>
            </Link>
          ))}
        </div>

        <div
          className="pt-2 sm:pt-3 animate-fade-up"
          style={{ animationDelay: "640ms" }}
        >
          <Link
            href="/write"
            className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-7 py-3 rounded-full border border-border/40 bg-background/40 hover:border-indigo-400/30 hover:bg-card/40 transition-all duration-500 touch-manipulation"
          >
            <PenLine
              size={13}
              className="sm:w-[14px] sm:h-[14px] text-muted-foreground/50 group-hover:text-indigo-300 transition-colors"
            />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
              Whisper a story
            </span>
          </Link>
          <p
            className="mt-8 font-serif italic text-xs text-muted-foreground/40 animate-fade-in"
            style={{ animationDelay: "900ms" }}
          >
            Stories for the hours nobody sees.
          </p>
        </div>
      </div>
    </div>
  );
}
