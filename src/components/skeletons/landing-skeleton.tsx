/**
 * Loading placeholder for <LandingPage> (the home hero). Mirrors its column:
 * the clock eyebrow + "It's late." title + prompt, the six mood buttons, and
 * the "Whisper a story" pill — same widths and spacing so the hero doesn't
 * shift when it streams in.
 */
export function LandingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 sm:px-6 text-center animate-fade-in">
      <div className="space-y-10 sm:space-y-14 w-full">
        {/* Header: clock eyebrow, title, prompt */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted/40 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-muted/40 animate-pulse" />
          </div>
          <div className="h-9 sm:h-11 md:h-12 w-40 mx-auto rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-3 w-44 mx-auto rounded bg-muted/40 animate-pulse" />
        </div>

        {/* Mood buttons */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[3.25rem] sm:h-[3.75rem] w-full rounded-xl border border-border/50 bg-card/30 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* "Whisper a story" pill + tagline */}
        <div className="pt-2 sm:pt-3">
          <div className="h-11 w-44 mx-auto rounded-full border border-border/40 bg-background/40 animate-pulse" />
          <div className="mt-8 h-3 w-52 mx-auto rounded bg-muted/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
