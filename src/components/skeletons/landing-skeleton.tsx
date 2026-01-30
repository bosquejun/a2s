export function LandingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-6 text-center animate-fade-in">
      <div className="space-y-16 w-full">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-32 mx-auto bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-4 w-48 mx-auto bg-slate-800/40 rounded animate-pulse" />
        </div>

        {/* Mood buttons skeleton */}
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-full bg-slate-900/10 border border-slate-900 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Write button skeleton */}
        <div className="pt-4">
          <div className="h-12 w-40 mx-auto bg-slate-900/20 border border-slate-900 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
