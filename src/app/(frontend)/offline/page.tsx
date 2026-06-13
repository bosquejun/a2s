import type { Metadata } from "next";
import { MoonMark } from "@/components/moon-mark";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6 text-foreground">
      <MoonMark className="h-12 w-12 text-indigo-400" />
      <h1 className="font-serif italic text-3xl sm:text-4xl text-glow">
        You&rsquo;re offline
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The stories are still out there in the dark. Reconnect and they&rsquo;ll
        come back.
      </p>
      <a
        href="/"
        className="rounded-full border border-border/40 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:border-indigo-400/30 hover:text-foreground/80"
      >
        Try again
      </a>
    </div>
  );
}
