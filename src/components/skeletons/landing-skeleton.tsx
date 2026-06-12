export function LandingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 sm:px-6 text-center animate-fade-in">
      <div className="space-y-10 sm:space-y-14 w-full">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-3 w-24 mx-auto bg-muted/40 rounded animate-pulse" />
          <div className="h-10 w-36 mx-auto bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-4 w-48 mx-auto bg-muted/40 rounded animate-pulse" />
        </div>

        {/* Mood buttons skeleton */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[3.4rem] sm:h-16 w-full bg-card/30 border border-border/50 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Write button skeleton */}
        <div className="pt-2 sm:pt-3">
          <div className="h-11 w-44 mx-auto bg-card/30 border border-border/40 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
