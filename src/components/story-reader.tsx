"use client";

import { Mood } from "@/lib/database/generated/prisma/enums";
import { Story } from "@/validations/story.validation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Hash,
  PenSquare,
  RefreshCw,
  Share2,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const baseMoodParam = searchParams.get("mood") as Mood | null;
  const baseMood = baseMoodParam ?? story.mood;

  const [isNoiseEnabled, setIsNoiseEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("after2am_reader_noise") === "true";
  });
  const [isSharing, setIsSharing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const excludedParam = searchParams.get("exclude") ?? "";

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);


  const startNoise = () => {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") {
      return;
    }

    if (!audioContextRef.current) {
      const ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!ctor) return;
      audioContextRef.current = new ctor();
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.025;

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
  };

  const stopNoise = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  useEffect(() => {
    if (isNoiseEnabled) {
      startNoise();
    } else {
      stopNoise();
    }

    return () => {
      stopNoise();
    };
  }, [isNoiseEnabled]);

  const toggleNoise = () => {
    if (typeof window === "undefined") return;
    const next = !isNoiseEnabled;
    setIsNoiseEnabled(next);
    window.localStorage.setItem("after2am_reader_noise", String(next));
  };

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
    const uniqueSlugs = Array.from(new Set([story.slug, ...(excludedParam.split(",") ?? [])]));
    return uniqueSlugs.join(",");
  }, [story.slug, excludedParam])

  return (
    <div className="flex flex-col w-full h-screen max-h-screen relative overflow-hidden bg-slate-950 animate-fade-in selection:bg-indigo-500/20 selection:text-slate-100">
      {/* Subtle progress indicator */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-slate-900/30">
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
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center space-y-8 sm:space-y-10 w-full">
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
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-100 italic leading-[1.15] text-glow tracking-tight px-4 max-w-4xl">
              {story.title}
            </h1>

            {/* Metadata row - author first, then read time, then published date */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400/70">
              {story.author && (
                <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
                  <User size={11} className="opacity-70" />
                  <span className="font-serif italic">{story.author}</span>
                </div>
              )}
              {story.author && (
                <div className="h-3 w-px bg-slate-800/50" />
              )}
              <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
                <Clock size={11} className="opacity-60" />
                <span>{story.readTime} min</span>
              </div>
              {story.publishedAt && (
                <>
                  <div className="h-3 w-px bg-slate-800/50" />
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
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-800/60 to-slate-800/60" />
              <span className="text-[9px] uppercase tracking-[0.8em] text-slate-700/50 italic font-light">
                Begin
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-slate-800/60 to-slate-800/60" />
            </div>
          </div>

          {/* Story content with improved readability */}
          <div className="font-serif text-slate-200/90 text-lg sm:text-xl md:text-2xl lg:text-2xl leading-[2.2] sm:leading-[2.3] italic select-text pb-12 px-2 sm:px-4 whitespace-pre-line drop-shadow-[0_2px_20px_rgba(248,250,252,0.03)] [&_p]:mb-6 [&_p:last-child]:mb-0 [&_p]:indent-0 [&_p]:text-slate-200/90 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_strong]:not-italic [&_em]:not-italic [&_em]:text-slate-300/80 [&_h1]:text-slate-100 [&_h2]:text-slate-100 [&_h3]:text-slate-100 [&_h4]:text-slate-100 [&_a]:text-indigo-400/80 [&_a:hover]:text-indigo-300 [&_code]:text-slate-300 [&_code]:bg-slate-900/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-slate-700/50 [&_blockquote]:pl-4 [&_blockquote]:text-slate-300/80 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_li]:text-slate-200/90" dangerouslySetInnerHTML={{ __html: story.content }} />
          
          {/* Tags section - improved UI with badge styling */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-16 sm:mt-20 flex flex-col items-center space-y-4 pb-12">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-slate-800/50 to-transparent" />
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center gap-1.5 text-slate-600/60">
                  <Hash size={13} className="opacity-50" />
                  <span className="text-[9px] uppercase tracking-[0.4em] font-medium">
                    Tags
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center max-w-2xl px-4">
                  {story.tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm hover:border-slate-700/60 hover:bg-slate-900/80 transition-all duration-200"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400/80 font-medium">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 md:p-10 pointer-events-none z-50">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pointer-events-auto">
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2">
            <Link
              href="/"
              className="p-3 sm:p-4 rounded-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group shrink-0"
              title="Return Home"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className={`p-3 sm:p-4 rounded-full bg-slate-900/40 backdrop-blur-xl border transition-all group relative shrink-0 ${
                isSharing
                  ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "border-slate-800/50 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/20"
              }`}
              title="Share this whisper"
            >
              <Share2
                size={18}
                className={`${
                  isSharing ? "scale-90" : "group-hover:scale-110"
                } transition-all duration-300 ease-out`}
              />
              {isSharing ? (
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] uppercase tracking-widest rounded shadow-lg animate-fade-in whitespace-nowrap z-50">
                  Link Copied
                </span>
              ) : null}
            </button>

            <Link
              href="/write"
              className="p-3 sm:p-4 rounded-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group shrink-0"
              title="Whisper a Story"
            >
              <PenSquare size={18} />
            </Link>

            <button
              type="button"
              onClick={toggleNoise}
              className={`hidden md:flex items-center space-x-2 px-4 py-3 rounded-full backdrop-blur-xl border transition-all duration-700 shrink-0 ${
                isNoiseEnabled
                  ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.08)]"
                  : "border-slate-800/50 text-slate-600 hover:text-slate-400 bg-slate-900/40"
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

          <Link
            href={`/api/stories/mood/${baseMood}?exclude=${encodeURIComponent(excludedSlugs)}`}      
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-indigo-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 group shrink-0"
          >
            <span className="text-xs uppercase tracking-[0.4em] font-bold whitespace-nowrap">
              More like this
            </span>
            <RefreshCw
              size={16}
              className="group-hover:rotate-180 transition-transform duration-700 opacity-80 shrink-0"
            />
          </Link>
        </div>
      </div>

      {/* Softer gradient fade at bottom */}
      <div className="fixed bottom-0 left-0 w-full h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none z-40" />
    </div>
  );
}


