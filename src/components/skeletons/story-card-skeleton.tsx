export function StoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden p-8 rounded-3xl border border-slate-800 bg-slate-900/40 animate-pulse">
      {/* Background accent glow skeleton */}
      <div className="absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-10 bg-slate-700 rounded-full" />

      <div className="relative z-10">
        {/* Header skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-slate-800/50 rounded-full" />
            <div className="h-4 w-16 bg-slate-800/40 rounded" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-4 w-16 bg-slate-800/40 rounded" />
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div className="h-4 w-12 bg-slate-800/40 rounded" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="h-8 w-3/4 bg-slate-800/50 rounded mb-4" />

        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-8">
          <div className="h-5 w-full bg-slate-800/40 rounded" />
          <div className="h-5 w-5/6 bg-slate-800/40 rounded" />
          <div className="h-5 w-4/6 bg-slate-800/30 rounded" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-16 bg-slate-800/40 rounded-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/40">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-800/50" />
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-800/40 rounded" />
                <div className="h-2 w-16 bg-slate-800/30 rounded" />
              </div>
            </div>
          </div>
          <div className="h-4 w-24 bg-slate-800/40 rounded" />
        </div>
      </div>
    </div>
  );
}
