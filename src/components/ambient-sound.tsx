"use client";

import { useBrownNoise } from "@/hooks/use-brown-noise";
import { Volume2, VolumeX } from "lucide-react";

const AMBIENT_STORAGE_KEY = "after2am_ambient_global";

export function AmbientSound() {
  const { isEnabled, toggle } = useBrownNoise(AMBIENT_STORAGE_KEY, 0.02);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 p-2.5 sm:p-3 rounded-full transition-all duration-500 z-30 border touch-manipulation backdrop-blur-sm ${
        isEnabled
          ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_24px_rgba(99,102,241,0.15)]"
          : "bg-card/50 text-muted-foreground/60 hover:text-muted-foreground border-border/60"
      }`}
      aria-label="Toggle Global Night Ambience"
      aria-pressed={isEnabled}
    >
      {isEnabled ? (
        <Volume2 size={14} className="sm:w-4 sm:h-4" />
      ) : (
        <VolumeX size={14} className="sm:w-4 sm:h-4" />
      )}
    </button>
  );
}
