/**
 * Loading placeholder for <StoryReader>. Mirrors its full-screen layout: top
 * progress bar, centered header (category pills → title → meta row → "Begin"
 * divider), the prose body, and the fixed bottom control dock — using the same
 * theme tokens and spacing so the reader doesn't jump when it hydrates.
 */
export function StoryReaderSkeleton() {
  return (
    <div className="flex flex-col w-full h-screen max-h-screen relative overflow-hidden bg-background animate-fade-in">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-card/40">
        <div className="h-full w-0 bg-muted/50" />
      </div>

      {/* Scrollable content */}
      <div className="grow w-full overflow-y-auto overflow-x-hidden pt-20 sm:pt-24 pb-40 px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center space-y-8 sm:space-y-10 w-full">
            {/* Category pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="h-8 w-24 rounded-full border border-border/50 bg-card/40 animate-pulse" />
              <div className="h-8 w-20 rounded-full border border-border/50 bg-card/40 animate-pulse" />
            </div>

            {/* Title */}
            <div className="space-y-3 w-full">
              <div className="h-10 sm:h-12 md:h-14 w-full max-w-xl mx-auto rounded-lg bg-muted/50 animate-pulse" />
              <div className="h-10 sm:h-12 md:h-14 w-2/3 max-w-md mx-auto rounded-lg bg-muted/40 animate-pulse" />
            </div>

            {/* Metadata row: author · read time · date */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="h-2.5 w-20 rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-px bg-border/70" />
              <div className="h-2.5 w-14 rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-px bg-border/70" />
              <div className="h-2.5 w-20 rounded bg-muted/40 animate-pulse" />
            </div>

            {/* "Begin" divider */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="h-px w-16 bg-border/60" />
              <div className="h-2.5 w-12 rounded bg-muted/40 animate-pulse" />
              <div className="h-px w-16 bg-border/60" />
            </div>
          </div>

          {/* Body — two staggered paragraphs of lines */}
          <div className="w-full space-y-4 pb-12">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-5 sm:h-6 w-full rounded bg-muted/30 animate-pulse"
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
            <div className="h-5 sm:h-6 w-3/5 rounded bg-muted/30 animate-pulse" />
          </div>

          {/* Closing mark */}
          <div className="flex items-center gap-3 pb-4" aria-hidden="true">
            <span className="h-px w-10 bg-border/60" />
            <div className="h-3 w-8 rounded bg-muted/30 animate-pulse" />
            <span className="h-px w-10 bg-border/60" />
          </div>
        </div>
      </div>

      {/* Fixed bottom control dock */}
      <div className="fixed bottom-0 left-0 w-full p-3 sm:p-4 md:p-6 lg:p-10 pointer-events-none z-50">
        <div className="py-2 max-w-5xl mx-auto flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between pointer-events-auto">
          {/* Left: circular controls + noise toggle */}
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 sm:gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-11 w-11 rounded-full border border-border/50 bg-card/40 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <div className="hidden md:block h-11 w-36 rounded-full border border-border/50 bg-card/40 animate-pulse" />
          </div>

          {/* Right: primary CTA */}
          <div className="h-11 sm:h-12 w-full sm:w-44 rounded-full bg-indigo-600/30 animate-pulse" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 w-full h-40 sm:h-48 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-40" />
    </div>
  );
}
