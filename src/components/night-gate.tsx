"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, type ReactNode } from "react";

interface NightGateProps {
  children: ReactNode;
}

export function NightGate({ children }: NightGateProps) {
  const dismissButtonRef = useRef<HTMLButtonElement | null>(null);

  const isClient = typeof window !== "undefined";
  const stored =
    isClient && window.localStorage.getItem("after2am_gate_passed");
  const hour = isClient ? new Date().getHours() : null;
  const isLate = typeof hour === "number" && hour >= 0 && hour < 5;
  const shouldPass = Boolean(stored === "true" || isLate);

  useEffect(() => {
    if (shouldPass) return;
    if (dismissButtonRef.current) {
      dismissButtonRef.current.focus();
    }
  }, [shouldPass]);

  const handleEnter = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("after2am_gate_passed", "true");
    // Hard refresh ensures we recompute the gate from storage.
    window.location.reload();
  };

  if (!isClient || shouldPass) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="night-gate-title"
      aria-describedby="night-gate-description"
    >
      <div className="max-w-sm space-y-6 animate-fade-up">
        <p
          id="night-gate-title"
          className="text-foreground font-serif italic text-2xl leading-relaxed text-glow"
        >
          “This feels better after midnight.”
        </p>
        <p
          id="night-gate-description"
          className="text-muted-foreground/70 text-xs uppercase tracking-[0.25em]"
        >
          It&apos;s not quite that late yet, but if you&apos;re awake,
          you&apos;re invited.
        </p>
        <Button
          ref={dismissButtonRef}
          type="button"
          variant="outline"
          className="mt-8 px-6 py-2 text-xs uppercase tracking-[0.2em] border-border/70 text-foreground/80 hover:text-foreground hover:border-indigo-400/40 rounded-full bg-card/30"
          onClick={handleEnter}
        >
          Let me in anyway
        </Button>
      </div>
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
