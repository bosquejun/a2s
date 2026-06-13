"use client";

import { useBrownNoise } from "@/hooks/use-brown-noise";
import { featureFlags } from "@/lib/feature-flags";
import { Mood, MOOD_LABELS } from "@/lib/content/taxonomy";
import { Story, StorySummary } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Hash,
  PenLine,
  Shuffle,
  Share2,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface StoryReaderProps {
  story: Story;
  /** Similar stories surfaced in the "More like this" section. */
  related?: StorySummary[];
  /** Deterministic next story for the "Next story" CTA. */
  next?: StorySummary | null;
}

export function StoryReader({ story, related = [], next = null }: StoryReaderProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const baseMoodParam = searchParams.get("mood") as Mood | null;
  const baseMood = baseMoodParam ?? story.mood;

  const { isEnabled: isNoiseEnabled, toggle: toggleNoise } = useBrownNoise(
    "after2am_reader_noise"
  );
  const [isSharing, setIsSharing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const excludedParam = searchParams.get("exclude") ?? "";

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const container = event.currentTarget;
    const totalScroll = container.scrollHeight - container.clientHeight;
    if (totalScroll > 0) {
      const progress = (container.scrollTop / totalScroll) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // Reset state when pathname changes
    const timer = setTimeout(() => {
      setScrollProgress(0);
      setIsSharing(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareData = {
      title: `After 2AM: ${story.title}`,
      text: `Read this midnight whisper: "${story.excerpt}"`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setIsSharing(true);
        window.setTimeout(() => setIsSharing(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const excludedSlugs = useMemo(() => {
    const uniqueSlugs = Array.from(
      new Set([story.slug, ...(excludedParam.split(",") ?? [])])
    );
    return uniqueSlugs.join(",");
  }, [story.slug, excludedParam]);

  return (
    <div className="flex flex-col w-full h-screen max-h-screen relative overflow-hidden bg-background animate-fade-in">
      {/* Subtle progress indicator */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-card/40">
        <div
          className="h-full bg-gradient-to-r from-indigo-500/60 via-fuchsia-500/60 to-indigo-500/60 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grow w-full overflow-y-auto overflow-x-hidden pt-20 sm:pt-24 pb-40 px-4 sm:px-6 md:px-12 lg:px-16 scroll-smooth touch-pan-y mask-fade-bottom overscroll-contain"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center space-y-8 sm:space-y-10 w-full animate-fade-up">
            {/* Categories - improved elegant badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {story.categories.map((category) => (
                <div
                  key={category}
                  className="px-4 py-2 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 backdrop-blur-sm shadow-[0_2px_8px_rgba(99,102,241,0.1)] hover:border-indigo-500/40 transition-colors flex justify-center items-center"
                >
                  <span className="text-[10px] uppercase tracking-[0.25em] text-indigo-300/90 font-semibold text-center w-full">
                    {category.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            {/* Title with more intimate spacing */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground italic leading-[1.15] text-glow tracking-tight px-4 max-w-4xl text-balance">
              {story.title}
            </h1>

            {/* Metadata row - author first, then read time, then published date */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground/80">
              {story.author && (
                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
                  <User size={11} className="opacity-70" />
                  <span className="font-serif italic">{story.author}</span>
                </div>
              )}
              {story.author && <div className="h-3 w-px bg-border/70" />}
              <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
                <Clock size={11} className="opacity-60" />
                <span>{story.readTime} min</span>
              </div>
              {story.publishedAt && (
                <>
                  <div className="h-3 w-px bg-border/70" />
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
                    <Calendar size={11} className="opacity-60" />
                    <span>
                      {new Date(story.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Elegant divider */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-border/80 to-border/80" />
              <span className="text-[9px] uppercase tracking-[0.8em] text-muted-foreground/40 italic font-light">
                Begin
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-border/80 to-border/80" />
            </div>
          </div>

          {/*
            Story body. The HTML is sanitized server-side (sanitizeStoryHtml)
            before it reaches this component. Serif, roman type with a drop
            cap: italics are reserved for emphasis so long reads stay easy
            on the eyes.
          */}
          <div
            className="story-body w-full font-serif text-foreground/90 text-lg sm:text-xl md:text-[1.4rem] leading-[1.9] sm:leading-[1.95] select-text pb-12 px-2 sm:px-4 [&_p]:mb-7 [&_p:last-child]:mb-0 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:italic [&>p:first-of-type]:first-letter:text-[3.2em] [&>p:first-of-type]:first-letter:leading-[0.85] [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:text-indigo-200/90 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_em]:text-foreground/80 [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_h2]:font-serif [&_h2]:italic [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:font-serif [&_h3]:italic [&_h3]:text-xl [&_h3]:mt-10 [&_h3]:mb-3 [&_a]:text-indigo-300/90 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-indigo-500/40 [&_a:hover]:text-indigo-200 [&_code]:text-foreground/80 [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.8em] [&_code]:font-mono [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500/40 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-foreground/70 [&_blockquote]:my-8 [&_hr]:border-border/60 [&_hr]:my-10 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-7 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-7 [&_li]:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Closing mark */}
          <div
            className="flex items-center gap-3 text-muted-foreground/40 pb-4"
            aria-hidden="true"
          >
            <span className="h-px w-10 bg-border/60" />
            <span className="font-serif italic text-sm">fin</span>
            <span className="h-px w-10 bg-border/60" />
          </div>

          {/* Tags section - improved UI with badge styling */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-12 sm:mt-16 flex flex-col items-center space-y-4 pb-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center gap-1.5 text-muted-foreground/50">
                  <Hash size={13} className="opacity-50" />
                  <span className="text-[9px] uppercase tracking-[0.4em] font-medium">
                    Tags
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center max-w-2xl px-4">
                  {story.tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-card/60 border border-border/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* More like this — stories ranked by shared mood, categories, tags */}
          {related.length > 0 && (
            <section className="mt-2 w-full border-t border-border/40 pt-12 pb-8">
              <div className="mb-6 flex items-center justify-center gap-1.5 text-muted-foreground/50">
                <Sparkles size={13} className="opacity-50" />
                <span className="text-[9px] uppercase tracking-[0.4em] font-medium">
                  More like this
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/story/${item.slug}`}
                    className="group flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-card/30 px-5 py-4 backdrop-blur-sm transition-all hover:border-indigo-400/30 hover:bg-card/60"
                  >
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">
                      <span className="text-indigo-300/70">
                        {MOOD_LABELS[item.mood]}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1">
                        <Clock size={10} className="opacity-60" />
                        {item.readTime} min
                      </span>
                    </div>
                    <h3 className="font-serif text-lg italic leading-snug text-foreground/85 transition-colors group-hover:text-foreground">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/70">
                        {item.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-3 sm:p-4 md:p-6 lg:p-10 pointer-events-none z-50 safe-area-inset-bottom">
        <div className="py-2 max-w-5xl mx-auto flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between pointer-events-auto">
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 sm:gap-2.5">
            <Link
              href="/"
              className="p-2.5 sm:p-3 md:p-4 rounded-full bg-card/40 backdrop-blur-xl border border-border/50 text-muted-foreground hover:text-indigo-300 hover:border-indigo-500/30 transition-all group shrink-0 touch-manipulation"
              title="Return Home"
            >
              <ArrowLeft
                size={16}
                className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-0.5 transition-transform"
              />
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className={`p-2.5 sm:p-3 md:p-4 rounded-full bg-card/40 backdrop-blur-xl border transition-all group relative shrink-0 touch-manipulation ${
                isSharing
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "border-border/50 text-muted-foreground hover:text-indigo-300 hover:border-indigo-500/20"
              }`}
              title="Share this whisper"
            >
              <Share2
                size={16}
                className={`sm:w-[18px] sm:h-[18px] ${
                  isSharing ? "scale-90" : "group-hover:scale-110"
                } transition-all duration-300 ease-out`}
              />
              {isSharing ? (
                <span className="absolute -top-11 sm:-top-12 left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-1 bg-emerald-500 text-white text-[9px] sm:text-[10px] uppercase tracking-widest rounded shadow-lg animate-fade-in whitespace-nowrap z-50">
                  Link Copied
                </span>
              ) : null}
            </button>

            {next && (
              <Link
                href={`/mood/${baseMood.toLowerCase()}/random?exclude=${encodeURIComponent(excludedSlugs)}`}
                className="p-2.5 sm:p-3 md:p-4 rounded-full bg-card/40 backdrop-blur-xl border border-border/50 text-muted-foreground hover:text-indigo-300 hover:border-indigo-500/30 transition-all group shrink-0 touch-manipulation"
                title="Surprise me — a random story in this mood"
              >
                <Shuffle
                  size={16}
                  className="sm:w-[18px] sm:h-[18px] group-hover:rotate-12 transition-transform"
                />
              </Link>
            )}

            {featureFlags.whisper && (
              <Link
                href="/write"
                className="p-2.5 sm:p-3 md:p-4 rounded-full bg-card/40 backdrop-blur-xl border border-border/50 text-muted-foreground hover:text-indigo-300 hover:border-indigo-500/30 transition-all group shrink-0 touch-manipulation"
                title="Whisper a Story"
              >
                <PenLine size={16} className="sm:w-[18px] sm:h-[18px]" />
              </Link>
            )}

            <button
              type="button"
              onClick={toggleNoise}
              aria-pressed={isNoiseEnabled}
              className={`hidden md:flex items-center space-x-2 px-4 py-3 rounded-full backdrop-blur-xl border transition-all duration-700 shrink-0 ${
                isNoiseEnabled
                  ? "border-indigo-500/30 text-indigo-300 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                  : "border-border/50 text-muted-foreground/60 hover:text-muted-foreground bg-card/40"
              }`}
            >
              {isNoiseEnabled ? (
                <Volume2 size={18} className="animate-pulse" />
              ) : (
                <VolumeX size={18} />
              )}
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
                {isNoiseEnabled ? "Noise Active" : "Noise Muted"}
              </span>
            </button>
          </div>

          {next ? (
            <Link
              href={`/story/${next.slug}?mood=${baseMood.toLowerCase()}`}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 sm:space-x-3 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full bg-indigo-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 group shrink-0 touch-manipulation text-center"
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold whitespace-nowrap">
                Next story
              </span>
              <ArrowRight
                size={14}
                className="sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-300 opacity-80 shrink-0"
              />
            </Link>
          ) : (
            <Link
              href={`/mood/${baseMood.toLowerCase()}/random?exclude=${encodeURIComponent(excludedSlugs)}`}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 sm:space-x-3 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full bg-indigo-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 group shrink-0 touch-manipulation text-center"
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] font-bold whitespace-nowrap">
                Surprise me
              </span>
              <Shuffle
                size={14}
                className="sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-300 opacity-80 shrink-0"
              />
            </Link>
          )}
        </div>
      </div>

      <div className="grain-overlay" aria-hidden="true" />

      {/* Softer gradient fade at bottom */}
      <div className="fixed bottom-0 left-0 w-full h-40 sm:h-48 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-40" />
    </div>
  );
}
