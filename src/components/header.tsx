import { Button } from "@/components/ui/button";
import { featureFlags } from "@/lib/feature-flags";
import { MoonMark } from "@/components/moon-mark";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 sm:h-14 max-w-screen-xl items-center px-4 sm:px-6">
        <div className="mr-2 sm:mr-4 flex items-center min-w-0">
          <Link
            href="/"
            aria-label="After 2AM — home"
            className="mr-3 sm:mr-6 flex items-center gap-2 shrink-0"
          >
            <MoonMark className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
            <span className="hidden sm:inline-block font-serif italic tracking-wide text-base sm:text-lg">
              After <span className="text-indigo-400">2AM</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs sm:text-sm font-medium">
            <Link
              href="/stories"
              className="transition-colors hover:text-foreground/80 text-foreground/60 touch-manipulation"
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60 touch-manipulation"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 min-w-0">
          <nav className="flex items-center gap-2">
            {featureFlags.whisper && (
              <Link href="/write" className="touch-manipulation">
                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-3 sm:px-4">
                  <span className="hidden sm:inline">Write a Story</span>
                  <span className="sm:hidden">Write</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
