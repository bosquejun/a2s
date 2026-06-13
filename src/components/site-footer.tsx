import { MoonStar } from "lucide-react";
import Link from "next/link";
import { featureFlags } from "@/lib/feature-flags";

/**
 * Quiet footer nav for the browsable pages (home, archive, mood, about).
 * Immersive surfaces (reader, write, track) intentionally omit it.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6">
      <div className="flex flex-col items-center gap-5 border-t border-border/40 pt-10 text-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-foreground/80"
        >
          <MoonStar size={13} aria-hidden="true" />
          <span className="font-serif italic text-sm tracking-wide">
            After 2AM
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          <Link
            href="/stories"
            className="transition-colors hover:text-foreground/80"
          >
            Stories
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80"
          >
            About
          </Link>
          {featureFlags.whisper && (
            <Link
              href="/write"
              className="transition-colors hover:text-indigo-300"
            >
              Whisper a story
            </Link>
          )}
        </nav>

        <p className="font-serif italic text-xs text-muted-foreground/40">
          Stories for the hours nobody sees.
        </p>
      </div>
    </footer>
  );
}
