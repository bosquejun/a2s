"use client";

import { getStoriesForMood } from "@/lib/data";
import { Mood } from "@/lib/database/generated/prisma/enums";
import { Story } from "@/validations/story.validation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  PenSquare,
  RefreshCw,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const baseMoodParam = searchParams.get("mood") as Mood | null;
  const baseMood = baseMoodParam ?? story.mood;

  const [isNoiseEnabled, setIsNoiseEnabled] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved =
      window.localStorage.getItem("after2am_reader_noise") === "true";
    setIsNoiseEnabled(saved);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setScrollProgress(0);
    setIsSharing(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
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

  const handleNext = () => {
    const options = getStoriesForMood(baseMood);
    const pool =
      options.length > 0 && options.some((s) => s.id !== story.id)
        ? options.filter((s) => s.id !== story.id)
        : options.length > 0
          ? options
          : [story];

    const index = Math.floor(Math.random() * pool.length);
    const nextStory = pool[index];

    router.push(
      `/story/${nextStory.id}?mood=${encodeURIComponent(baseMood as string)}`,
    );
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen relative overflow-hidden bg-slate-950 animate-fade-in selection:bg-indigo-500/20">
      <div className="fixed top-0 left-0 w-full h-[3px] z-50 bg-slate-900/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grow w-full overflow-y-auto overflow-x-hidden pt-24 pb-40 px-4 sm:px-6 md:px-12 scroll-smooth touch-pan-y mask-fade-bottom overscroll-contain"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="mb-10 sm:mb-12 flex flex-col items-center text-center space-y-6 sm:space-y-8 w-full">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold">
                <BookOpen size={12} className="opacity-70" />
                <span>{story.categories.join(", ")}</span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.4em] text-slate-500 font-medium">
                <Clock size={12} className="opacity-70" />
                <span>{story.readTime}</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-slate-100 italic leading-[1.1] text-glow tracking-tight">
              {story.title}
            </h1>

            <div className="flex items-center space-x-4 pt-4">
              <div className="h-[1px] w-12 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-[0.6em] text-slate-700 italic">
                Start Reading
              </span>
              <div className="h-[1px] w-12 bg-slate-800" />
            </div>
          </div>

          <div className="font-serif text-slate-300 text-xl sm:text-2xl md:text-3xl leading-[2.1] italic select-text pb-12 opacity-90 whitespace-pre-line drop-shadow-[0_2px_15px_rgba(248,250,252,0.03)]" dangerouslySetInnerHTML={{ __html: story.content }} />
          

          {story.author ? (
            <div className="mt-16 flex flex-col items-center space-y-3 opacity-40 pb-20">
              <div className="h-[1px] w-8 bg-slate-800 mb-2" />
              <p className="text-[10px] uppercase tracking-[0.6em] text-slate-500">
                Whispered by
              </p>
              <p className="text-sm font-serif italic text-slate-400">
                {story.author}
              </p>
            </div>
          ) : null}
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

          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-indigo-600 text-white shadow-[0_10px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] transition-all transform active:scale-95 group shrink-0"
          >
            <span className="text-xs uppercase tracking-[0.4em] font-bold whitespace-nowrap">
              More like this
            </span>
            <RefreshCw
              size={16}
              className="group-hover:rotate-180 transition-transform duration-700 opacity-80 shrink-0"
            />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-40" />
    </div>
  );
}


