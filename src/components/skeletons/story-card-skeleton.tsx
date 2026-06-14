/**
 * Loading placeholder for <StoryCard>. Mirrors that card's shell — rounded-2xl
 * surface, mood/category eyebrow, serif title, three-line excerpt and the
 * footer meta row — so the layout doesn't shift when real cards stream in.
 */
export function StoryCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-7 backdrop-blur-sm animate-pulse">
      {/* Mood + category eyebrow */}
      <div className="flex items-center gap-2.5">
        <div className="h-2.5 w-20 rounded bg-muted/50" />
        <span className="h-1 w-1 rounded-full bg-border" />
        <div className="h-2.5 w-16 rounded bg-muted/40" />
      </div>

      {/* Title (one to two serif lines) */}
      <div className="space-y-2">
        <div className="h-6 w-5/6 rounded bg-muted/50" />
        <div className="h-6 w-2/3 rounded bg-muted/40" />
      </div>

      {/* Excerpt (line-clamp-3) */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-muted/30" />
        <div className="h-3.5 w-full rounded bg-muted/30" />
        <div className="h-3.5 w-4/5 rounded bg-muted/30" />
      </div>

      {/* Footer meta: author · read time · views · date */}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        <div className="h-2.5 w-16 rounded bg-muted/40" />
        <div className="h-2.5 w-12 rounded bg-muted/30" />
        <div className="h-2.5 w-10 rounded bg-muted/30" />
        <div className="h-2.5 w-14 rounded bg-muted/30" />
      </div>
    </div>
  );
}
