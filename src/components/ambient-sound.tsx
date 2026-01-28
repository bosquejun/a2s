"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AMBIENT_STORAGE_KEY = "after2am_ambient_global";
const AMBIENT_SRC =
  "https://assets.mixkit.co/active_storage/sfx/2381/2381-preview.mp3";

function getInitialIsPlaying(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AMBIENT_STORAGE_KEY) === "true";
}

export function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState<boolean>(getInitialIsPlaying);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(
    () => () => {
      // Cleanup when component unmounts.
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    },
    [],
  );

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(AMBIENT_SRC);
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;
    return audio;
  };

  const toggleSound = () => {
    if (typeof window === "undefined") return;

    const audio = ensureAudio();

    if (isPlaying) {
      audio.pause();
    } else {
      void audio
        .play()
        .catch(() => {
          // User interaction required for audio; ignore but keep toggle state unchanged.
          return;
        });
    }

    const nextState = !isPlaying;
    setIsPlaying(nextState);
    window.localStorage.setItem(AMBIENT_STORAGE_KEY, String(nextState));
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`fixed bottom-6 right-6 p-3 rounded-full transition-all duration-500 z-40 border ${
        isPlaying
          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          : "bg-slate-900/50 text-slate-600 hover:text-slate-400 border-slate-800/50"
      }`}
      aria-label="Toggle Global Night Ambience"
    >
      {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}
