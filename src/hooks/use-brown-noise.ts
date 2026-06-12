"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Locally generated brown noise via the Web Audio API. Keeping the night
 * ambience synthesized on-device means no third-party audio CDN (smaller
 * CSP surface) and it works offline.
 */
export function useBrownNoise(storageKey: string, volume = 0.025) {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(storageKey) === "true";
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopNoise = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  }, []);

  const startNoise = useCallback(() => {
    if (typeof window === "undefined") return;

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
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
  }, [volume]);

  useEffect(() => {
    if (isEnabled) {
      startNoise();
    } else {
      stopNoise();
    }
    return stopNoise;
  }, [isEnabled, startNoise, stopNoise]);

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [storageKey]);

  return { isEnabled, toggle };
}
